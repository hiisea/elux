# Component与View

## 创建Component

Component就是UI组件，Elux中没什么特殊限制。

## 创建View

View就是一个包含具体业务逻辑的Component，View中可以直接使用Store中的State。

- React

    ```ts
    // src/modules/article/views/Main.tsx
    import {connectStore} from '@elux/react-web';
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
    export default connectStore(mapStateToProps)(Component);
    ```

- Vue

    ```ts
    // src/modules/article/views/Main.tsx
    import {connectStore} from '@elux/vue-web';
    import {APPState} from '@/Global';

    export interface StoreProps {
        currentView?: CurrentView;
        itemDetail?: ItemDetail;
    }

    function mapStateToProps(appState: APPState): StoreProps {
        const {currentView, itemDetail} = appState.article!;
        return {currentView, itemDetail};
    }

    const Component = defineComponent({
        name: 'ArticleMain',
        setup() {
            const storeProps = connectStore(mapStateToProps);

            return () => {
                const {currentView, itemDetail} = storeProps;
                ...
            };
        },
    });

    //如果需要被模块导出，别忘了使用exportView()
    export default exportView(Component);
    ```

## 导出Component、View

如果Component或view需要被模块导出（只有被导出才可以使用`LoadComponent()`方法加载），需要使用`exportComponent()`或者`exportView()`包装一下。

在模块`./index.ts`文件中导出：

```ts
// src/modules/stage/index.ts
import {exportModule} from '@elux/react-web';
import {Model} from './model';
import main from './views/Main';

export default exportModule('stage', Model, {main});
```

### 导出为异步组件

有时候组件很大，可以使用异步导出：

```ts
// src/modules/stage/index.ts
import {exportModule} from '@elux/react-web';
import {Model} from './model';
// import main from './views/Main';

export default exportModule('stage', Model, {main: ()=>import('./views/Main')});
```

## 使用Component

使用Component无任何特殊流程。

## 使用View

如果`View`中使用了ModuleState，渲染View之前需要先进行`Model`的初始化，其过程大致如下：

1. 按需加载View所在的`ModuleBundle`
2. 按需加载View本身`ViewBundle`
3. 执行`store.mount(moduleName)`，初始化`Model`
4. 渲染Component

Elux框架提供的`LoadComponent()`封装了以上所有逻辑：

```ts
// src/modules/article/views/Main.tsx
import {LoadComponent} from '@/Global';

const Article = LoadComponent('article', 'main');
const My = LoadComponent('my', 'main');
```

```ts
type LoadComponent = (
    moduleName: string, 
    componentName: string, 
    options?: {onError: Elux.Component<{message: string}>; onLoading: Elux.Component<{}>}
  ) => EluxComponent
```

可以看到该方法还可以指定`onError`和`onLoading`，参见 [Elux全局设置](/api/react-web.setconfig.html)

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
  