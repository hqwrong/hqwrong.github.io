---
layout: post
title: 门罗币技术要素
tag: code
mathjax: true
---

{% include toc.html %}

## 1. 椭圆曲线加密算法

椭圆曲线加密算法定义了一个不可逆运算 $$ \odot $$,

$$ K \odot G = P $$

已知 $$G$$,  **几乎不可能**由 $$P$$ 算出 $$K$$.

并且该运算满足:

- 结合律.

  $$ (A \odot B) \odot G = A \odot (B \odot G) $$

- 交换律.

  $$ A \odot B \odot G = B \odot A \odot G $$

- 分配律.

  $$ (A + B) \odot G = A \odot G + B \odot G $$

在加密应用中，G为已知，选择一个大数作为私钥 $$k$$, 公钥 $$P$$ 由 $$ P = k \odot G $$ 算出.


## 2. 隐身地址(Stealth Address)

隐身地址，使得真正的钱包地址不会出现在区块链上，取而代之的是一个虚假的地址, 并且不同的交易该虚假地址也不同.

因此人们不能仅通过观察区块链上的地址来获知某人钱包里的余额与流水。(可以与比特币的明文地址比较一下)

一个门罗币钱包由两对密钥组成，假设为 $$(a,A)$$ 和 $$(b,B)$$, 其中

$$ a \odot G = A $$

$$ b \odot G = B $$

钱包的地址由 $$A$$ 和 $$B$$ 构成。

### 2.1 交易流程

当Alice要向Bob付款时，

1. Bob将自己的钱包地址给Alice, Alice从该地址解出两个公开密钥: $$A$$ 和 $$B$$

2. Alice生成一个随机数 $$r$$, 并计算出 

   $$ R = r \odot G $$

   $$ S = \hbar(r \odot A) \odot G + B   \tag{1} $$

   其中，
   
   $$\hbar$$ 为约定的哈希算法.

   $$R$$ 和 $$r$$ 分别被称为交易公钥(Tx public key) 和 交易私钥(Tx private key), 因为 $$ r \odot G = R $$,

   $$ S $$ 为写在区块链上的交易地址, 因为不同的交易会生成不同的 $$r$$, 因此即使发向同一个钱包的两笔交易，
   写在区块链上的地址也是不相同的。

3. Alice将 $$R$$ 包含在交易数据里，该交易的目标地址为 $$S$$. Alice 向全网广播该交易。

4. Bob为了查看交易是否到账,他扫描区块链里的每一笔交易,计算

   $$ Q = \hbar(a \odot R) \odot G + B $$

   其中, $$R$$ 为每一笔交易里自带的数据, $$\hbar$$ 为约定的哈希算法.

   当发现 $$Q$$ 与该交易的目标地址 $$S$$ 相等时，该交易即为发给Bob钱包的交易. 

   因为,

   $$ a \odot R = a \odot (r \odot G) = r \odot (a \odot G) = r \odot A$$

   (这里其实是做了一次[DF Key Exchange](https://en.wikipedia.org/wiki/Diffie%E2%80%93Hellman_key_exchange))

5. Bob如果要花费这笔钱，需要生成一次性私钥,

   $$ K = \hbar(a \odot R) + b $$

   $$ K $$ 是隐身地址 $$ S $$ 的私钥，因为,

   $$ K \odot G = \hbar(a \odot R) \odot G + b \odot G = S $$

   Bob使用 $$K$$ 作为私钥来签名, 以证明他是该笔款项的拥有者.(该过程与比特币相似，这里不再赘述)
    
### 2.2 相关术语

- 付款证明

  如果Alice要向Bob证明她已经向地址 $$(A,B)$$ 付了款的话，她可以泄露出 $$r$$ 与交易ID.
  
  通过公式(1)算出来的地址如果与该交易的地址相同的话，即可证明.


- 只读钱包(view-only wallet)

  观察上面交易流程的第4步与第5步，发现验证交易是否到账的计算只用到了 $$a$$，而花掉这笔钱则同时需要 $$a$$ 和 $$b$$.

  因此人们可以把钱包的 $$a$$ 部分交给第三方，供审计或者观察该钱包进入的流水用，而不用担心第三方花掉该钱包里的钱.

  第三方通过 $$a$$ 创建的钱包，因为缺少 $$b$$ 部分，而不能花掉钱包里的钱, 被称为只读钱包.
 
  也因此，

  $$a$$ 被称为 (secret) view key,

  $$b$$ 被称为 (secret) spend key.

## 2. 隐蔽交易(Confidential Transaction)

## 3. 环签(Ring Signatures)
