---
layout: post
title: 向被对方关闭的socket写入时，如何避免收到SIGPIPE
tags: code
---

三种方法。

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

