---
prev: /designed/route-history.html
---

# Elux介绍

::: tip Learn Once, Write Anywhere...

Elux不只是一个JS框架，更是一种跨平台、跨框架的**同构方案**。

:::

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

基于`Elux+Antd`的后台管理系统：

- React版本：[Github](https://github.com/hiisea/elux-react-antd-admin) ｜ [Gitee](https://gitee.com/hiisea/elux-react-antd-admin-fork)
- Vue版本：[Github](https://github.com/hiisea/elux-vue-antd-admin) ｜ [Gitee](https://gitee.com/hiisea/elux-vue-antd-admin-fork)

## 相关文章

- [从"微前端"到“微模块”](https://juejin.cn/post/7106791733509226533)
- [不想当Window的Dialog不是一个好Modal，弹窗翻身记](https://juejin.cn/post/7124177821953425422)
- [手撸Router，还要啥Router框架？让react-router/vue-router躺一边凉快去](https://juejin.cn/post/7124959667326812196)
- [一种比css_scoped和css_module更优雅的避免css命名冲突小妙招](https://juejin.cn/post/7129316859182710814)
