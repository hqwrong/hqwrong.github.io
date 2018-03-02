---
layout: post
title: 门罗币技术要素
tag: bitcoin
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

门罗币的隐身地址技术，使得真正的钱包地址不会出现在区块链上，取而代之的是一个虚假的地址, 即

**钱包地址与交易地址不同，并且不同交易的交易地址也不同**

因此人们不能通过分析区块链来获知某人钱包里的余额和流水。

一个门罗币钱包由两对密钥组成，假设为 $$(a,A)$$ 和 $$(b,B)$$, 其中

$$ a \odot G = A $$

$$ b \odot G = B $$

钱包的地址由 $$A$$ 和 $$B$$ 构成。

当Alice要向Bob付款时，

1. Bob将自己的钱包地址给Alice, Alice从该地址解出两个公开密钥: $$A$$ 和 $$B$$

2. Alice生成一个随机数 $$r$$, 并计算出 

   $$ R = r \odot G $$

   $$ S = \hbar(r \odot A) \odot G + B $$

   其中，$$\hbar$$ 为约定的哈希算法.

   $$ R $$ 被成为交易公钥(Tx public key), $$ r $$ 被称为交易私钥(Tx private key), 因为 $$ r \odot G = R $$

   $$ S $$ 为写在区块链上的交易地址, 因为不同的交易会生成不同的 $$r$$, 因此即使发向同一个钱包的两笔交易，
   写在区块链上的地址也是不相同的。

3. Alice将 $$R$$ 包含在交易数据里，该交易的其收款地址为 $$S$$. Alice 向全网广播该交易。

4. Bob为了查看交易是否到账,他扫描区块链里的每一笔交易,计算

   $$ Q = \hbar(a \odot R) \odot G + b $$

   其中, $$R$$ 为每一笔交易里自带的数据, a 和 b 为钱包的私密密钥, $$\hbar$$ 为约定的哈希算法.

   当发现 $$Q$$ 与该交易的目标地址 $$S$$ 相等时，该交易即为发给Bob钱包的交易. 

   因为,

   $$ a \odot R = a \odot (r \odot G) = r \odot (a \odot G) = r \odot A$$

5. Bob要话费这笔钱时，生成一次性私钥,

   $$ K = \hbar(a \odot R) + b $$

   $$ K $$ 是隐身地址 $$ S $$ 的私钥，因为,

   $$ K \odot G = \hbar(a \odot R) \odot G + b \odot G = S $$

   Bob使用K作为私钥来签名, 以证明他是该笔款项的拥有者.(该过程与比特币相似，这里不再赘述)
    

