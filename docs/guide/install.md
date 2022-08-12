# 安装Elux

Elux 项目基于 node，推荐使用较新的 node 环境（**>=14.0.0**）

## 采用Cli工程模版向导创建

```bash
npm create elux@latest
```

或者

```bash
yarn create elux
```

官方默认提供一个`简单增删改查`的工程模版（包括`H5页面`风格和`Admin后台管理系统`风格），里面写了**大量注释**，建议边看示例，边看文档，快速上手...

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

## 或直接找到Git地址Clone

例如基于`Elux+Antd`的后台管理系统：

- React版本：[Github](https://github.com/hiisea/elux-react-antd-admin) ｜ [Gitee](https://gitee.com/hiisea/elux-react-antd-admin-fork)
- Vue版本：[Github](https://github.com/hiisea/elux-vue-antd-admin) ｜ [Gitee](https://gitee.com/hiisea/elux-vue-antd-admin-fork)

::: tip 通常直接git clone的文件更新

Cli工程模版制作可能稍滞后于Git项目本身，另外对于优质的第三方项目，可以申请加入Cli工程模版，欢迎参与社区建设。

:::

## 安装依赖注意事项

- 国内推荐使用Gitee源，Github源在国内不是很稳定，可能需要翻墙。
- 由于模版中使用了`npm-workspace`，推荐使用yarn安装依赖，如果使用npm，请保证版本>=7
- 模版默认会拉取`lock文件`，这样会锁定各依赖版本，如果你比较激进，可以不使用它们。

## 关于Taro项目

模版中的Taro项目基于`Taro特定版本`制作，开箱即用，但可能版本滞后。如果想使用官方**最新版本**，也可以自己在Taro项目中安装Elux，参见[Taro小程序
](/guide/platform/taro.html#手动安装elux)

## 可以使用自己的脚手架吗？

当然可以，工程模版中的Taro项目，就是用的Taro官方的脚手架。

- 选择一个`elux组合包`，当作普通npm依赖安装：

  ```bash
  yarn add @elux/react-web
  ```

  根据平台和UI框架不同，目前推出5种组合包，它们基本保持一致的API：

  - [@elux/react-web](/api/react-web.html)
  - [@elux/react-taro](/api/react-taro.html)
  - [@elux/vue-web](/api/vue-web.html)
  - [@elux/vue-taro](/api/vue-taro.html)
  - @elux/react-rn //开发中...

- 注意支持`ES6装饰器`，例如Babel配置：

  ```js
  ['@babel/plugin-proposal-decorators', {legacy: false, decoratorsBeforeExport: true}],
  ['@babel/plugin-proposal-class-properties', {loose}],
  ```
