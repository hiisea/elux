---
next: /guide/css.html
---

# VUE

在Elux项目中使用Vue，默认使用`Mutable`数据模式，与Vuex类似：

- `reducer`类似vuex中的`mutation`，可以直接修改`moduleState`
- `effect`类似vuex中的`action`

> Devtools请使用`redux-devtools`

## 使用Vue

Elux没有挂载任何全局变量，获取Store请使用`useStore()`，获取State可使用`connectStore()`

```ts
// src/modules/article/views/Main.tsx
import {connectStore} from '@elux/vue-web';
import {APPState, useStore, useRouter} from '@/Global';
import {defineComponent} from 'vue';

export interface StoreProps {
    currentView?: CurrentView;
    itemDetail?: ItemDetail;
}

//这里保持和Redux的风格一致，也可以直接使用computed
function mapStateToProps(appState: APPState): StoreProps {
    const {currentView, itemDetail} = appState.article!;
    return {currentView, itemDetail};
}

const Component = defineComponent({
  name: 'ArticleMain',
  setup() {
    //获取Store和Router，可以使用`useStore()`和`useRouter()`
    const router = useRouter();
    const store = useStore();
    //获取state可以使用`connectStore`
    const storeProps = connectStore(mapStateToProps);

    return () => {
      const {currentView, itemDetail} = storeProps;
      ...
    };
  },
});

export default exportView(Component);
```

## 内置组件

框架中内置了4个常用的React组件，参见[内置组件](/guide/basics/view.html#内置组件)
  