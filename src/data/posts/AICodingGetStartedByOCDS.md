本系列文章用于分享我个人在使用AI Coding时的心得。

### 安装node.js运行时

AI Coding的很多软件都基于node.js。

node.js是一个JavaScript运行时环境，让你能在电脑上直接运行JavaScript代码，而不需要浏览器。大多数AI Coding工具（包括OpenCode）都是用JavaScript或TypeScript写的，所以必须先装好node.js。

1. 访问[node.js下载页面](https://nodejs.org/zh-cn/download)，下载**LTS版本**（长期支持版，更稳定）
   > Windows系统下建议通过页面下方的msi方式下载安装（因为docker在Windows下得配置WSL）
2. 双击安装包，一路点"下一步"即可完成安装
3. 打开终端，输入 `node -v` 和 `npm -v`，看到版本号就说明安装成功了

### 安装Windows Terminal

OpenCode是在终端中运行的软件，而Windows10及以下默认的终端（cmd和PowerShell 5.1）用起来确实不太顺手，比如不支持快捷键复制粘贴、字体渲染差劲、标签页管理也不方便。

Windows Terminal是微软官方推出的现代终端应用，解决了这些问题：

- **多标签页**：在一个窗口里开多个终端标签，切换方便
- **分屏**：左右或上下分屏，边看代码边操作
- **GPU加速渲染**：字体渲染清晰流畅，支持彩色图标和Git状态显示
- **高度可定制**：可以换主题、字体、背景图片、透明度
- **支持多种Shell**：cmd、PowerShell、WSL、Git Bash都能用

#### 安装方式（选一种即可）

- **Microsoft Store**：搜索"Windows Terminal"，点击安装（最简单省心）
- **GitHub Releases**：前往 [github.com/microsoft/terminal/releases](https://github.com/microsoft/terminal/releases) 下载最新版本

### （可选）使用Git Bash作为默认终端，并安装oh-my-bash插件

Git Bash是可选内容，虽能提升效率和终端美观，但建议把AI Coding的其它部分安装完后再折腾这一部分。

Windows自带的终端命令（cmd和PowerShell）和Linux/Mac上的命令有很多不同，比如文件路径用反斜杠、缺少`ls`、`cat`、`grep`等常用命令。而AI Coding的工具链主要在Unix-like环境下开发，使用Git Bash可以减少很多兼容性问题。

#### 安装Git

Git Bash是Git for Windows自带的bash环境，所以只需要安装Git就能获得Git Bash。

1. 访问 [git-scm.com](https://git-scm.com/)，下载Windows版安装包
2. 双击安装包，一路点"下一步"即可（默认选项已经配置得比较合理）
3. 安装完成后，在任意文件夹空白处右键，应该能看到 **"Git Bash Here"** 选项

> **提示**：安装过程中会问你选择默认编辑器，如果你不熟悉vim，建议改成Nano或VS Code，不然以后可能会被vim弄得一头雾水。

#### 将Git Bash设置为Windows Terminal的默认终端

1. 打开Windows Terminal，按 `Ctrl + ,` 打开设置
2. 左侧找到 **"启动"** -> **"默认配置文件"**，下拉查看是否有"Git Bash"
   - 如果有，直接选择"Git Bash"，保存后关闭并重新打开Windows Terminal即可
   - 如果**没有**，需要手动添加：在左侧点击 **"添加新配置文件"** -> **"新建空配置文件"**，名称填"Git Bash"，命令行填 `C:\Program Files\Git\bin\bash.exe`（这是默认安装路径，如果Git安装在其他路径，请相应修改），图标可以填 `C:\Program Files\Git\mingw64\share\git\git-for-windows.ico`（同上），然后保存，再回到"默认配置文件"下拉选择"Git Bash"
3. 关闭并重新打开Windows Terminal，默认就是Git Bash了

或者直接在设置界面点击Git Bash标签页，点击"设为默认"也行。

#### 安装oh-my-bash插件

原版的Git Bash提示符比较朴素，只显示当前路径。[oh-my-bash](https://github.com/oh-my-bash/oh-my-bash)是一个开源的Bash配置框架，可以提供更美观的提示符和更多实用功能：

- **Git状态分支显示**：提示符中直接显示当前所在分支、是否有未提交的修改
- **丰富的主题**：几十种颜色和样式可选
- **实用的别名（alias）**：比如`ll = ls -la`，减少重复输入
- **插件系统**：可启用`git`、`npm`、`node`等命令补全和快捷方式

安装方法很简单，在Git Bash中运行一条命令即可：

```bash
bash -c "$(curl -fsSL https://raw.githubusercontent.com/oh-my-bash/oh-my-bash/master/tools/install.sh)"
```

安装完成后会自动应用默认主题。如果想换主题，编辑 `~/.bashrc` 中的 `OSH_THEME` 值。个人推荐agnoster。

```bash
#Set name of the theme to load. Optionally, if you set this to "random"
#it'll load a random theme each time that oh-my-bash is loaded.
OSH_THEME="agnoster" #主题配置在这里
```

改完后重新打开终端，或者执行 `source ~/.bashrc` 即可看到新主题。

### 为什么选择OpenCode + DeepSeek

[OpenCode](https://github.com/opencode-ai/opencode) 是一个开源的AI Coding终端工具，它直接在你的终端中运行，支持接入多种大语言模型（LLM），包括DeepSeek、OpenAI、Claude等。

**OpenCode的优势：**

- **开源免费**：代码完全开源，可自行审查和修改
- **模型自由**：支持接入各种LLM，不锁定特定厂商
- **本地优先**：支持本地模型，数据不出本机
- **终端原生**：不依赖IDE，在任何编辑器/终端中都能使用

**DeepSeek的优势：**

- **性价比极高**：相比Claude和GPT，DeepSeek的API价格低一个数量级
- **中文友好**：对中文理解出色，适合中文开发者的需求
- **代码能力强**：在代码生成、理解和Debug方面表现优秀
- **超长上下文**：支持1M token上下文窗口，可一次处理大型代码库

### 安装OpenCode

装好node.js后，用npm全局安装OpenCode就行：

```bash
npm install -g @opencode-ai/opencode
```

`-g` 参数表示全局安装，这样你在任意目录下都能直接使用 `opencode` 命令。安装完成后验证一下：

```bash
opencode --version
```

输出版本号就说明装好了。如果提示找不到命令，可能是npm的全局安装路径没加到系统PATH里，重新打开终端试试，或者检查一下npm的bin目录配置。

### 配置OpenCode

在 `~/.config/opencode/opencode.jsonc`中配置：

```json
{
  "$schema": "https://opencode.ai/config.json",
  "provider": {
    "DeepSeek": {
      "npm": "@ai-sdk/openai-compatible",
      "name": "DeepSeek",
      "options": {
        "baseURL": "https://api.deepseek.com",
        "apiKey": ""//在此输入你的API Key，应从DeepSeek开放平台中获取
      },
      "models": {
        "deepseek-v4-flash": {
          "reasoningEffort": "max",//启用最强思考
          "name": "DeepSeek V4 Flash Thinking"
        },
      }
    }
  },
  "permission": {//配置OpenCode的操作行为
    "bash": "ask",
    "edit": {
      "*": "ask",//默认文件要求询问后再修改
      "src/**": "allow",//有Git兜底的文件，为了提升效率，允许自行修改
      "script/**": "allow"
    }
  },
}
```

> 上述配置只是配置文件的一部分。请勿整个复制粘贴，而是对照配置文件的各部分使用json语法写配置。

> API Key在[DeepSeek开放平台](https://platform.deepseek.com/)申请。

### AGENTS.md配置OpenCode行为

在`~/.config/opencode/`目录下添加`AGENTS.md`，这是OpenCode全局遵守的规则文件。

以下是我的示例：

```markdown
### 代码风格

1. 你应该尽可能写出4空格缩进的代码；
2. 你应该每隔几行写点注释标明一段程序的用途，且函数定义必有注释

### 使用语言

你应该尽可能使用中文。

### agent-todo

如果你的任务是从agent-todo目录下领取的，那么：

- `- [x]`代表已经完成的任务。
- `- [ ]`代表未完成的任务，完成任务后记得打上勾。
```

### 基本使用流程

配置完成后，**在项目目录**下打开终端，输入 `opencode` 即可启动交互式编程会话。

OpenCode能够自动读取相关文件、理解上下文，并在终端中直接显示修改建议。确认后它会直接修改文件，整个过程无需离开终端。