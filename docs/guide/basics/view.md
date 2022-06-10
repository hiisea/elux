# Component与View

这里的View本质上就是一个Component，只不过逻辑上做了归类。

::: tip View是一类特殊的Component

- View 用来承载特定的业务逻辑，Component 用来承载通用的交互逻辑。
- Store是业务模型的载体，所以View可以从 Store 中获取数据，而Component不要这样做。

:::

## 创建Component

创建Component根据UI框架的不同而不同，Elux中没什么限制，也没什么特别之处。
只是人为约定Component中不要去直接使用Store中的state。

## 创建View

View就是一个Component，所以创建方法也是一样，并且View中可以直接使用Store中的State。

- React - Elux内置了`redux-redux`库，你可以使用`connectRedux`来连接Store。

    ```ts
    // src/modules/article/views/Main.tsx
    import {connectRedux} from '@elux/react-web';
    import {APPState} from '@/Global';

    export interface StoreProps {
        currentView?: CurrentView;
        itemDetail?: ItemDetail;
    }

    function mapStateToProps(appState: APPState): StoreProps {
        const {currentView, itemDetail} = appState.article!;
        return {currentView, itemDetail};
    }

    const Component: FC<StoreProps> = ({currentView, itemDetail}) => {
        ...
    }

    //connectRedux()方法内部自动调用了exportView()
    export default connectRedux(mapStateToProps)(Component);
    ```

- Vue中可以利用`computed`计算属性

    ```ts
    // src/modules/article/views/Main.tsx
    import {APPState, useStore} from '@/Global';
    import {ComputedStore, exportView} from '@elux/vue-web';

    export interface StoreProps {
        currentView?: CurrentView;
        itemDetail?: ItemDetail;
    }

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
            const store = useStore();
            const computedStore = mapStateToProps(store.getState());
            const currentView = computed(computedStore.currentView);
            const itemDetail = computed(computedStore.itemDetail);
            return () => (...);
        },
    });

    //如果需要被模块导出，别忘了使用exportView()
    export default exportView(Component);
    ```

## 导出Component、View

如果Component或view需要被模块导出（`只有被导出才可以使用LoadComponent()方法加载`），必需实现`EluxComponent`接口。

使用`exportComponent()`或者`exportView()`包装一下，另外`connectRedux()`方法内部已经调用了`exportView()`。

在模块`./index.ts`文件中作为`exportModule()`方法的第3个参数导出：

```ts
// src/modules/stage/index.ts
import {exportModule} from '@elux/react-web';
import {Model} from './model';
import main from './views/Main';

export default exportModule('stage', Model, {main});
```

### 分包导出

有时候组件很大，可以使用组件的分包导出和按需加载。前面说过，Elux中的Module本身是可以分包和按需加载的：

```ts
// src/Project.ts
// 该文件可以看作应用的配置文件
import stage from '@/modules/stage';

// 定义模块的获取方式，同步或者异步都可以
export const ModuleGetter = {
    stage: () => stage,//通常stage为根模块，使用同步加载
    article: () => import('@/modules/article'), //异步按需加载
    my: () => import('@/modules/my'),//异步按需加载
};
```

但每个Module的所有内容(包括所有view和model)都会打包在一起。

而组件的分包导出，则是进一步拆分ModuleBundle，将同一个Module分解为多个子包：

```ts
// src/modules/stage/index.ts
import {exportModule} from '@elux/react-web';
import {Model} from './model';
// import main from './views/Main';

export default exportModule('stage', Model, {main: ()=>import('./views/Main')});
```

## 使用Component、View

前面说过，Component和View的主要区别在于使不使用Store中的数据。所以相比于使用Component，在使用View的时候，要提前执行相关Model的初始化，其过程大致如下：

1. 加载对应的ModuleBundle
2. 加载对应的ComponentBundle
3. 执行store.mount(moduleName) `//只有View需要`
4. 渲染Component

Elux框架提供的`LoadComponent()`封装了以上所有逻辑，可以自动区分Component和View，而且支持TS类型提示：

```ts
type LoadComponent = (
    moduleName: string, 
    componentName: string, 
    options?: {onError: Elux.Component<{message: string}>; onLoading: Elux.Component<{}>}
  ) => EluxComponent
```

```ts
// src/modules/article/views/Main.tsx
import {LoadComponent} from '@/Global';

const Article = LoadComponent('article', 'main');
const My = LoadComponent('my', 'main');
```

可以看到该方法还可以指定`onError`和`onLoading`，如果不指定则使用默认全局设置，参见 [Elux全局设置](/api/react-web.setconfig.html)

### 仅获取，不渲染

如果你仅需要获取组件，不想自动渲染它，可以使用`GetComponent`：

```ts
import {GetComponent} from '@/Global';

//返回一个Promise
const article = GetComponent('article', 'main');
```

## 内置组件

框架中内置了4个常用的UI组件：

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
        to?: number | string; //指定跳转的url或后退步数
        onClick?(event: React.MouseEvent): void; //点击事件
        action?:'relaunch' | 'push' | 'replace' | 'back'; //路由跳转动作
        target?: RouteTarget; //指定要操作的历史栈
        classname?: string; //window的className
        payload?: any;
    }

    <Link disabled={pagename==='/home'} to='/home' action='push' target='window' classname="_dialog">
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
  