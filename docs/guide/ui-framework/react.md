---
prev: /guide/basics/immutable.html
---

# React

Elux推荐大家使用[模型驱动](/designed/model-driven.html)作为开发理念，是为了简化对UI框架的依赖。从[整个架构图](/guide/basics/action.html)中可以看出，View只和Store有简单的联系，所以理论上**任何MVVM框架，都很容易的接入Elux项目**。

## Mutable与Immutable

React属于UI渲染框架，它同时支持`Mutable`与`Immutable`数据模式。  
Elux内置了数据管理框架，它也同时支持`Mutable`与`Immutable`数据模式。  
所以使用理论上Elux项目使用React可以有2种组合方案：

- Elux+React
- Elux+Mobx+React

参见[Mutable与Immutable](/guide/basics/immutable.html)

## 和Redux的联系

它与Redux同属于`Flux框架`的变种。不少概念沿用Redux中的定义，如`store/dispatch/action/reducer/middleware`等，可以参照Redux的文档来理解和使用它们（effect概念可参照`redux-saga`）

但注意Elux的状态管理本质上与Redux是不同的，Elux是状态管理框架，它可以使用`Mutable数据模式`也可以使用`Immutable数据模式`。

## 使用React

Elux项目中使用React，默认为Immutable模式，没什么限制和特别之处。

```ts
// src/modules/article/views/Main.tsx
import {connectRedux} from '@elux/react-web';
import {APPState, useStore, useRouter} from '@/Global';

export interface StoreProps {
    currentView?: CurrentView;
    itemDetail?: ItemDetail;
}

function mapStateToProps(appState: APPState): StoreProps {
    const {currentView, itemDetail} = appState.article!;
    return {currentView, itemDetail};
}

const Component: FC<StoreProps> = ({currentView, itemDetail}) => {
    //获取Store和Router，可以使用`useStore()`和`useRouter()`
    const store = useStore();
    const router = useRouter();
    ...
}

//connectRedux()方法内部自动调用了exportView()
export default connectRedux(mapStateToProps)(Component);
```

## 内置组件

框架中内置了4个常用的React组件，参见[内置组件](/guide/basics/view.html#内置组件)
  
## 暂未支持V18中的Suspense

react 18中的新Suspense方案很好的解决了SSR时数据集中加载的问题，值得借鉴和使用。但Vue中尚无类似解决方案，这也极大增加了对于UI特殊功能的依赖，所以暂未支持。
