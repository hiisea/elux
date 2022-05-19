---
next: /guide/basics/summary.html
---

# 项目配置

## web项目配置

web项目使用的基于webpack5封装的脚手架，配置文件为`/elux.config.js`，目前支持以下选项：

```ts
//环境配置，可以为dev(开发环境)和prod(生产环境)分别给予不同配置
interface EnvConfig {
  clientPublicPath: string; //发布目录，默认 /client/
  clientGlobalVar: Record<string, any>; //全局变量，默认 {}
  serverGlobalVar: Record<string, any>; //[SSR]服务端全局变量，默认 {}
  //以上2个全局变量通过process.env.PROJ_ENV，由webpack.DefinePlugin编译到代码中
  defineConstants: Record<string, string>; //自由定义webpack.DefinePlugin替换对象，默认 {}
  //以上例如：defineConstants: {'process.env.CUSTOM': JSON.stringify({aaa: 1})}
  onCompiled: () => void; //webpack编译完成钩子，默认 无
  sourceMap: string; //对应用webpack devtool配置，默认 dev:'eval-cheap-module-source-map'; prod:'hidden-source-map'
  cache: boolean | Record<string, any>; //对应webpack cache配置，默认 true
  eslint: boolean; //是否实时eslint检查，默认 true
  stylelint: boolean; //是否实时stylelint检查，默认 true
  clientMinimize: boolean; //是否压缩代码（仅对prod有效，dev始终为false），默认 true
  serverMinimize: boolean; //[SSR]是否压缩服务端代码（仅对prod有效，dev始终为false），默认 false
  resolveAlias: Record<string, string>; //对应webpack resolve.alias，默认 {}
  urlLoaderLimitSize: number; //对应webpack dataUrlCondition.maxSize，默认 4096
  apiProxy: Record<string, {target: string}>; //对应webpack devServer.proxy，默认 {}
  serverPort: number; //对应webpack devServer.prot，默认 4003
  webpackConfigTransform: (config: WebpackConfig) => WebpackConfig; //完全自定义webpack配置
  //以上可通回调函数自由修改webpack配置，利用config.name可以区分是否是[SSR]
}

//项目配置
interface EluxConfig {
  type: 'vue' | 'react' | 'vue ssr' | 'react ssr'; //项目类型，默认 空
  mockServer: {port: number; dir: string;}; //mock假数据配置，不需要假数据可以不配置，默认 {dir: './mock', port: 3003}
  srcPath: string; //源代码目录，默认 ./src
  distPath: string; //编译产出目录，默认 ./dist
  publicPath: string; //静态文件目录，默认 ./public
  //css预处理配置，参见less-loader和sass-loader，默认 {less: false, sass: false}
  cssProcessors: {less: Record<string, any> | boolean; sass: Record<string, any> | boolean};
  cssModulesOptions: Record<string, any>; //对应css-loader.modules，默认 {}
  moduleFederation: Record<string, any>; //webpack5 模块联邦配置，参见本站‘微模块’章节，默认 {}
  devServerConfigTransform: (config: DevServerConfig) => DevServerConfig; //完全自定义webpack.devServer配置
  //以上可通回调函数自由修改webpack.devServer配置，默认 空
  all: EnvConfig; //dev(开发环境)和prod(生产环境)通用的环境配置
  dev?: Partial<EnvConfig>; //dev(开发环境) 专用配置，可覆盖all
  prod?: Partial<EnvConfig>; //prod(生产环境) 专用配置，可覆盖all
}

```

::: tip 如果以上选项不够用，可通过回调函数直接修改webpack配置，参见webpack5配置

- webpackConfigTransform: (config: WebpackConfig) => WebpackConfig;
- devServerConfigTransform: (config: DevServerConfig) => DevServerConfig;

:::

elux.config.js 配置举例：

```js
const {localIP} = require('@elux/cli-utils');
const serverPort = 4003;
const apiHosts = `http://${localIP}:3003/`;

module.exports = {
    type: 'react',
    mockServer: {port: 3003},
    cssProcessors: {less: true},
    all: { //开发和生成环境都使用的配置
        serverPort,
        clientGlobalVar: {
            ApiPrefix: apiHosts,
            StaticPrefix: apiHosts,
        },
    },
    dev: { //开发环境专用配置
        eslint: false,
        stylelint: false,
    },
}
```

## taro项目配置

taro项目直接使用官方脚手架：[https://taro-docs.jd.com/taro/docs/](https://taro-docs.jd.com/taro/docs/)
