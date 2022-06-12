---
next: /guide/css.html
---

# VUE

Elux推荐大家使用[模型驱动](/designed/model-driven.html)作为开发理念，是为了简化对UI框架的依赖。从[整个架构图](/guide/basics/action.html)中可以看出，View只和Store有简单的联系，所以理论上**任何MVVM框架，都很容易的接入Elux项目**。

> 注意暂时只适配了Vue3版本

## 和Vuex的联系

Elux内置了状态管理系统，它与Vuex同属于`Flux框架`的变种。不少概念沿用Vuex中的定义，如`store/dispatch/action/reducer/effect`等。

::: tip 提示

- `Reducer`类似vuex中的`Mutation`
- `Effect`类似vuex中的`Action`

:::

Elux中没有像Vuex一样封装很多`糖衣方法`，因为那些和Vue中的功能重叠。Vue本质上是基于数据的Reactive来驱动的，所以只要让Vue能够得到具有Reactive特性的`StoreState`就足够了。

> Devtools请使用`redux-devtools`

## 使用Vue

Elux项目中使用Vue，没什么限制和特别之处，也没有在原型上挂载任何全局变量，获取Store请使用`useStore()`

```ts
// src/modules/article/views/Main.tsx
import {defineComponent, computed} from 'vue';
import {ComputedStore, exportView} from '@elux/vue-web';
import {APPState, useStore, useRouter} from '@/Global';

export interface StoreProps {
  currentView?: CurrentView;
  itemDetail?: ItemDetail;
}

//这里保持和Redux的风格一致，也可以省去这一步，直接使用computed
function mapStateToProps(appState: APPState): ComputedStore<StoreProps> {
  const article = appState.article!;
  return {
    currentView: () => article.currentView,
    itemDetail: () => article.itemDetail,
  };
}

const Component = defineComponent({
  name: 'ArticleMain',
  setup() {
    //获取Store和Router，可以使用`useStore()`和`useRouter()`
    const router = useRouter();
    const store = useStore();
    const computedStore = mapStateToProps(store.getState());
    const currentView = computed(computedStore.currentView);
    const itemDetail = computed(computedStore.itemDetail);
    return () => (
      ...
    );
  },
});

export default exportView(Component);
```

## 内置组件

框架中内置了4个常用的React组件，参见[内置组件](/guide/basics/view.html#内置组件)
  