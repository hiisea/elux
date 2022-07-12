# 安装与配置

Elux 项目基于 node，推荐使用较新的 node 环境（>=14.0.0）

## 采用Cli命令初始化新工程

```bash
npm create elux@latest
```

或者

```bash
yarn create elux
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

## 家庭成员

针对不同框架与运行平台，Elux推出5个组合包，**它们保持统一的对外API**：

- [@elux/react-web](/api/react-web.html)
- [@elux/react-taro](/api/react-taro.html)
- @elux/react-rn //开发中...
- [@elux/vue-web](/api/vue-web.html)
- [@elux/vue-taro](/api/vue-taro.html)

其它辅助包均为脚手架或者Cli命令工具，非必需使用。你可以使用官方配置好的脚手架（基于Webpack5），可以建立自己的脚手架，选择以上5个组合包之一进安装。

## 关于Taro项目

模版中的Taro项目基于`Taro特定版本`制作，开箱即用，但可能版本滞后。如果想使用官方**最新版本**，也可以自己在Taro项目中安装Elux，参见[Taro小程序
](/guide/platform/taro.html#手动安装elux)
