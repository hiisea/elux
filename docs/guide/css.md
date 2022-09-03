---
prev: /guide/ui-framework/vue.html
---

# CSS框架

## CSS预处理框架

脚手架内置了对`less`和`sass`的支持，只需配置`elux.config.js`即可。

设置为tue，即可开启，并使用默认配置：

```js
// elux.config.js
module.exports = {
    cssProcessors: {less: true, sass: true},
}
```

设置为options，即可开启，并使用自定义配置：

```js
// elux.config.js
module.exports = {
    cssProcessors: {less: lessOptions, sass: sassOptions},
}
```

更多项目配置查看：[配置](/guide/configure.md)

## CSS Module

项目中CSS文件名以`.module.xxx`结尾，将自动启用CSS Module解析，如`global.module.less`。

可以在`elux.config.js`中修改CSS Module设置：

```js
// elux.config.js
module.exports = {
    cssModulesOptions: {
        getLocalIdent: undefined
    },
}
```

## 相关文章

- [一种比css_scoped和css_module更优雅的避免css命名冲突小妙招](https://juejin.cn/post/7129316859182710814)
