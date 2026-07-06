### 什么是线段树合并

字面意思，合并两棵线段树和它存储的信息。

一般被合并的线段树都是**动态开点**线段树，这样才能保证复杂度。

> 显然，对于两颗满的线段树，单次合并操作的复杂度是 $O(n)$ 的。但实际情况下使用的常常是权值线段树，所有需要合并的线段树的总点数和 $n$ 的规模相差并不大。并且合并时一般不会重复地合并某个线段树，所以我们最终增加的点数大致是 $n\log n$ 级别的。这样，合并所有线段树总的复杂度就是 $O(n\log n)$ 级别的。当然，在一些情况下，可并堆可能是更好的选择。
> ——[来自OI Wiki](https://oi-wiki.org/ds/seg-merge-split/)

两棵线段树的区间结构必须匹配。即，两棵线段树的根节点对应的区间必须相同，各节点（或因为没有数据而留空的节点空位）对应的区间也必须相同。

假设把线段树B合并到线段树A上，那么刚合并后（不进行写操作）将会有几点性质：

- A的信息是B的信息与原A的信息的合并；
- B的信息保持原样。

而进行写操作后，将会有几点性质：

- 若对A进行写操作，大概率破坏B的信息，导致B无法再使用；
- 若对B进行写操作，大概率破坏A的信息，导致A无法再使用。

### 如何进行线段树合并

我们可以采用递归算法进行合并。设我们要把线段树B合并到线段树A上，那么从两个线段树的根节点开始递归，对于某个子节点（无论是左、右节点），有可能有几种情况：

#### A不存在这个子节点

那就把B的这个子节点的指针给A就好。

如果B也不存在这个子节点，那么合并后A的这个子节点的指针依然为0（不存在）；如果B存在这个子节点，那么合并后A的这个子节点就是B的这个子节点。

#### A和B都存在这个子节点

递归下去进行合并。

#### A存在这个子节点，B却不存在

无需合并，无需操作。

子节点合并完成后记得将父节点的信息更新为两棵子节点的合并信息。

### 关键代码

```cpp
struct Tree
{
    int lo,ro;//左、右子节点的指针
    int l,r;//本节点的区间
    Data data;
    int cnt;
}tree[MAXN*200];//空间开大一点为好
void combine(int o1,int o2)//将o2指向的线段树合并到o1上
{
    if(tree[o1].l==tree[o1].r)//去到了叶子结点，那就将此节点的数据相加
    {
        tree[o1].data.v+=tree[o2].data.v;
        return;
    }
    if(tree[o1].lo==0)//o1没有左子节点
    {
        tree[o1].lo=tree[o2].lo;//那就直接用o2的
    }
    else if(tree[o1].lo!=0&&tree[o2].lo!=0)//o1和o2都有左子结点
    {
        combine(tree[o1].lo,tree[o2].lo);//递归合并
    }
    if(tree[o1].ro==0)//右子节点同理
    {
        tree[o1].ro=tree[o2].ro;
    }
    else if(tree[o1].ro!=0&&tree[o2].ro!=0)
    {
        combine(tree[o1].ro,tree[o2].ro);
    }
    update(o1);
}
```

### 例题

#### 1. [Luogu P3605 【USACO17JAN】 Promotion Counting P](https://www.luogu.com.cn/problem/P3605)

首先我们可以发现p的具体值不重要，使用离散化即可。这样可以降低后续合并线段树的时间复杂度。
  
然后用DFS遍历整棵树，先求出子树的信息（用权值线段树存储本子树下所有奶牛的能力值），再把子树的信息合并到节点中，即可求出本节点的信息。

#### 2. [Luogu P3521 【POI 2011】 ROT-Tree Rotations](https://www.luogu.com.cn/problem/P3521)

用线段树合并来从下到上地求出各节点的信息已不是难点，难点在于如何求出逆序对最小数量。

借用分治法求数组逆序对的思路，我们也可以用分治法，从下到上求出各个子树下的逆序对最小数量。

对于每个节点，我们可以求出“跨越此节点的逆序对最小数量”。而不跨越此节点的逆序对，子树会统计到。把所有节点的这个数字加起来，就是答案。

可以发现，交换某个节点的左右子树不会影响不跨越此节点的逆序对最小数量，计算“跨越此节点的逆序对最小数量”也不需要知道左右子树的具体结构，只需要用权值线段树维护左右子树的所有叶子权值即可求出跨越此节点的逆序对最小数量。

需要注意，本题的空间限制较为严格，线段树的每个节点只够存储3个信息：左节点编号、右节点编号、节点的计数总和，而且都要用int存，共12字节。

每在叶子结点执行change函数（计数增加）最多增加 $\log n$ 个线段树节点。

部分代码：

```cpp
long long calc_rev(int o1,int o2,int tl,int tr)//用权值线段树计算逆序对数量
{
    if(tree[o1].cnt==0||tree[o2].cnt==0)//某个节点总和为0，不必计算后面的了。
    {
        return 0;
    }
    if(tl==tr)//已到达叶子结点
    {
        return 0;
    }
    int mid=(tl+tr)>>1;
    long long res=0;
    res+=calc_rev(tree[o1].lo,tree[o2].lo,tl,mid);
    res+=calc_rev(tree[o1].ro,tree[o2].ro,mid+1,tr);
    res+=((long long)tree[tree[o2].lo].cnt)*((long long)tree[tree[o1].ro].cnt);
    return res;
}
void dfs(int u)//计算子树答案
{
    if(p[u])//如果这是叶子
    {
        change(rt[u],p[u],1,1,n);//那么就在权值线段树中增加技术
        return;
    }
    //如果这不是叶子
    dfs(ch[u][0]);//遍历子树
    dfs(ch[u][1]);
    long long sum=((long long)tree[rt[ch[u][0]]].cnt)*((long long)tree[rt[ch[u][1]]].cnt);//跨越本节点的数对的数量（逆序对+顺序对）
    long long rev=calc_rev(rt[ch[u][0]],rt[ch[u][1]],1,n);
    ans+=min(rev,sum-rev);//不交换与交换取最小值
    combine(rt[u],rt[ch[u][0]],1,n);//将子树的信息合并上来
    combine(rt[u],rt[ch[u][1]],1,n);
}
```

### 习题

1. [Luogu P3899 【湖南集训】 更为厉害](https://www.luogu.com.cn/problem/P3899)
2. [Luogu P3293 【SCOI2016】 美味](https://www.luogu.com.cn/problem/P3293)