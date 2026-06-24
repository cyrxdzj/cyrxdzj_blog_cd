### 原题链接

[https://oiclass.com/d/tigao/p/1468](https://oiclass.com/d/tigao/p/1468)

### 简略做法

对于查询，首先我们发现，如下图，红色部分一定去u，绿色部分一定去v，蓝色部分去哪里无所谓。

<div style="width:33%;margin-left:33%;margin-right:33%;">
    <img src="/static/media/posts/oiClassTigao01468Solution/tree-example.webp"/>
</div>

因此，重点在于找到这个中间点。

虽然这棵树是无根树，但我们可以指定一个根。

首先，要求u的深度不能比v浅。这个做个`swap(u,v)`即可。设`f=lca(u,v)`。
然后，用倍增求出某个分割点（称为sp），使得sp在u、v路径上，且$dis(sp,v)-2\le dis(sp,u)<dis(sp,v)$。这样的点唯一存在，且一定在u、f路径上，且不等于f。

> 如果你已经对sp感到云里雾里了，请看下文“思维碎片：为什么sp是这么设置的？”。

容易发现，sp就是u、f路径上最浅的点，使得 $dis(sp,u)<dis(sp,v)$。此时 $dis(sp,v)-2\le dis(sp,u)$ 必然满足。

然后，sp的子树（包括自己）的同学，跑去u不会劣于跑去v；sp以外的同学，跑去v不会劣于跑去u。可能有些同学跑去u和v都一样。

接下来，我们给树上的点分配dfs序以配合线段树。使用dfs遍历，遍历过程中维护线段树，使之存储“所有点到当前点的最大距离”。然后离线更新“sp以内”和“sp以外”的情况。

关键代码：

```cpp
struct Que
{
	int u,v;
	int f,sp;//见上文
}que[MAXN+5];
vector<int>classu[MAXN+5],classv[MAXN+5];//把所有查询根据u的值、根据v的值分类。需要注意u、v有序。
void dfs(int u)
{
	for(int qid:classu[u])//对于所有u点为本点的查询：
	{
		ans[qid]=max(ans[qid],query(1,dfnl[que[qid].sp],dfnr[que[qid].sp]));//sp的子树的所有点到本点的最大距离？
	}
	for(int qid:classv[u])//对于所有v点为本点的查询：
	{
		if(dfnl[que[qid].sp]>1)
		{
			ans[qid]=max(ans[qid],query(1,1,dfnl[que[qid].sp]-1));
		}
		if(dfnr[que[qid].sp]<n)
		{
			ans[qid]=max(ans[qid],query(1,dfnr[que[qid].sp]+1,n));
		}
	}
    //出发前往子树的代码略。
}
int main()
{
    //略去一些代码。
	pre(1);//预处理dfs序。
	build(1,1,n);//构建线段树。
	io::read(q);
	for(int i=1;i<=q;i++)
	{
		io::read(que[i].u);
		io::read(que[i].v);
		if(dep[que[i].u]<dep[que[i].v])//u不能比v浅。
		{
			swap(que[i].u,que[i].v);
		}
		que[i].f=lca(que[i].u,que[i].v);
		int tu=que[i].u;
		for(int j=MAXF;j>=0;j--)//用倍增计算sp
		{
			int nu=fa[tu][j];
			if(dep[nu]<dep[que[i].f])//sp不能在f上方吧？
			{
				continue;
			}
			if(dep[que[i].u]-dep[nu]>=dep[nu]-dep[que[i].f]*2+dep[que[i].v])//sp到u的距离，应该小于sp到v的距离。
			{
				continue;
			}
			tu=nu;
		}
		que[i].sp=tu;
		classu[que[i].u].push_back(i);//分类。
		classv[que[i].v].push_back(i);
	}
	dfs(1);
	for(int i=1;i<=q;i++)
	{
		//printf("%lld\n",ans[i]);
		io::write(ans[i]);
		putchar('\n');
	}
}
```

### 思维碎片：为什么sp是这么设置的？

当u和v深度不相等时，并且u和v距离为偶数，那么在u、v路径上恰好存在一个点，使得它距离u和v相等。如上图，这个点就是3，而与3连通且不经过u、v路径的其它点（即蓝色部分），去u和v时间都一样。

> 在本文中，“不经过u、v路径”指**边**无重合，不考虑**点**的交叉。

当u和v深度不相等时，并且u和v距离为奇数，那么不存在点到u和v的距离相同。此时，u、v路径上有一条边恰好位于u、v中间，这条边不会有同学走过，而由于u深度更深，所以这条边**下**方的端点（就是sp）一定是靠近u的点，**上**方的端点一定是靠近v的点。这样，sp的子树（包括sp自己）上的同学一定去u点的机房，另外的同学一定去v点的机房。

但当u和v深度相等时，我发现了问题：u、v路径中点恰为f。此时，如果把sp设为f，我们难以向刚才那样划分子树。我们发现，f自己和与f连通却不经过u、v路径的其它点去u和v时间都一样。因此，我们干脆把这些同学让给v，把sp设为f的儿子。

为了简化代码，当u和v深度不相等时，并且u和v距离为偶数时，我们也把sp设为中间点旁边的一个点（在上图中就是4）。

综上，当u和v距离为偶数时，$dis(sp,v)-2=dis(sp,u)<dis(sp,v)$；当u和v距离为奇数时，$dis(sp,v)-2<dis(sp,v)-1=dis(sp,u)<dis(sp,v)$。

### 思维碎片：如何在遍历过程中维护距离最大值？

可以发现，假设当前点为u，准备出发前往儿子ch，那么ch下的所有点与下一个当前点（就是ch）的距离会下降1，ch以外的所有点与下一个当前点的距离会上升1.

如果我们给每个点分配一个dfs序，巧了么不是，这就是线段树区间查询与修改么。

关键代码：

```cpp
void build(int o,int l,int r)//构建线段树。
{
	tree[o].l=l;
	tree[o].r=r;
	if(l==r)
	{
		tree[o].mx=dep[id[l]]-1;//初始化每个点到树根的距离。点id[l]的dfs序为l。
		return;
	}
	int mid=(l+r)>>1;
	build(o<<1,l,mid);
	build(o<<1|1,mid+1,r);
	update(o);
}
//线段树其它代码略。
void pre(int u)//预处理dfs序。
{
	dfnl[u]=++now_dfn;//分配dfs序。
	dfnr[u]=dfnl[u];
	id[dfnl[u]]=u;//dfs序与点原始编号一一对应。
	dep[u]=dep[fa[u][0]]+1;
	for(int i=head[u];i;i=edge[i].next)
	{
		int v=edge[i].to;
		if(v==fa[u][0])
		{
			continue;
		}
		fa[v][0]=u;
		for(int j=1;j<=MAXF;j++)//构建倍增数组。
		{
			fa[v][j]=fa[fa[v][j-1]][j-1];
		}
		pre(v);
		dfnr[u]=dfnr[v];//记录本子树最大dfs序。
	}
}
void dfs(int u)
{
	for(int qid:classu[u])
	{
		ans[qid]=max(ans[qid],query(1,dfnl[que[qid].sp],dfnr[que[qid].sp]));//查询sp子树的所有点到本点的最大距离
	}
	for(int qid:classv[u])
	{
        //查询sp子树以外的所有点到本点的最大距离
		if(dfnl[que[qid].sp]>1)
		{
			ans[qid]=max(ans[qid],query(1,1,dfnl[que[qid].sp]-1));
		}
		if(dfnr[que[qid].sp]<n)
		{
			ans[qid]=max(ans[qid],query(1,dfnr[que[qid].sp]+1,n));
		}
	}
	for(int i=head[u];i;i=edge[i].next)
	{
		int v=edge[i].to;
		if(v==fa[u][0])
		{
			continue;
		}
		change(1,dfnl[v],dfnr[v],-2);//为减少代码，先减后加。先把目标子树的距离减去2，再把全部点的距离加上1.这样，目标子树的距离最后减去了1，目标子树以外的距离最后加上了1.
		change(1,1,n,1);
		dfs(v);
		change(1,1,n,-1);
		change(1,dfnl[v],dfnr[v],2);
	}
}
```