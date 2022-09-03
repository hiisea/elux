---
next: /guide/platform/ssr.html
---

# 微前端与微模块

微前端是一种泛称，Elux项目中使用颗粒度更小的`微模块`来实现微前端，参见[微模块](/designed/micro-module.html)。

在前面[《实例分析》](/guide/basics/example.html)中我们讲解了一个`单体工程`的实例，而微模块真正的魅力是可以多Team合作开发、独立上线、实现粒度更细的微前端。

假设我们有3个Team来合作开发这个项目，他们是微模块的**生产者**：

1. `basic-team` 负责开发模块：stage
2. `article-team` 负责开发模块：article、shop
3. `user-team` 负责开发模块：admin、my

- 每个Team都是一个独立工程，可以单独上线运行。
- 每个Team都将开发的微模块作为`npm包`发布到公司内部私有NPM仓库中。

另外还有2个Team根据业务需求来组合这些微模块，他们是微模块的**消费者**：

1. `app-build-team` 采用**静态编译**(node_modules)的方式集成
2. `app-runtime-team` 采用**动态注入**(module_federation)的方式集成

## 将微模块定义成NPM包

为了跨工程使用“微模块”，我们将微模块定义成NPM包。\
方法很简单：在每个微模块下面创建一个`package.json`。

```text
src
├── modules
│      ├── article
│      │     ├── ...
│      │     └── package.json
│      ├── shop
│      │     ├── ...
│      │     └── package.json
│      ├── my
│      │     ├── ...
│      │     └── package.json
│      ├── admin
│      │     ├── ...
│      │     └── package.json
│      └── stage
│            ├── ...
│            └── package.json
```

```json
//src/modules/article/package.json
{
  "name": "@test-project/article",
  "version": "1.0.0",
  "main": "index.ts",
  "peerDependencies": {
    "@test-project/stage": "*",
    "@elux/react-web": "*",
    "react": "*",
    "path-to-regexp": "*"
  }
}
```

## 使用Lerna+Monorepo管理

一个工程可以生产或消费多个“微模块”，我们使用`Lerna+Monorepo`工程结构来管理。各微模块开发好之后，使用Lerna来统一发布到私有NPM仓库。

注意，可以直接将各模块的`源码`发布，无需编译打包。

```json
//lerna.json
{
  "version": "1.0.0",
  "npmClient": "yarn",
  "useWorkspaces": true,
  "packages": [
    "src/modules/*"
  ]
}
```

## 修改Import路径

因为`src/modules/`下面的微模块都将发布到npm，所以在import路径上必需注意：

- 跨微模块import请使用真实的`npm包名`，不要使用`相对路径`或者`alias`；
- 微模块内部的相互import可以使用`相对路径`。

```ts
//跨微模块import使用`npm包名`，不使用`相对路径`或者`alias`
//import {mergeDefaultParams} from '@modules/stage/utils/tools';
import {mergeDefaultParams} from '@test-project/stage/utils/tools';
```

## basic-team工程

```text
src
├── modules
│      └── stage   //基座模块
├── Project.ts  //微模块源配置
└── index.ts    //App入口文件
```

## article-team工程

```text
src
├── modules
│      ├── shop    //商品模块
│      └── article //文章模块
├── Project.ts  //微模块源配置
└── index.ts    //App入口文件
```

## user-team工程

```text
src
├── modules
│      ├── my    //个人中心模块
│      └── admin //鉴权模块
├── Project.ts  //微模块源配置
└── index.ts    //App入口文件
```

## 组合微模块

以上3个Team负责生产微模块（积木），下面我们来看如何消费微模块（搭积木）。

在前文[《微模块》](/designed/micro-module.html)中我们说过，微模块的使用有2种方案：

- **静态编译**：微模块作为一个NPM包被安装到工程中，通过打包工具（如webpack）正常编译打包即可。这种方式的优点是代码产物得到打包工具的各种去重和优化；缺点是当某个模块更新时，需要整体重新打包。
- **动态注入**：利用`ModuleFederation`，将微模块作为子应用独立部署，与时下流行的微前端类似。这种方式的优点是某子应用中的微模块更新时，依赖该微模块的其它应用无需重新编译，刷新浏览器即可动态获取最新模块；缺点是没有打包工具的整体编译与优化，代码和资源容易重复加载或冲突。

![micro-install.png](https://p9-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/2160e004b35c4b3c967cf1b47dd49072~tplv-k3u1fbpfcp-watermark.image?)

### app-build-team工程

我们假设app-build-team使用`静态编译`方案来使用微模块。

1. 建立app-build-team工程，主要结构如下：

```txt
├── src
│    ├── Project.ts //微模块源配置
│    └── index.ts   //App入口文件
└── package.json    //写入微模块依赖
```

2. `npm install`所需的微模块：

```json
{
    "name": "app-build-team",
    "dependencies": {
        ...
        "@test-project/stage": "^1.0.0",
        "@test-project/article": "^1.0.0",
        "@test-project/shop": "^1.0.0",
        "@test-project/admin": "^1.0.0",
        "@test-project/my": "^1.0.0"
    },
}
```

3. 配置微模块源：

```ts
// src/Project.ts

import stage from '@test-project/stage';

export const ModuleGetter = {
  stage: () => stage, //通常stage为根模块，使用同步加载
  article: () => import('@test-project/article'),
  shop: () => import('@test-project/shop'),
  admin: () => import('@test-project/admin'),
  my: () => import('@test-project/my'),
};

```

4. 正常打包运行就好，跟单体工程的唯一区别就是：微模块代码来自于`node_modules`。

## app-runtime-team工程

Elux是一种将应用拆分为`微模块`的方案，而Module-Federation是一种远程加载`JS模块`的方案，将它们2者结合到一起，就创造了一种特别的“微前端”解决方案。

> 关于Module-Federation（模块联邦）的详细信息，请自行了解...

我们假设`app-runtime-team`借助Module-Federation来使用微模块。其工程结构与`app-build-team`基本一致，稍有变动如下：

1. 打开`elux.config.json`，配置ModuleFederation：

```ts
// elux.config.json
{
  moduleFederation: {
    name: 'app-runtime',
    modules: {
      '@test-project/article': '@article-team/modules/article',
      '@test-project/shop': '@article-team/modules/shop',
      '@test-project/admin': '@user-team/modules/admin',
      '@test-project/my': '@user-team/modules/my',
    },
    remotes: {
      '@article-team': 'articleTeam@http://localhost:4001/client/remote.js',
      '@user-team': 'userTeam@http://localhost:4002/client/remote.js',
    },
    shared: {
      'react': {singleton: true, eager: true, requiredVersion: '*'},
      'react-dom': {singleton: true, eager: true, requiredVersion: '*'},
      '@elux/react-web': {singleton: true, eager: true, requiredVersion: '*'},
    },
  },
}
```

2. 将原`src/index.ts`改名为`bootstrap.ts`，并重新建立`src/index.ts`

```ts
// src/index.ts
import bootstrap from './bootstrap';

bootstrap(() => undefined);
```

3. 同时运行article-team、user-team、app-runtime-team，可以看到各微模块的代码来自于线上`remote.js`。

## 源码示例

- 运行工程向导：`npm create elux@latest` 或 `yarn create elux`
- 选择`简单示例模板`
- 然后选择`基于Webpack5的微前端 + 微模块方案`

```text
? 请选择:平台架构 
  CSR: 基于浏览器渲染的Web应用 
  SSR: 基于服务器渲染 + 浏览器渲染的同构应用 
❯ Micro: 基于Webpack5的微前端 + 微模块方案 
  Model: 基于模型驱动，React与Vue跨项目共用Model 
  Taro: 基于Taro的跨平台应用（各类小程序） 
  RN: 基于ReactNative的原生APP（开发中...） 
```

> 示例为了演示方便，将各Team放在一个Monorepo工程中管理，实际中各Team是独立的工程。
