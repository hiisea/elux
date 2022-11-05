---
prev: /guide/basics/immutable.html
---

# React

在Elux项目中使用React，默认使用`Immutable`数据模式，即`reducer`中修改`moduleState`时，不能直接修改原对象，必需返回一个新对象（与Redux类似）。

## 使用React

```ts
// src/modules/article/views/Main.tsx
import {connectStore} from '@elux/react-web';
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

export default connectStore(mapStateToProps)(Component);
```

## 内置组件

框架中内置了4个常用的React组件，参见[内置组件](/guide/basics/view.html#内置组件)
  
## 暂未支持V18中的Suspense

react 18中的新Suspense方案很好的解决了SSR时数据集中加载的问题，值得借鉴和使用。但Vue中尚无类似解决方案，这也极大增加了对于UI特殊功能的依赖，所以暂未支持。
