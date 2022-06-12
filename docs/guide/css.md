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

不管是使用`CSSModule`也好，还是`Vue的Scope`也好，都是使用一个随机字符串来避免你的CSS样式不会影响到其它元素，这样做也有一些缺点：

- 隔离自己的同时，也让父级不能够调整自己。同一个组件放在不同场合可能需要微调，加上这串随机字符，将无法被影响。
- 生成一个随机字符串失去了class的语义，增加了长度，也也不好看。

::: tip 层叠样式表(Cascading Style Sheets)

- CSS如果失去了层叠的机动性，感觉违背了本意。
- CSS设计了很好的权重体系，而不是0和1。

:::

### 改良的CSS Module

在Elux工程中推荐一种改良的CSS Module方案（个人喜好）：

- 仅在Component根节点或特殊节点上使用唯一命名。这相当于给整个Component一个唯一命名空间，所有内部样式都必需带上这个命名空间：

  ```css
  :global {
    :local(.root) { //仅根节生成唯一命名
        position: absolute;
        top: 0;
        left: 0;

        > .hd { //其它class已经在根节点命名空间内，所有无需唯一化
            font-size: 15px;
        }
        .logo { //其它class已经在根节点命名空间内，所有无需唯一化
            font-size: 12px;
        }
    }
  }
  ```

- 唯一命名不再使用随机字符串或hash值，而是生成有意义的名字。
  - Elux应用由微模块组成，每个微模块的ID是唯一的，所以可以利用模块ID。
  - Elux中的组件分为component和view，如果是component，我们约定给其一个`comp`做前缀。

  模版中默认使用了这套改良方案，最终生成如下：

  ```html
  <!-- 'comp-NavBar'可以推测组件在'src/components/NavBar' -->
  <div class="comp-NavBar">
      <div class="title">文章列表</div>
  </div>
  <!-- 'article-List'可以推测组件在'src/modules/article/view/List' -->
  <div class="article-List">
      <!-- 'article-comp-SearchBar'可以推测组件在'src/modules/article/component/SearchBar' -->
      <div class="article-comp-SearchBar">....</div>
  </div>
  ```

::: tip 通过className推测组件位置

这样一来，我们通过className不仅能读到class的语义，还可以简单推测出该组件的文件位置，这对于上线后Debug很有用。

:::
