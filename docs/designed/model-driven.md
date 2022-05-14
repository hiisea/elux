# 模型驱动

## 模型是什么？

这里的"模型（Model）"是指对业务逻辑抽象表达和数据建模。

模型与运行平台无关、与上层框架无关，它是一种逻辑、一种抽象、一种提炼。它是应用的骨骼，UI则是皮肉，所谓的模型驱动是一种设计理念：用骨骼来驱动皮肉，而不是用皮肉来驱动骨骼。

## 模型就是状态吗？

模型是一个可以运转的有机体，而状态只是它的一个切片，模型包括状态、以及驱动状态变化的各种方法和事件。

## 轻UI，重Model

你是否仍在纠结采用React还是Vue？是否仍被困于各种生命周期之中？是否迷惑于把获取数据写在onMounted还是onCreated中？那么你应当尝试着：

::: tip 将更多逻辑从UI转移到Model中

轻UI，重Model

:::

## 为什么需要模型驱动？

- 剥离了业务逻辑，UI层变得更纯粹，它只是负责展示、交互和传递用户事件。
- 剥离了UI逻辑，业务层不再受到各种生命周期和糖衣语法的干挠，更干净透明。
- 分层而治，将稳定的业务层和灵活的UI层分离，增加了代码的可复用性和可移植性。

![elux模型驱动示意图](/images/model-reusable.svg)

## Elux中的模型驱动

Elux原意是Flux Enhancer，是一种加强版的的Flux状态管理器(Redux/Vuex都是Flux的变种)，它主要加强了以下方面：

### 将Action作为Model中的事件

驱动应用运行需要事件，协同模块之间的工作也需要事件，事件是一种发布订阅的设计模式，在Model中我们称它为Action：

![elux模型驱动示意图1](/images/model1.svg)

当然它与UI中的Event机制完全不一样，比如UI中的Event有冒泡机制，而Model中的Action有`线程`机制，在ActionHandler的执行过程中可以开启一条新的Action线程。

### 职能化和模块化

- 将ActionHandler划分为`纯函数reducer`和`副作用effect`。其中reducer是唯一可以改变State的方法，其概念类似于Redux的reducer和redux-saga的effect，也类似于Vuex的mutation和action。
- 将State和ActionHandler都进行模块化，并添加约束:`本模块的State只能由本模块的reducer来修改`。

![elux模型驱动示意图2](/images/model2.svg)

### 将其它副作用挡在外围

Model需保持足够抽象和纯粹，我们不希望在它里面引入更多副作用和不稳定因子，所以需要将这些噪音挡在外围，第一时间将它们转化为Model的内部语素。

我们知道MVVM理论有个深入人心的公式：

> UI = render(State)

在众多前端工程中，这个公式变得不那么纯粹。比如将路由直接与UI绑定起来，将公式变成了：

> UI = route()+render(State)

要知道不同的UI框架、不同的运行平台，路由实现方案多种多样，不够抽象也不够稳定。Elux打破了常规的做法，将路由在外围与State绑定起来，不直接参与UI的运算，让渲染公式回归纯粹。

![elux模型驱动示意图3](/images/model3.svg)

所以在Elux中不再需要react-router、vue-router、taro-router等第三方框架，也没有定死路由规则，带来灵活性的同时也极大的降低了开发者的心智负担。
