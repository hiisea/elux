
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

## Model

## View、Component

View 本质上还是一个 Component，它们有逻辑上的区别：

- View 用来承载特定的业务逻辑，Component 用来承载可复用的交互逻辑
- View 可以从 Store 中获取数据，Component 则只能通过 props 来进行传递
