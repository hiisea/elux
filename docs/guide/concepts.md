
# Elux基本概念

**微模块**和**模型驱动**是Elux项目的二大基石。

<img src="/images/micro-module-model.png" alt="微模块-模型驱动" width="400" />

## 应用由微模块组成

我们知道在后端领域，通常都是从`业务功能`来划分模块：用户模块、订单模块、评论模块...\
而在前端领域，从一开始就是以`UI界面的区块`来划分模块，首页、推荐Top10、新闻列表...\
现在Elux提出的“**微模块**”就是要统一前后端开发视角，将`业务功能模块化`带入前端：

- 应用由一个个业务**微模块**组成，微模块之间是平等、松散、可组合的。
- 微模块应当`高内聚低耦合`，强调**自治**，可以独立开发、维护、部署。

::: tip 微模块是一种集合，也是一个文件夹

- 划分视角: `业务功能`（非UI区域）
- 划分原则: `高内聚、低耦合`（模块之间应当松散，相关资源应当集中）

:::

## 微模块由Model和View组成

- **model**：用来处理业务逻辑，维护ModuleState（模块状态）
  - ModuleState：用来描述微模块的当前状态。
  - ActionHandler：用来监听Action，并执行Handler：
    - reducer：纯函数，用来修改ModuleState（类似vuex mutation）
    - effect：用来执行副作用及异步逻辑（类似vuex action）
- **view**：用来展示数据与交互
  - Component：普通UI组件
  - View：包含具体业务的UI组件

::: tip 包含业务逻辑的Component称为View

- View用来表达业务逻辑，Component用来表达交互逻辑。
- View可以直接从Store中获取数据，Component不要直接从Store中获取数据。

:::
  
![elux静态结构图](/images/static-structure.svg)
