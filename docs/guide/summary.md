---
prev: /designed/route-history.html
---

# Elux介绍

::: tip Learn Once, Write Anywhere...

基于“微模块”和“模型驱动”的跨平台、跨框架『同构方案』

:::

## 一个问题

- **Q:** 多大级别的应用可以使用Elux？我就一个小工程需要使用“微模块+模型驱动”吗？
- **A:** 微模块是一种业务模块化方案，模型驱动是一种逻辑分层方案，与应用规模大小无关，它们让你的工程更有条理，并不增加额外维护成本。至于是否使用NPM管理微模块、是否使用Module Federation来实现“微前端”，这才需要根据应用级别考虑。

## 二大基石

- 微模块
- 模型驱动

## 三大面向

- 面向“高内聚、低耦合”
- 面向“分层而治”
- 面向“业务模块化”

## 四大创新

- 微模块
- 模型驱动
- 同时支持Mutable与Immutable的状态管理框架
- 同时支持Web/SSR/小程序/APP的双栈单链虚拟路由

## 六大应用场景

- CSR: 基于浏览器渲染的`Web单页`应用
- SSR: 基于服务器渲染+浏览器渲染的`同构`应用
- Micro: 基于ModuleFederation的`微前端`方案
- Model: 跨UI框架、跨项目`共用一套业务逻辑`的共享方案
- Taro: 基于Taro的跨平台应用（各类`小程序`）
- RN: 基于ReactNative的`原生APP`

## 十分简单

- 使用既有技术栈，不发明轮子，不修改轮子。  
- 微框架，压缩后约几十K，小巧迷你。
- 顶级API也就30来个。
- 提供开箱即用的脚手架，以及多套模版。

## 典型案例

简单`增删改查`的H5页面（SSR服务器渲染）：

- 在线预览：[http://h5-ssr.eluxjs.com](http://h5-ssr.eluxjs.com)

基于`Elux+Antd`的后台管理系统：

- 在线预览：[http://admin-react-antd.eluxjs.com/](http://admin-react-antd.eluxjs.com/)
- React版本：[Github](https://github.com/hiisea/elux-react-antd-admin) ｜ [Gitee](https://gitee.com/hiisea/elux-react-antd-admin-fork)
- Vue版本：[Github](https://github.com/hiisea/elux-vue-antd-admin) ｜ [Gitee](https://gitee.com/hiisea/elux-vue-antd-admin-fork)
