---
layout: post
title: 如何避免收到SIGPIPE时程序退出
tag: code
---

当向一个被对方关闭的fd写入时,程序会收到SIGPIPE. *nix的默认策略是退出, 如果你的程序不是shell utility的话, 这可能不是你想要的结果.

有三种方法刻意避免:

- 屏蔽掉SIGPIPE的handler(推荐)

    这个方法最通用

{% highlight c %}
#include <signal.h>
int sigign() {
	struct sigaction sa;
	sa.sa_handler = SIG_IGN;
	sigaction(SIGPIPE, &sa, 0);
	return 0;
}
{% endhighlight %}

- setsockopt(..., SO_NOSIGPIPE, ...)

    (不适用于linux)

- send(fd,buf,sz, MSG_NOSIGNAL)

    send 又不能用于普通fd，失去了抽象性


上面的方法都阻止SIGPIPE， 而是让写函数返回-1, 并将errno设为EPIPE.

