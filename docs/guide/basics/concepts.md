---
prev: /guide/configure.html
---

# Elux基本概念

**微模块**和**模型驱动**是Elux项目的二大基石。

## 应用由微模块组成

我们知道在后端领域，通常都是从`业务功能`来划分模块：用户模块、订单模块、评论模块...\
而在前端领域，从一开始就是以`UI界面的区块`来划分模块，首页、推荐Top10、新闻列表...\
现在Elux提出的“**微模块**”就是要统一前后端开发视角，将`业务功能模块化`带入前端：

- 应用由一个个**微模块**组成，微模块之间是平等、松散、可组合的。
- 微模块强调**自治**，可以独立开发、维护、部署。

## 微模块内部结构

- **model**：用来处理业务逻辑，维护ModuleState（模块状态）
  - ModuleState：用来描述微模块的当前状态。
  - ActionHandler：用来监听Action，并执行Handler：
    - reducer：纯函数，用来修改ModuleState（类似vuex mutation）
    - effect：用来执行副作用及异步逻辑（类似vuex action）
- **view**：用来展示数据与交互
  - Component：普通UI组件
  - View：包含具体业务的UI组件
- **assets**：本微模块的私有资源
- **utils**：其它辅助函数及方法等

::: tip 微模块是一种集合，也是一个文件夹

- 划分视角: `业务功能`（非UI区域）
- 划分原则: `高内聚、低耦合`（模块之间应当松散，相关资源应当集中）

:::
  
![elux静态结构图](/images/static-structure.svg)

## 状态管理

Elux与Redux、Dva、Vuex、Pinia等类似，都属于Flux状态管理框架，但也有自己的特性：

- store用来管理state。
- 注入和修改state只能是reducer/mutation。
- 处理副作用只能是effect/action。
- StoreState由各微模块的ModuleState组合而成。
  - 每个微模块通过`Model`来维护自己的`ModuleState`。
  - 微模块可以读取其它微模块的`ModuleState`，但不要修改。
- `dispatch(action)`类似事件，reducer和effect都是它的actionHandler，这意味着派发一个action可以同时触发多个reducer与effect。
- `dispatch(action)`如果触发了异步的actionHandler，它将返回一个Promise，这意味着派发动作可以被await。

![elux模型驱动示意图3](/images/model3.svg)

## Component与View

View就是一个Component，只不过我们逻辑上认为：**包含具体业务逻辑的Component称为View**。

- View 用来承载具体的业务逻辑，Component 用来承载通用的交互逻辑。
- View可以直接从Store中获取数据，Component不要直接依赖Store。
