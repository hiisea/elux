# 基础概述

## 角色结构图

![elux静态结构图](/images/static_structure.svg)

## 基本逻辑图

![elux动态逻辑图](/images/dynamic_structure.svg)

## 路由与历史栈

![elux路由与历史记录](/images/router-stacks.svg)

## 工程结构举例

```text
├── env //可以定义多套不同的配置方案
│    ├── local //该目录中的内容可以覆盖../public和../elux.config.js
│    ├── test //该目录中的内容可以覆盖../public和../elux.config.js
│    └── online //该目录中的内容可以覆盖../public和../elux.config.js
├── dist //编译输出目录，按不同环境存放
│    ├── local 
│    ├── test 
│    └── online
├── mock //模拟API假数据
├── public //该目录下的文件将直接copy到dist
├── src
│    ├── assets //公用的图片等静态资源
│    ├── components //公用的UI组件
│    ├── modules
│    │      ├──  ModuleA
│    │      │     ├── assets //ModuleA专用的图片等静态资源
│    │      │     ├── components //ModuleA中用到的UI组件
│    │      │     ├── views //ModuleA中的业务视图
│    │      │     ├── entity.ts //ModuleA中用到的业务实体定义
│    │      │     ├── model.ts //ModuleA的业务模型
│    │      │     └── index.ts //ModuleA对外封装与导出
│    │      ├── ModuleB
│    │      └── ModuleC
│    ├── Global.ts //将一些常用方法和变量导出
│    ├── Project.ts //项目设置
│    └── index.ts //项目入口文件
├── elux.config.js //elux配置
├── package.json
```

## 状态管理

`Store、State、Action、Dispatch、Reducer(Mutation)、Effect(Action)` 参见 Redux 或 Vuex。

注意事项：

- Store：在Elux项目中Store不再是单一实例，路由中每生成一个`虚拟窗口`都会生成一个Store。所以不要全局保存Store的引用，在View中请使用`useStore()`，在model中请使用`this.store`
- State：StoreState由多个ModuleState组成(子节点)，每个Module仅管理自己的ModuleState，但可以读取其它节点。Reducer是改变State的唯一途径。
- Action：Action由type、payload、priority组成，actionType通常由`moduleName.actionName`组成。Elux中创建Action不需要手动创建，通常可以自动生成，并具备TS类型提示。
- Dispatch：Elux中dispatch action是一种事件，派发一个Action可以触发不同Module中的多个`ActionHandler`(reducer/effect)。
- Reducer：对应vuex中Mutation，是修改State的唯一途径，并且注意每个Module只能修改自己的ModuleState。
- Effect：对应vuex中Action，Effect不可以直接修改State，但它可以dispatch action来触发Reducer。
- ActionHandler：Reducer/Effect统称为ActionHandler

## Module

这里的Module是指业务模块(微模块)，它通常由一个 Model (用来处理业务逻辑) 和一组 View (用来展示数据与交互)组成，并通过`exportModule()`方法封装并导出。除了全局公共资源，其它与该Module相关的所有资源都应当集中放在该目录下。

## Model

Model用来处理业务逻辑，它通常由ModuleState和多个维护ModuleState的ActionHandler组成。Model可以通过继承来复用一些公共逻辑。

## View、Component

View 本质上还是一个 Component，它们有逻辑上的区别：

- View 用来承载特定的业务逻辑，Component 用来承载可复用的交互逻辑
- View 可以从 Store 中获取数据，Component 则只能通过 props 来进行传递
