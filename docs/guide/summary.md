---
prev: /designed/route-history.html
---

# Elux介绍

Elux不只是一个JS框架，更是一种基于“微模块”和“模型驱动”的跨平台、跨框架**同构方案**。它将稳定的业务逻辑与多样化的运行平台、UI框架进行剥离，让核心逻辑得到充分的简化、隔离和复用。

## 万能的Elux

学会了基本的UI框架，如 React 和 Vue 就可以开发前端项目了吗？No，路由管理、状态管理、模块化开发、服务器渲染、微前端、企业级应用、跨端开发...，在每个细分领域都有一大波`框架之上的框架`在向你扑来。

_有没有一个框架能整合它们，让我少学一点呢？_

是的，**Elux**，它可以使用同一种思维模式、同一个工程结构、同一套核心代码，适配各种`不同UI框架`、运行在各种`不同平台`：

- Web（浏览器页面）:white_check_mark:
- SSR（服务器渲染）:white_check_mark:
- Micro（微前端）:white_check_mark:
- MP（小程序）:white_check_mark:
- APP（手机应用）:white_check_mark:

## 简单的Elux

Elux应用范围很广，但并不妨碍它使用简单:

- 它使用既有技术栈，并不侵入、阉割与约束它们。  
- 它属于微框架，压缩后约几十K，小巧迷你。
- 它的所有顶级API也就30多个，并不复杂。
- 它提供开箱即用的脚手架和Cli工程向导，以及多套模版。

## 武装到牙齿的Typescript

如果某些框架号称`支持Typescript`、`拥抱Typescript`，那么Elux可以说是`武装到牙齿的Typescript`。无论是DispatchAction，还是隔离微模块、微应用，人类已经无法阻止Typescript的提示与校验...

## 不被抛弃的IE

Elux最低可兼容至 **IE10**（`需要UI框架本身支持`）

## 快速上手

官方默认提供一个`简单增删改查`的Cli工程模版示例（包括`H5页面`风格和`Admin后台管理系统`风格），里面写了**大量注释**，以方便大家入手。

::: tip

建议边看示例，边看文档，快速上手...

:::

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
