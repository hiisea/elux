---
prev: /guide/basics/immutable.html
---

# React

Elux推荐大家使用[模型驱动](/designed/model-driven.html)作为开发理念，是为了简化对UI层的依赖。从整个架构图中可以看出，UI层只和Store有简单的联系，所以理论上**任何UI框架只要能够使用`Store中的State`，就能接入Elux项目中**。

## Mutable与Immutable

React属于UI渲染框架，它同时支持`Mutable`与`Immutable`数据模式（比如Mutable模式可使用Mobx）  
Elux内置了数据管理框架，它也同时支持`Mutable`与`Immutable`数据模式。  
所以使用理论上Elux项目使用React可以有2种组合方案：

- Elux+React
- Elux+Mobx+React

> 严格意义上说Mobx属于`数据模式框架`+`数据管理框架`，参见[Mutable与Immutable](/guide/basics/immutable.html)

## 和Redux的联系

它与Redux同属于`Flux框架`的变种。不少概念沿用Redux中的定义，如`store/dispatch/action/reducer/middleware`等，可以参照Redux的文档来理解和使用它们（effect概念可参照`redux-saga`）

但注意Elux的状态管理本质上与Redux是不同的，Elux是状态管理框架，它可以使用`Mutable数据模式`也可以使用`Immutable数据模式`。

> Elux状态管理Devtools仍然使用`redux-devtools`

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

框架中内置了4个常用的React组件：

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
        action?:'relaunch' | 'push' | 'replace' | 'back'; //路由跳转动作
        target?: RouteTarget; //指定要操作的历史栈
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
  
## 暂未支持V18中的Suspense

react 18中的新Suspense方案很好的解决了SSR时数据集中加载的问题，值得借鉴和使用。但Vue中尚无类似解决方案，这也极大增加了对于UI特殊功能的依赖，所以暂未支持。
