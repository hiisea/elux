# Component与View

这里的Component指UI组件，与UI框架中的组件是同一个概念。

这里的View本质上就是一个Component，只不过逻辑上做了归类。

::: tip View是一类特殊的Component

- View 用来承载特定的业务逻辑，Component 用来承载可复用的交互逻辑
- View 可以从 Store 中获取数据，Component 不要这样做

:::

## 创建Component

创建Component根据UI框架的不同而不同，Elux中没什么限制，也没什么特别之处。只是为了更好的归类，在Component中不要去直接使用Store中的数据。

## 创建View

View就是一个Component，所以创建方法也是一样，并且View中可以直接使用Store中的数据。

- React - Elux内置了`redux-redux`库，你可以使用`connectRedux`方法来建立与Store之间的映射和转换。

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

首先：如果Component或view需要被模块导出（可以使用LoadComponent()方法加载），必需实现`EluxComponent`接口。方法就是使用`exportComponent()`或者`exportView()`包装一下，另外`connectRedux()`方法内部已经调用了exportView()，所以无需再次调用，例如以上代码示例。

然后：在模块index文件中，作为exportModule()的参数传入即可。

```ts
// src/modules/stage/index.ts
import {exportModule} from '@elux/react-web';
import {Model} from './model';
import main from './views/Main';

export default exportModule('stage', Model, {main});
```

### 分包导出

有时候组件很大，可以使用组件的分包导出和按需加载。

> 注意Module的分包导出和Component的分包导出是不同的...

前面说过，Elux中的Module本身是可以分包和按需加载的：

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

虽然可以将整个应用分为多个ModuleBundle，但每个Module的所有内容(包括所有view和model)都会打包在一起。

而组件的分包导出，则是进一步拆分ModuleBundle，将同一个Module分解为多个子包。组件的分包导出很简单，用`import()`方法即可：

```ts
// src/modules/stage/index.ts
import {exportModule} from '@elux/react-web';
import {Model} from './model';
// import main from './views/Main';

export default exportModule('stage', Model, {main: ()=>import('./views/Main')});
```

## 使用Component、View

> Elux中Component和View的加载与渲染是懒执行的。

前面说过，Component和View的主要区别在于使不使用Store中的数据。所以相比于使用Component，我们在使用View的时候，要提前执行相关Model的初始化，其过程大致如下：

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
