链接
===============

* 全局符号

1. 不能允许多个强符号出现
2. 一个强符号，多个弱符号，选强符号。
3. 多个弱符号，则任选一个. 

main.c:
{% highlight c %}
int base = 10;

int main() {
    add1();
    return 0;
}
{% endhighlight %}

add1.c:
{% highlight c %}
int base;

int
add1() {
    return base + 1;
}
{% endhighlight %}

规则3 是个大坑。

- 用显式赋值来表明为强符号(不要利用'未赋值的全局变量默认为0'这个特性): `int base = 0;`

- 用extern显式表明该变量为外部变量: `extern int base;`
`extern int base` 生成 `UNDEF` symobl, `int base` 生成 `COMMON` symbol.

* ELF
elf文件的类型:

      e_type      This member of the structure identifies the object file type:

                   ET_NONE     An unknown type.
                   ET_REL      A relocatable file.
                   ET_EXEC     An executable file.
                   ET_DYN      A shared object.
                   ET_CORE     A core file.

elf只记录全局变量，并丢掉了类型信息.

           typedef struct {
               uint32_t      st_name;
               Elf32_Addr    st_value;
               uint32_t      st_size;
               unsigned char st_info;
               unsigned char st_other;
               uint16_t      st_shndx;
           } Elf32_Sym;

- `st_info` 记录该symbol的类型和绑定属性，

 类型包括: FUNC, FILE, OBJECT等

 绑定属性包括: GLOBAL, LOCAL(即以static修饰的变量)

- `st_shndx` 记录该symbol存储的section。 比如1表示.text 3表示.data。 同时还有几个特殊的值:

    `ABS` 表示是绝对位置，不是相对section的位置，因此不能被重定位。

    `UNDEF` 表明未定义或无意义的符号。 这段代码可以生成 UNDEF symbol. 

    {% highlight c %}
                 void
                 foo() {
                     undef();
                 }
    {% endhighlight %}

    `COMMON` 还未被分配位置的数据。 _value_字段给出对齐要求, _size_给出最小大小。 这段代码生成COMMON symbol.

{% highlight c %}
int common;
{% endhighlight %}

* 重定位

* 动态链接
  链接器位置:

   objdump -s -j .interp a.out

  elf里只记录共享库的名字，而不是路径。 `ld --verbose | grep SEARCH_DIR` 查看搜索路径
  用 `-Wl,-rpath` 选项
  -L BUILD_CLIB_DIR -Wl,-rpath BUILD_CLIB_DIR

  

* 坑

- c允许函数未经声明就使用. 比如:

main.c:

{% highlight c %}
int
bar(int x, int y) {
    return x + y;
}

int
main() {
    foo();
}
{% endhighlight %}

foo.c:
{% highlight c %}
void foo() {
    bar();
}
{% endhighlight %}

居然能编译通过:

   gcc main.c foo.c

