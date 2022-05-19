# 安装与配置

Elux 项目基于 node，推荐使用较新的 node 环境（>=16.0.0）

## 采用Cli命令安装

### 安装 @elux/cli

首先，你需要使用 npm 或者 yarn 全局安装 @elux/cli

```bash
npm install -g @elux/cli
```

### 初始化新工程

在终端中执行 `elux init` 即可开始新建工程向导

```bash
elux init
? Enter the new project name ../new-project
```

↑输入新项目名称(目录)，支持相对或绝对路径，如果目录已经存在可以选择覆盖。

```bash
? 请选择或输入模板源 (Use arrow keys)
❯ 简单示例模板(Gitee源) [32P] 
  简单示例模板(Github源) [32P] 
  输入模版文件Url... 
  输入本地模版目录... 
```

↑选择或输入模板源，需要注意的是Github源在国内不是很稳定，可能需要翻墙。如果所有源都无法连接，也可以自行下载模版文件，解压后放在本地，然后选择`输入本地模版目录...`

```bash
* 未发现全局代理
? 是否需要代理(翻墙)【输入代理地址或回车跳过】http://127.0.0.1:1087
```

↑如果你有翻墙代理，可以在此输入代理地址；如果不需要，直接回车跳过即可。

```bash
? 请选择平台架构 (Use arrow keys)
❯ CSR: 基于浏览器渲染的应用 [8P] 
  SSR: 基于服务器渲染 + 浏览器渲染的同构应用 [4P] 
  Micro: 基于Webpack5的微前端 + 微模块方案 [8P] 
  Taro: 基于Taro的跨平台应用（各类小程序） [8P] 
  RN: 基于ReactNative的原生APP（开发中...） [4P] 
```

↑后续按具体要求选择即可...

### 安装依赖注意事项

- 由于模版中使用了npm-workspace，推荐使用yarn安装依赖，如果使用npm，请保证版本>=7
- 如果使用npm安装依赖，请注意`--legacy-peer-deps`参数
- 模版默认会拉取yarn/npm的`lock文件`，这样会锁定各依赖版本，保证运行顺利。如果你比较激进，可以不使用它们
- @types/react 类型文件最好只安装一个版本，多版本可能冲突

## 关于工程模版

目前仅提供一个简单增删改查的模版，后续将提供更多的模版源，也欢迎大家制作并贡献更多模版。

## 关于Taro项目

模版中的Taro项目基于Taro的特定版本制作，开箱即用。但如果想使用官方**最新版本**，可以自己修改配置(可能存在风险)，步骤如下：

1. 使用taro的cli命令生成新项目（使用Typescript）
2. 增加elux相关依赖，修改./package.json：

    ```json
    {
      "peerDependencies": {
        "query-string": "*" //taro中自带
      },
      "dependencies": {
        //...
        "@elux/react-taro": "^2.0.1",
        "path-to-regexp": "^3.0.0" //taro中只能使用v3版本
      },
      "devDependencies": {
        //...
        "@elux/cli-utils": "^2.0.0"
      },
      "resolutions": {
        "@types/react": "^17.0.0" //安装多版本type可能导致ts报错
      }
    }

    ```

3. 修改./babel.config.js 为：

   ```js
    module.exports = {
      presets: [
        [
          'taro',
          {
            framework: 'react',
            ts: true,
            loose: false,
            decoratorsBeforeExport: true,
            decoratorsLegacy: false,
          },
        ],
      ],
    };
   ```

4. 修改./config/index.js：

   ```js{9-18,24-33,38-40,43-52}
    const path = require('path');
    const srcPath = path.resolve(__dirname, '..', 'src');
    const {localIP, getCssScopedName} = require('@elux/cli-utils');

    const config = {
      //...
      sourceRoot: 'src',
      outputRoot: 'dist',
      alias: {
        '@': srcPath,
      },
      plugins: ['@tarojs/plugin-html'],
      defineConstants: {
        'process.env.PROJ_ENV': JSON.stringify({
          ApiPrefix: `http://${localIP}:3003/`,
          StaticPrefix: `http://${localIP}:3003/`,
        }),
      },
      //...
      mini: {
        //...
        postcss: {
          //...
          cssModules: {
            enable: true,
            config: {
              namingPattern: 'module',
              generateScopedName(localName, mfileName) {
                return getCssScopedName(srcPath, localName, mfileName);
              },
              localIdentContext: srcPath,
            },
          },
        },
      },
      h5: {
        //...
        router: {
          mode: 'browser',
        },
        postcss: {
          //...
          cssModules: {
            enable: true,
            config: {
              namingPattern: 'module',
              generateScopedName(localName, mfileName) {
                return getCssScopedName(srcPath, localName, mfileName);
              },
              localIdentContext: srcPath,
            },
          },
        },
      }
    };
   ```

5. 对于react项目，dev环境下可以关闭overlay，修改./config/dev.js：

   ```js
    module.exports = {
      env: {
        NODE_ENV: '"development"',
      },
      defineConstants: {},
      mini: {},
      h5: {
        webpackChain(chain) {
          chain.plugin('fastRefreshPlugin').tap(() => [{overlay: false}]);
        },
      },
    };
   ```

6. 如果你想使用Elux的代码风格，可以安装：
   - @elux/eslint-plugin
   - @elux/stylelint-config
