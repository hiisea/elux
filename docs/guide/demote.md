---
prev: /guide/platform/taro.html
---

# 兼容IE

Elux 最低可以兼容到 IE10，但需要特别处理：

## 需要UI框架本身支持

例如 Vue3/React18 本身不支持IE

## 需要Polyfill

可以使用一些网站提供的ES6 Polyfill在线生成服务，也可以使用elux命令工具自己制作：

1. 将以下内容保存为`./public/polyfill.esm.js`

    ```js
    //Elux需要
    import 'core-js/features/string/starts-with';
    import 'core-js/features/string/ends-with';
    import 'core-js/features/string/trim';
    import 'core-js/features/array/find';
    import 'core-js/features/array/find-index';
    import 'core-js/features/object/assign';
    import 'core-js/features/symbol';
    import 'core-js/features/promise';

    //React需要
    import 'core-js/features/set';
    import 'core-js/features/map';
    ```

2. 在`./package.json`中加入scripts

   ```json
    {
      "scripts": {
        "polyfill": "elux webpack-pack -m ./public/polyfill.esm.js ./public/client/polyfill.js",
      }
    }
   ```

3. 打开终端，运行`yarn polyfill`，得到`./public/client/polyfill.js`
4. 将`polyfill.js`引入`./public/client/index.html`

## 需要替代ES6 Proxy

由于 ES6 的`Proxy`是无法使用 polyfill 的，而Elux中的`dispatch action`又使用了`Proxy`，所以需要替换它们：

1. 在项目中安装NPM包`@elux/cli-demote`
2. 在`./package.json`中加入scripts

   ```json
    {
      "scripts": {
        "demote": "elux demote",
      }
    }
   ```

3. 打开终端，运行`yarn demote`，该命令会自动修改`./src/Global.ts`以替换`Proxy`

## 需要设置编译目标

在`./package.json`中设置`browserslist`

```json
{
  "browserslist": [
    "ie >= 10"
  ],
}
```

## 需要使用Elux的es5版本

默认使用的是Elux的es6版本，要使用es5版本，可以使用webpack别名：  
修改`./elux.config.js`

```js
// ./elux.config.js

module.exports = {
  prod: {
    resolveAlias: {
      '@elux/react-web': '@elux/react-web/dist/es5/pkg.js'
    }
  }
}
```
