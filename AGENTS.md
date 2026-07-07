### 博文创建编辑

当你被要求创建博文或编辑博文时，你需要如下信息。

#### 博文文件

博文文件位于src/data/posts下，以博文ID为文件名。

#### index.yaml

index.yaml是博文的配置文件与列表，位于src/data/index.yaml。

需要注意，只有创建博文时需要编辑index.yaml，且编辑时不必理会length、editTimeStr、summary字段，它们会有专门程序负责。

### OI类文章编辑要求

#### 中括号样式

不涉及语法的中括号使用【】而非[]。

例如，正确示范：Luogu P2495 【SDOI2011】 消耗战，错误示范：Luogu P2495 [SDOI2011] 消耗战。

需要注意，涉及语法的中括号（比如链接、图片）仍然使用[]。