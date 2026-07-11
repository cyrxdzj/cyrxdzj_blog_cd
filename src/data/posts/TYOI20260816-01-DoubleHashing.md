### 什么是哈希冲突？

哈希函数的作用是将一个字符串（或任意数据）映射为一个整数。由于哈希值空间远小于原数据空间，必然存在不同的字符串映射为同一个哈希值的情况，这就是**哈希冲突**。

在竞赛中，常用的单哈希（如模 $10^9+7$）存在被卡的风险——出题人可以构造数据使得大量不同字符串哈希值相同，导致程序出错。双哈希就是为了解决这一问题而设计的。

### 双哈希的核心思想

双哈希使用**两个不同的哈希函数**对同一字符串分别计算哈希值，只有当两个哈希值都相等时才认为两个字符串相等。这样，冲突概率约为两个哈希函数冲突概率的乘积，在两个模数都是 $10^{9}$ 量级的质数的情况下，冲突概率可低至 $10^{-18}$ 量级，在竞赛中可以认为是零冲突。

具体来说，我们选取两组不同的参数（模数 $M$ 和基数 $B$），对字符串 $S$ 分别计算：
- $Hash_1(S) = (\sum S[i] \times B_1^{len-i}) \bmod M_1$
- $Hash_2(S) = (\sum S[i] \times B_2^{len-i}) \bmod M_2$

这里采用的哈希算法将一个字符串视为一个多位数。

这里的字符串以1为下标起始。

### 哈希核心代码

这份代码可以方便地修改MOD数量。如果某些题目时间限制较严，可以关闭双哈希碰碰运气。

```cpp
const int MODCNT=2;
const long long BASE[2]={399,335};
const long long MOD[2]={1000000007,998244353};
long long bp[2][MAXN+5];//存储BASE的多次幂
struct Hash
{
    int len;
    long long data[2];
    Hash()
    {
        len=0;
        for(int i=0;i<MODCNT;i++)
        {
            data[i]=0;
        }
    }
    Hash(char a)
    {
        len=1;
        for(int i=0;i<MODCNT;i++)
        {
            data[i]=(long long)a;
        }
    }
};
Hash operator+(const Hash& a,char b)//向末尾添加字符串
{
    Hash res;
    res.len=a.len+1;
    for(int i=0;i<MODCNT;i++)
    {
        res.data[i]=(a.data[i]*BASE[i]+(long long)b)%MOD[i];
    }
    return res;
}
Hash operator+(Hash a,Hash b)//连接两个Hash
{
    Hash res;
    res.len=a.len+b.len;
    for(int i=0;i<MODCNT;i++)
    {
        res.data[i]=(a.data[i]*bp[i][b.len]+b.data[i])%MOD[i];
    }
    return res;
}
bool operator==(const Hash& a,const Hash& b)
{
    if(a.len==b.len)
    {
        for(int i=0;i<MODCNT;i++)
        {
            if(a.data[i]!=b.data[i])
            {
                return false;
            }
        }
        return true;
    }
    return false;
}
bool operator<(const Hash& a,const Hash& b)//定义小于运算以用于set存储
{
    if(a.len>b.len)
    {
        return false;
    }
    if(a.len<b.len)
    {
        return true;
    }
    for(int i=0;i<MODCNT;i++)
    {
        if(a.data[i]<b.data[i])
        {
            return true;
        }
        if(a.data[i]>b.data[i])
        {
            return false;
        }
    }
    return false;
}
int main()
{
    for(int i=0;i<MODCNT;i++)//计算BASE的多次幂
    {
        bp[i][0]=1;
        for(int j=1;j<=n;j++)
        {
            bp[i][j]=bp[i][j-1]*BASE[i]%MOD[i];
        }
    }
}
```

### 例题

#### 1. [Luogu P3370 【模板】字符串哈希](https://www.luogu.com.cn/problem/P3370)

本题要求判断n个字符串中有多少个不同的字符串。单哈希在极端数据下可能被卡，用双哈希+set可以稳妥解决。

#### 2. [P4503 【CTSC2014】 企鹅QQ](https://www.luogu.com.cn/problem/P4503)

给出N个长度均为L的字符串（$N\leq30000$，$L\leq200$），每个字符串互不相同。

求出多少对字符串是“相似”的。“相似”指两个字符串恰有1个位置不同。

本题可以存储每个字符串的哈希前缀和和哈希后缀和，然后枚举“是哪个位置不同（设位置为j）”，将j-1的哈希前缀和和j+1的哈希后缀和连接起来，用自定义Hash结构体（或pair）存储后放进unordered_map里统计（map会超时）。

但是Hash是自定义结构体，需要一个哈希函数来指示结构体在unordered_map里的存储位置。这个函数出现一些哈希冲突也没关系，unordered_map会处理的。

这里给出一个可用的哈希函数：

```cpp
struct HashHasher
{
    size_t operator()(const Hash& h) const
    {
        size_t seed = hash<int>()(h.len);
        for (int i = 0; i < MODCNT; i++)
        {
            seed ^= hash<long long>()(h.data[i]) + 0x9e3779b9 + (seed << 6) + (seed >> 2);
        }
        return seed;
    }
};
unordered_map<Hash,long long,HashHasher>mp;
```

另外注意，本题使用双哈希时哈希值需要用int存储，运算时临时改为long long，不然会爆空间。