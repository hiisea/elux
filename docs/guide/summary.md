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

## 案例分析

基于`Elux+Antd`的后台管理系统：

- React版本：[Github](https://github.com/hiisea/elux-react-antd-admin) ｜ [Gitee](https://gitee.com/hiisea/elux-react-antd-admin-fork)
- Vue版本：[Github](https://github.com/hiisea/elux-vue-antd-admin) ｜ [Gitee](https://gitee.com/hiisea/elux-vue-antd-admin-fork)

### 在线预览

<http://admin-react-antd.eluxjs.com/>

### 项目介绍

本项目主要基于`Elux+Antd`构建，包含`React`版本和`Vue`版本，旨在提供给大家一个**简单基础**、**开箱即用**的后台管理系统通用模版，主要包含运行环境、脚手架、代码风格、基本Layout、状态管理、路由管理、增删改查逻辑、列表、表单等。

## 更多相关文章

- [从"微前端"到“微模块”](https://juejin.cn/post/7106791733509226533)
- [不想当Window的Dialog不是一个好Modal，弹窗翻身记...](https://juejin.cn/post/7124177821953425422)
- [手撸Router，还要啥Router框架？让react-router/vue-router躺一边凉快去](https://juejin.cn/post/7124959667326812196)
