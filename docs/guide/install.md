# 安装与配置

Elux 项目基于 node，推荐使用较新的 node 环境（>=14.0.0）

## 采用Cli命令安装

### 安装 @elux/cli-init

使用 npm 或者 yarn 全局安装 @elux/cli-init

```bash
npm install -g @elux/cli-init
```

::: tip 如果你不想全局安装，只是想看看案例，也可以一条命令搞定：

npx @elux/cli-init elux-init

:::

### 初始化新工程

在终端中执行 `elux-init` 即可开始新建工程向导...  
跟着向导一步步选择所需的工程模版即可...

```bash
elux-init
```

### 关于工程模版

官方默认提供一个`简单增删改查`的工程模版（包括`H5页面`风格和`Admin后台管理系统`风格），里面写了**大量注释**，建议边看示例，边看文档，快速上手...

1. 可以通过该模版理解框架的使用方法
2. 可以看看同一个工程在跨端、跨平台、跨UI框架下核心逻辑的复用
3. 可以基于这个工程模版快速建立自己的项目

```bash
? 请选择平台架构 CSR: 基于浏览器渲染的应用 [16P]
? 请选择UI框架 React [8P]
? 请选择CSS预处理器 Less [4P]
? 请选择模板 (Use arrow keys)
❯ Admin-react（路由前置） 
  H5-react（路由前置） 
  Admin-react（路由后置） 
  H5-react（路由后置） . 
```

### 安装依赖注意事项

- 推荐使用Gitee源，Github源在国内不是很稳定，可能需要翻墙。
- 由于模版中使用了`npm-workspace`，推荐使用yarn安装依赖，如果使用npm，请保证版本>=7
- 模版默认会拉取`lock文件`，这样会锁定各依赖版本，如果你比较激进，可以不使用它们。
- @types/react 类型文件最好只安装一个版本，多版本可能冲突。

## 关于Taro项目

模版中的Taro项目基于`Taro特定版本`制作，开箱即用，但可能版本滞后。如果想使用官方**最新版本**，也可以自己在Taro项目中安装Elux，参见[Taro小程序
](/guide/platform/taro.html#手动安装elux)
