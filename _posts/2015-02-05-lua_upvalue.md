---
layout: post
title: 图解Lua upvalue的实现
tags: code
---

这几天在看lua的源码，看到upvalue这段，觉得很有意思，记录一下。

一个变量绑定，具有两个属性，作用域（scope）和生命期（extent)。Lua的是静态作用域(static scope);所谓静态，即变量名总是索引前面最近定义它的地方，看文本就能分析出来。当然，全局变量是个例外。 一个Lua
变量的生命期要到没有任何其他值索引它时才会结束。当一个外部变量被一个函数索引时，这个变量就被称为upvalue，函数就被称为闭包（closure）。

-----

- 如果函数b是函数a的子函数，那么b的upvalue要么是在a的local变量要么也是a的upvalue.

例如：
{% highlight lua %}
local function func0()
    local var1 = 0
    local var2 = 0
    local var3 = 0

    function func1()
        var1 = var1 + 1
        local function func2()
            var2 = var2 + 1
        end
        local function func3()
            var1 = var1 + 1
        end

        ...
    end
end
{% endhighlight %}

var1是func1的upvalue,同时是func1的上层函数func0的local变量。
var2是func2的upvalue, 也是func2的上层函数func1的upvalue。虽然func1不直接引用var2,但是它每一次的执行都会生成func2的closure，因此间接索引了var2.

- 变量与函数的索引关系是静态的，可以在文本里分析出来

Lua的分析upvalue的对应代码：
{% highlight c linenos %}
static int newupvalue (FuncState *fs, TString *name, expdesc *v) {
  Proto *f = fs->f;
  int oldsize = f->sizeupvalues;
  checklimit(fs, fs->nups + 1, MAXUPVAL, "upvalues");
  luaM_growvector(fs->ls->L, f->upvalues, fs->nups, f->sizeupvalues,
                  Upvaldesc, MAXUPVAL, "upvalues");
  while (oldsize < f->sizeupvalues) f->upvalues[oldsize++].name = NULL;
  f->upvalues[fs->nups].instack = (v->k == VLOCAL);
  f->upvalues[fs->nups].idx = cast_byte(v->u.info);
  f->upvalues[fs->nups].name = name;
  luaC_objbarrier(fs->ls->L, f, name);
  return fs->nups++;
}

static int singlevaraux (FuncState *fs, TString *n, expdesc *var, int base) {
  if (fs == NULL)  /* no more levels? */
    return VVOID;  /* default is global */
  else {
    int v = searchvar(fs, n);  /* look up locals at current level */
    if (v >= 0) {  /* found? */
      init_exp(var, VLOCAL, v);  /* variable is local */
      if (!base)
        markupval(fs, v);  /* local will be used as an upval */
      return VLOCAL;
    }
    else {  /* not found as local at current level; try upvalues */
      int idx = searchupvalue(fs, n);  /* try existing upvalues */
      if (idx < 0) {  /* not found? */
        if (singlevaraux(fs->prev, n, var, 0) == VVOID) /* try upper levels */
          return VVOID;  /* not found; is a global */
        /* else was LOCAL or UPVAL */
        idx  = newupvalue(fs, n, var);  /* will be a new upvalue */
      }
      init_exp(var, VUPVAL, idx);
      return VUPVAL;
    }
  }
}
{% endhighlight %}

注意15行里的递归, 如果既不是上层函数的local也不是上层函数的upvalue，那么它只能是全局变量。
字段idx记录这个upvalue在上层函数中的位置, instack表示这个位置是在栈上还是在上层upvalue中.

{% highlight c %}
static void pushclosure (lua_State *L, Proto *p, UpVal **encup, StkId base,
                         StkId ra) {
  int nup = p->sizeupvalues;
  Upvaldesc *uv = p->upvalues;
  int i;
  Closure *ncl = luaF_newLclosure(L, nup);
  ncl->l.p = p;
  setclLvalue(L, ra, ncl);  /* anchor new closure in stack */
  for (i = 0; i < nup; i++) {  /* fill in its upvalues */
    if (uv[i].instack)  /* upvalue refers to local variable? */
      ncl->l.upvals[i] = luaF_findupval(L, base + uv[i].idx);
    else  /* get upvalue from enclosing function */
      ncl->l.upvals[i] = encup[uv[i].idx];
  }
  luaC_barrierproto(L, p, ncl);
  p->cache = ncl;  /* save it on cache for reuse */
}
{% endhighlight %}

- 当一个函数执行完毕时，要把它栈上的子函数的upvalue拷贝出来，防止被回收。 比如func0执行完毕后的var1 和 var2. 

Lua用UpVal这个结构来保存upvalue的值。当这个值在栈上时，它的域v指向栈上的值;当栈要被回收时，则将栈上的值拷贝到域u中，并将v指向它。 对使用者来说这层拷贝是不透明的，他们只管取v指向的值。

{% highlight c %}
typedef struct UpVal {
  CommonHeader;
  TValue *v;  /* points to stack or to its own value */
  union {
    TValue value;  /* the value (when closed) */
    struct {  /* double linked list (when open) */
      struct UpVal *prev;
      struct UpVal *next;
    } l;
  } u;
} UpVal;
{% endhighlight %}

当upvalue值在栈上时，upvalue链在openupvalue上; 栈回收后，则从openvalue中去掉，改链到allgc上，参与垃圾回收。

对应代码是*luaF_close*， 
{% highlight c %}
void luaF_close (lua_State *L, StkId level) {
  UpVal *uv;
  global_State *g = G(L);
  while (L->openupval != NULL && (uv = gco2uv(L->openupval))->v >= level) {
    GCObject *o = obj2gco(uv);
    lua_assert(!isblack(o) && uv->v != &uv->u.value);
    L->openupval = uv->next;  /* remove from `open' list */
    if (isdead(g, o))
      luaF_freeupval(L, uv);  /* free upvalue */
    else {
      unlinkupval(uv);  /* remove upvalue from 'uvhead' list */
      setobj(L, &uv->u.value, uv->v);  /* move value to upvalue slot */
      uv->v = &uv->u.value;  /* now current value lives here */
      gch(o)->next = g->allgc;  /* link upvalue into 'allgc' list */
      g->allgc = o;
      luaC_checkupvalcolor(g, uv);
    }
  }
}
{% endhighlight%}

func0 执行中:
![func0 执行中](/images/upvalue_in_func0.png "func0 执行中")
func0 执行后:
![func0执行后](/images/upvalue_after_func0.png "func0 执行后")

