### 零、前言

这道题既卡空间，又卡时间，还要维护一堆变量，属实毒瘤。

不过，这道题给出了很多子任务，也引导了我们做这道题。

那么，就开始吧。

> 任何一个伟大的思想，都有一个微不足道的开始。

### 一、不考虑修改

不考虑修改的话，就是一道大致为绿题难度的线段树题目。

不过，在合并线段树时，需要一点操作。

考虑这条算式：$1\times2\times3+4$。

线段树会分为很多段，这里我们分成 $2$ 段，其中左段是 $1\times2$，右段是 $3+4$。

显然，直接加上两段的结果是肯定不行的，因为我们要考虑运算的优先级。

我们发现，当两段中间的运算符为 $+$（代号 $0$）时，可以直接相加；否则，我们可以维护一段的**左端极长连乘段**和**右端极长连乘段**的结果。这样，在合并时，结果为**左段结果**加**右段结果**减**左段右端极长连乘段结果**减**右段左端极长连乘段结果**加**左段右端极长连乘段结果乘右段左端极长连乘段结果**。

在看下去之前，请您思考，如何合并左端极长连乘段结果和右端极长连乘段结果？思考题答案可以参见代码。

下表展示了我们应该维护的变量和示例。下表中“左段”、“右段”和“总段”的数字以上方的算式为例。

![](https://cdn.luogu.com.cn/upload/image_hosting/momece82.png)

注意，只有当对应算式的右侧没有运算符（本段右端点为 $n$）时，才不用存储运算符。

现在，我们可以把这个子任务的代码写下来了。接下来的子任务的代码可以在此基础上修改。

如果您还是有点懵，请参考我的代码：[点此传送](https://www.luogu.com.cn/paste/owri8kpo)。

恭喜！您现在已经获得了 $5$ 分的好成绩！

好，接下来，向黑题满分进发！

### 二、只修改运算符

我们可以维护一段算式右侧的运算符。显然最右端的段的右侧没有运算符，不过我们不必考虑这个，因为在代码中也不会调用。

我们多维护下表中的信息。示例算式与上一个子任务的算式相同，为 $1\times2\times3+4$。

![](https://cdn.luogu.com.cn/upload/image_hosting/8g6r8zu9.png)

现在，您可以把新增的代码写下来了。恭喜，您的成绩提升到了 $24$ 分。

### 三、修改数值

这是整道题最恶心的部分之一。

对于每个区段，我们可以维护一个 `vector`，单项类型为 `pair<int,int>`，用于存储若干个二元组 $(a,b)$。表示：长度为 $a$ 的连乘段，有 $b$ 个。合并时，可以使用归并算法，保持 `vector` 中每个二元组的第一项有序且唯一。

在修改运算符的时候，`vector` 将会被清空，再根据运算符更新它。请您思考，更新后的 `vector` 有多少项？两种运算符分别对应什么二元组？

这里给出思考的答案：

![](https://cdn.luogu.com.cn/upload/image_hosting/pfjrerm8.png)

更新的部分很好理解，这里给出核心代码：

```cpp
res.all.clear();//先清空总段，初始化。
Itor it1=a.all.begin(),it2=b.all.begin();//定义迭代器，Itor使用宏定义简化，对应vector<pair<int,int> >::iterator 。
Itor ed1=a.all.end(),ed2=b.all.end();
while(it1!=ed1&&it2!=ed2)//归并
{
	if((*it1).first<(*it2).first)
	{
		res.all.push_back((*it1));
		it1++;
	}
	else if((*it1).first>(*it2).first)
	{
		res.all.push_back((*it2));
		it2++;
	}
	else
	{
		res.all.push_back(make_pair((*it1).first,(*it1).second+(*it2).second));
		it1++;
		it2++;
	}
}
while(it1!=ed1)
{
	res.all.push_back(make_pair((*it1).first,(*it1).second));
	it1++;
}
while(it2!=ed2)
{
	res.all.push_back(make_pair((*it2).first,(*it2).second));
	it2++;
}
if(a.rop)//特殊处理中间的部分
{
	Itor it=lower_bound(res.all.begin(),res.all.end(),make_pair(a.rlen,0));
	it->second--;
	if(!(it->second))
	{
		res.all.erase(it);
	}
	it=lower_bound(res.all.begin(),res.all.end(),make_pair(b.llen,0));
	it->second--;
	if(!(it->second))
	{
		res.all.erase(it);
	}
	int nlen=a.rlen+b.llen;
	it=lower_bound(res.all.begin(),res.all.end(),make_pair(nlen,0));
	if(it!=res.all.end()&&(*it).first==nlen)//已有
	{
		(*it).second++;
	}
	else//新增
	{
		res.all.insert(it,make_pair(nlen,1));
	}
}
```

到了修改数值的时候，我们可以借助这些数据以及上面提到的数据重新算出 `sum`、`lsum`、`rsum` 等内容的值了。

恭喜，您已经有 $90$ 分了，接下来，准备优化吧！

### 四、优化

`vector` 还是太慢了点，我们可以改用数组。

但是，直接使用数组一定会空间超限。因此，对于每一段的连乘数据，我们分为两部分：

1. 连乘长度小于等于 $\sqrt{len}$。这些数据可以放在一个**使用 `new` 动态开出来的数组**里，既节省了时间，又节省了空间。

2. 连乘长度大于 $\sqrt{len}$。这些数据的数量不会大于 $\sqrt{len}$ 个，可以放在一个 `vector<int>` 里。思考：为什么每一项的类型从 `pair` 变成了 `int`？应如何修改代码？

连乘长度大于 $\sqrt{len}$ 时，这些数据的数量不会大于 $\sqrt{len}$ 个，时间复杂度不高。但是，如果再用 `pair` 的话，会占用太多空间。

此时，`vector<int>` 里的数据可以有重复了，一个数据的数值代表连乘长度，出现次数代表同一连乘长度出现的次数。当然，依然要有序。

我们注意到，代码里使用了幂来处理修改数值的情况，就像这样：

```cpp
void execvaldown(int o,long long x)
{
	x%=MOD;
	tree[o].lazyval=x;
	tree[o].addsum=x*tree[o].len%MOD;
	tree[o].mulsum=qpow(x,tree[o].len);//注意这行
	tree[o].lval=tree[o].rval=x;
	tree[o].lsum=qpow(x,tree[o].llen);//注意这行
	tree[o].rsum=qpow(x,tree[o].rlen);//注意这行
	tree[o].sum=0;
	Itor it=tree[o].all.begin();
	Itor ed=tree[o].all.end();
	while(it!=ed)
	{
		tree[o].sum+=qpow(x,(*it).first)*(*it).second%MOD;//注意这行
		tree[o].sum%=MOD;
		it++;
	}
}
```

这还不够。快速幂依然不够快，光速幂空间会炸。

可以发现，多次使用的幂，底数都是一样的。

因此，我们在代码里存储 `from`、`now` 和 `cache` 三个变量，保证 $from^{now}\bmod1000000007=cache$。这样，我们就可以在一次更新之内复用之前的运算结果。底数变化或 `now` 太大时，可以丢掉之前的缓存，重新计算。

我们可以改用快速读入和快速删除，进一步提速。

[这位神犇](https://www.luogu.com.cn/user/387840)告诉我，尽可能将函数放在结构体里，比如，下面两段代码，最下面的更快。我没有考证，大家看看就好。

```cpp
struct Tree
{
    int l,r;
    int sum;
}tree[105];
void update(o)
{
    tree[o].sum=tree[o<<1].sum+tree[o<<1|1].sum;
}
//调用时
update(1);
```

可以改成：

```cpp
struct Tree
{
    int l,r;
    int sum;
    void update(Tree &a,Tree &b)
    {
        sum=a.sum+b.sum;
    }
}tree[105];
//调用时
tree[1].update(tree[o<<1],tree[o<<1|1]);
```

最终代码放于[剪贴板](https://www.luogu.com.cn/paste/owri8kpo)末尾。

恭喜，您拿下了一道黑题！如果您有哪里困惑，欢迎私信交流。