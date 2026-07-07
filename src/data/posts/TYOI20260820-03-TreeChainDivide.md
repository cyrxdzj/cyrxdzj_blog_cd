### 先看一道题

[Luogu P3384 【模板】重链剖分/树链剖分](https://www.luogu.com.cn/problem/P3384)

这道模板题要求支持以下操作：

1. 求路径上所有节点的权值和；
2. 修改某个节点的权值；
3. 求子树内所有节点的权值和；
4. 修改子树内所有节点的权值。

### 朴素算法

对于路径查询，我们可以先求出LCA，然后从两个端点分别向上爬，统计沿途的节点信息。

单次查询时间复杂度 $O(n)$，太慢了。

### 引入：树链剖分

树链剖分的核心思想是将整棵树拆分为 $O(\log n)$ 条链，使得任意一条树路径都被划分到不超过 $O(\log n)$ 条链的区间并集上。然后我们就可以用线段树维护每条链上的信息，从而在 $O(\log^2 n)$ 时间内完成路径相关操作。

### 基本概念

#### 重儿子与轻儿子

对于一个有根树上的节点 $u$，其子树大小最大的子节点称为 $u$ 的**重儿子**，其余的子节点都称为**轻儿子**。

#### 重边与轻边

连接节点 $u$ 与其重儿子的边称为**重边**，与轻儿子的边称为**轻边**。

#### 重链

全部由重边组成的链称为**重链**。不在任何重链上的节点自己单独构成一条长度为1（以节点数量计）的重链。

这样，整棵树就被划分成了 $O(\log n)$ 条重链。为什么是 $O(\log n)$？因为每经过一条轻边，子树大小至少减半，所以从任意节点往上跳到根最多经过 $O(\log n)$ 条轻边，也就是最多跨越 $O(\log n)$ 条重链。

### 全局变量定义

```cpp
int fa[MAXN+5],dep[MAXN+5];
int sz[MAXN+5],hson[MAXN+5],top[MAXN+5];
int dfnl[MAXN+5],dfnr[MAXN+5],nid[MAXN+5],nowdfn;
```

其中 `dfnl[u]` 表示节点 $u$ 的DFS序，`dfnr[u]` 表示节点 $u$ 的子树中最大的DFS序，`nid[i]` 表示DFS序为 $i$ 的节点编号，`nowdfn` 为当前DFS序计数。

### 两个DFS

树链剖分的实现依赖两次DFS预处理。

#### 第一遍DFS

计算每个节点的子树大小（sz）、深度（dep）、父节点（fa）和重儿子（hson）。

```cpp
void pre(int u,int faa)
{
    fa[u]=faa;
    dep[u]=dep[faa]+1;
    sz[u]=1;
    for(int i=head[u];i;i=edge[i].next)
    {
        int v=edge[i].to;
        if(v==faa)
        {
            continue;
        }
        pre(v,u);
        sz[u]+=sz[v];
        if(sz[v]>sz[hson[u]])
        {
            hson[u]=v;
        }
    }
}
```

#### 第二遍DFS

按照先重儿子、再轻儿子的顺序第二次DFS。同时记录每个节点所在重链的顶端节点（top）、DFS序（dfnl）和子树最大DFS序（dfnr），并将DFS序映射回节点编号（nid）。

```cpp
void bc(int u,int t)
{
    top[u]=t;
    dfnl[u]=dfnr[u]=++nowdfn;
    nid[dfnl[u]]=u;
    if(hson[u])
    {
        bc(hson[u],t);
        dfnr[u]=dfnr[hson[u]];
        for(int i=head[u];i;i=edge[i].next)
        {
            int v=edge[i].to;
            if(v==fa[u]||v==hson[u])
            {
                continue;
            }
            bc(v,v);
            dfnr[u]=dfnr[v];
        }
    }
}
```

### 路径查询

现在假设我们要查询节点 $u$ 到节点 $v$ 的路径上的点权和。其核心思想是：每次把更深的链向上跳，直到两个节点处于同一条重链上。

1. 对比两个节点所在重链的顶端节点的深度。设 `dep[top[u]]` 更大，即u所在的链更深。
2. 此时 `top[u]` 到 `u` 一定是路径 `u→v` 的一段子路径，可以对这个区间进行线段树查询。
3. 将 $u$ 置为其所在链顶端的父节点，即 `u = fa[top[u]]`。
4. 重复以上过程，直到 `top[u] == top[v]`，此时两个节点在同一条重链上，直接查询 `dfnl[u]` 到 `dfnl[v]` 的区间即可。

```cpp
while(top[u]!=top[v])
{
    if(dep[top[u]]<dep[top[v]]) swap(u,v);
    // 现在u所在链的顶端更深，查询top[u]到u的区间
    ans+=query(1,dfnl[top[u]],dfnl[u]); // 在此处进行线段树区间查询
    u=fa[top[u]];
}
// 此时u和v已经在同一条重链上
if(dep[u]>dep[v]) swap(u,v);
ans+=query(1,dfnl[u],dfnl[v]); // 查询u到v的区间
```

### 复杂度分析

$dep[top[u]] < dep[top[v]]$ 每执行一次，都跨越了一条轻边。根据前面的分析，每次跨越轻边都会使子树大小至少减半，因此路径查询中需要处理的重链数为 $O(\log n)$。

每次重链查询都要在线段树中查询一个区间，单次查询时间复杂度为 $O(\log n)$。因此，路径查询的总时间复杂度为 $O(\log^2 n)$。

点修改的时间复杂度为 $O(\log n)$。子树查询和修改也只需对连续区间进行操作，复杂度为 $O(\log n)$（因为基于DFS序，一个节点的子树对应一个连续的区间）。

### 重链剖分与子树

由于重链剖分中优先遍历重儿子，重链上的节点在DFS序中是连续的。因此，一个节点 $u$ 的整个子树对应的DFS序范围为 $[dfnl[u], dfnr[u]]$。我们可以利用这一性质，高效完成所有模板题中的子树相关操作——子树查询和修改等价于对 $[dfnl[u], dfnr[u]]$ 区间进行线段树操作。

### 例题

#### 1. [Luogu P2486【SDOI2011】 染色](https://www.luogu.com.cn/problem/P2486)

本题可以用线段树维护一个区间的颜色段数、最左边的颜色、最右边的颜色，这样才可以在合并区间时计算合并后区间的颜色段数。

需要注意颜色段是有方向的，在树链剖分查询时如果要拼接区间，请注意这点。

### 习题

1. [Luogu P2146【NOI2015】 软件包管理器](https://www.luogu.com.cn/problem/P2146)
2. [Luogu P3979 遥远的国度](https://www.luogu.com.cn/problem/P3979)
