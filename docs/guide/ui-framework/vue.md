# VUE

Elux推荐大家使用[模型驱动](/designed/model-driven.html)作为开发理念，是为了简化对UI层的依赖。从整个架构图中可以看出，UI层只和Store有简单的联系，所以理论上**任何UI框架只要能够使用`Store中的State`，就能接入Elux项目中**。

> 注意暂时只适配了Vue3版本

## 和Vuex的联系

Elux内置了状态管理系统，它与Vuex同属于`Flux框架`的变种。不少概念沿用Vuex中的定义，如`store/dispatch/action/reducer/effect`等。

::: tip 提示

- `Reducer`类似vuex中的`Mutation`
- `Effect`类似vuex中的`Action`

:::

Elux中没有像Vuex一样封装很多`糖衣方法`，因为那些和Vue中的功能重叠。Vue本质上是基于数据的Reactive来驱动的，所以只要让Vue能够得到具有Reactive特性的`StoreState`就足够了。

> Elux状态管理Devtools使用`redux-devtools`

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

框架中内置了4个常用的Vue组件：

- `Switch`该组件用来控制子元素的渲染方式：如果非空子元素大于0，则渲染第一个非空子元素，否则将渲染`props.elseView`

    ```jsx
    //  与<Else>的区别在于 <Else> 渲染所有非空子元素
    <Switch elseView={<NotFound />}>
        {subView === 'detail' && <Detail />}
        {subView === 'list' && <List />}
    </Switch>
     ```

- `Else`该组件用来控制子元素的渲染方式：如果非空子元素大于0，则渲染所有非空子元素，否则将渲染`props.elseView`

    ```jsx
    //  与<Switch>的区别在于 <Switch> 仅渲染非空子元素中的第1个
    <Else elseView={<NotFound />}>
        {subView === 'detail' && <Detail />}
        {subView === 'list' && <List />}
    </Else>
     ```

- `Link`类似于Html标签`<a>`，用组件的方式执行路由跳转

    ```jsx
    export interface LinkProps extends React.HTMLAttributes<HTMLDivElement> {
        disabled?: boolean; //如果disabled将不执行路由及onClick事件
        to?: string; //指定跳转的url或后退步数
        onClick?(event: React.MouseEvent): void; //点击事件
        action?:'relaunch' | 'push' | 'replace' | 'back'; //路由跳转方式
        target?: RouteTarget; //指定要操作的路由栈
    }

    <Link disabled={pagename==='/home'} to='/home' action='push' target='window'>
        Home
    </Link>
    ```

- `DocumentHead`用组件的方式动态修改`<head>内容`，主要是`title/description/keywords`等meta信息，SSR中非常有用。

    ```jsx
    <DocumentHead
        title='文章'
        html='<meta name="keywords" content="域名,域名推广,域名注册">'
    />
    ```
  