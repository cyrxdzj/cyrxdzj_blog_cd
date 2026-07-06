### 先看一道题

[Luogu P3128 [USACO15DEC] Max Flow P](https://www.luogu.com.cn/problem/P3128)

如果我们开一个数组，统计经过每个节点的路径数量，我们应该怎么统计？

### 朴素算法

得出路径端点u和v的最近公共祖先f后，从u到f和从v到f，一个一个给中途的点增加统计。

时间复杂度 $O(NK)$，其中 $K$ 为路径数量。

单次路径统计的时间复杂度去到了 $O(n)$，倍增法求LCA省下来的时间全浪费了。

### 树链剖分

为什么要用大炮打蚊子？

### 树上差分

我们发现，本题不要求实时查询经过某个点的路径数量，只需程序的最后计算即可。

因此，对于下面这个路径示例（左），我们可以这么统计（右）：

<div style="display:table-row;">
    <div style="display:table-cell;">
        <img src="/static/media/posts/TYOI20260820-02-DiffOnTree/tree-example-path-1.png"/>
    </div>
    <div style="display:table-cell;">
        <img src="/static/media/posts/TYOI20260820-02-DiffOnTree/tree-example-path-2.png"/>
    </div>
</div>

绿色代表“计数增加”，红色代表“计数减少”。

我们把一条路径拆分为了 $4$ 个操作，但眼尖的同学们一定发现了：每一条操作，端点必为根。这样，我们就有一个性质：设点a、u为树上的任一点，点v为树根，则a在u和v的路径上，当且仅当u在a的子树中。

有了这个性质，我们就可以在输入路径时，只在4个关键点（2个端点、LCA、LCA的父亲）进行计数增加/减少操作，输入结束后使用DFS统计子树和。

关键代码：

```cpp
int sum[MAXN+5];//计数数组
void dfs(int u,int faa)//程序的最后运行，用于统计子树和
{
    for(int i=head[u];i;i=edge[i].next)
    {
        int v=edge[i].to;
        if(v==faa)
        {
            continue;
        }
        dfs(v,u);
        sum[u]+=sum[v];
    }
    ans=max(ans,sum[u]);//得到最大的答案
}
int main()
{
    //...
    //输入边
    for(int i=1;i<=m;i++)
    {
        int u,v;
        scanf("%d%d",&u,&v);
        int f=lca(u,v);
        sum[u]++;
        sum[v]++;
        sum[f]--;
        sum[fa[f]]--;
    }
    dfs(1,0);
    //...
}
```

### 习题

1. [Luogu P3258 【JLOI2014】 松鼠的新家](https://www.luogu.com.cn/problem/P3258)
2. [Luogu P2680 【NOIP 2015 提高组】 运输计划](https://www.luogu.com.cn/problem/P2680)