# Elux介绍

Elux不只是一个JS框架，更是一种基于“微模块”和“模型驱动”的跨平台、跨框架**同构方案**。它将稳定的业务逻辑与多样化的运行平台、UI框架进行剥离，让核心逻辑得到充分的简化、隔离和复用。

## 平凡的Elux

Elux很平凡，它没有发明任何新的技术栈，也没有解决业内不能解决的问题，在它力所能及的领域你总能找到许多出色的同伴，它们在某些方面比Elux更专业，比如：

- 状态管理领域：redux/vuex
- 路由管理领域：react-router/vue-router
- SSR服务器渲染领域：nextjs/nuxtjs
- 微前端领域：qiankun/icestark
- 企业应用框架：umi/antd-pro
- 小程序领域：taro/uni-app

## 出彩的Elux :tada:

Elux确实没有解决任何新问题，但它让老问题的解决方式更友好一点，更简单一点。现在你可以不用学习上面那么多不同风格的中游框架（学不动了:grimacing:），而是用统一的解题思路，同一个工程结构，同一套核心代码让应用适配各种不同的UI框架、运行在各种不同平台：Web(浏览器页面) / SSR(服务器渲染) / Micro(微前端) / MP(小程序) / APP(手机应用)。

## 风格与技术栈

Elux推崇Web+的开发风格，使用既有技术栈：

- 开发语言：typescript
- 打包构建：webpack
- UI框架：react/vue
- CSS预处理：less/sass
- SSR服务器渲染：nodeJS
- 小程序：taro
- 手机APP(开发中)：reactNative

::: tip 强烈推荐Typescript

Elux拥有武装到牙齿的TS类型系统，虽然也可以用JS来开发项目，但这将失去它的独特魅力...

:::

## 浏览器兼容性

最低可兼容至IE10（需要UI框架本身支持，比如VUE3本身不支持IE）

## 成员生态

- @elux/react-web
- @elux/vue-web
- @elux/react-taro
- @elux/vue-taro
- @elux/cli
- @elux/cli-mock
