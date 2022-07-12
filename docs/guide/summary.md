---
prev: /designed/route-history.html
---

# Elux介绍

Elux不只是一个JS框架，更是一种基于“微模块”和“模型驱动”的跨平台、跨框架**同构方案**。它将稳定的业务逻辑与多样化的运行平台、UI框架进行剥离，让核心逻辑得到充分的简化、隔离和复用。

## 平庸的Elux

Elux其实很平庸，它既没有解决其它框架不能解决的问题，也没有发明创造一个新的技术栈，它的价值只是让传统的解决方案更松散一点，更通用一点，更简单一点。

Elux也没有什么高深的技术，复杂的代码，它带给大家的更多是面向“解耦”、面向“抽象”、面向“模块化”的前端思维新风向。

## 神奇的Elux

- 面向“解耦”，让Elux可以搭配React、搭配Vue、搭配更多第三方UI框架来进行开发。
- 面向“解耦”，让Elux可以运行在浏览器，运行在SSR服务器，运行在小程序，运行在手机App。
- 面向“解耦”，让Elux统一了Browser/小程序/App的路由风格，并与原生路由完美配合。
- 面向“解耦”，让Elux可以跨端、跨平台复用“核心业务逻辑”。
- 面向“解耦”，让Elux专注于自己的领域，包容与开放的融纳其它第三方框架。
  
## 简单的Elux

Elux应用范围很广，但并不妨碍它使用简单:

- 它使用既有技术栈，并不侵入、阉割与约束它们。  
- 它属于微框架，压缩后约几十K，小巧迷你。
- 它的所有顶级API也就30多个，并不复杂。
- 它提供开箱即用的脚手架和Cli工程向导，以及多套模版。

## Why Elux

 **~ 崇尚“解耦”的力量 ~**

现在你不用太纠结选型React还是Vue还是其它UI框架，因为UI层在Elux工程已经变得很薄，UI框架不再是工程的核心。

现在你也不必为了React而学习Redux、Redux-saga、Next，为了Vue而学习Vuex、Nuxt，为了微前端而学习Qiankun、Icestark...Elux可以使用一套方案搞定几乎所有平台：Web(浏览器)Micro(微前端)SSR(服务器渲染)MP(小程序)APP(手机应用)

另外不管你是否真的需要独立开发和部署微模块，以“微模块”的方式来架构我们的应用，让资源“高内聚、低耦合”，让工程保持清晰的脉络结构，提高代码的“可维护性和可复用性“，这才是广义上"微模块"能给我们的启迪。

如果有一天，在你使用了Elux后，感觉项目工程的条理似乎更清晰了一点，可维护性更高了一点，**渐进式重构**更容易一点，那么这都不是Elux的功劳，而是“解耦”的力量，是"模块化"带给这个世界的深刻变革...

---

## 快速上手

官方默认提供一个`简单增删改查`的Cli工程模版示例（包括`H5页面`风格和`Admin后台管理系统`风格），里面写了**大量注释**，以方便大家入手。

::: tip

建议边看示例，边看文档，快速上手...

:::

## 武装到牙齿的Typescript

如果某些框架号称`支持Typescript`、`拥抱Typescript`，那么Elux可以说是`武装到牙齿的Typescript`。无论是DispatchAction，还是隔离微模块、微应用，人类已经无法阻止Typescript的提示与校验...

## 不被抛弃的IE

Elux最低可兼容至 **IE10**（`需要UI框架本身支持`）

## 家庭成员

针对不同框架与运行平台，Elux推出5个组合包，**它们保持统一的对外API**：

- [@elux/react-web](/api/react-web.html)
- [@elux/react-taro](/api/react-taro.html)
- @elux/react-rn //开发中...
- [@elux/vue-web](/api/vue-web.html)
- [@elux/vue-taro](/api/vue-taro.html)

其它辅助包均为脚手架或者Cli命令工具，非必需使用。你可以使用官方配置好的脚手架（基于Webpack5），可以建立自己的脚手架，选择以上5个组合包之一进安装。

## 基本结构图

![elux静态结构图](/images/static-structure.svg)

## 基本逻辑图

![elux动态逻辑图](/images/dynamic-structure.svg)

## 工程结构举例

```text
├── env //可以定义多套不同的配置方案
│    ├── local //该目录中的内容可以覆盖../public和../elux.config.js
│    ├── test //该目录中的内容可以覆盖../public和../elux.config.js
│    └── online //该目录中的内容可以覆盖../public和../elux.config.js
├── dist //编译输出目录，按不同环境存放
│    ├── local 
│    ├── test 
│    └── online
├── mock //模拟API假数据
├── public //该目录下的文件将直接copy到dist
├── src
│    ├── assets //公用的图片等静态资源
│    ├── components //公用的UI组件
│    ├── modules
│    │      ├──  ModuleA
│    │      │     ├── assets //ModuleA专用的图片等静态资源
│    │      │     ├── components //ModuleA中用到的UI组件
│    │      │     ├── views //ModuleA中的业务视图
│    │      │     ├── entity.ts //ModuleA中用到的业务实体定义
│    │      │     ├── model.ts //ModuleA的业务模型
│    │      │     └── index.ts //ModuleA对外封装与导出
│    │      ├── ModuleB
│    │      └── ModuleC
│    ├── Global.ts //将一些常用方法和变量导出
│    ├── Project.ts //项目设置
│    └── index.ts //项目入口文件
├── elux.config.js //elux配置
├── package.json
```
