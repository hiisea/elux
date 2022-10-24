# Model

这里的Model指的是业务逻辑的数据模型，通常一个**微模块**都会包含一个Model，用来处理业务逻辑并维护`ModuleState`，它包含二大因素：

- **ModuleState**: 本模块的状态
- **ActionHandler**: 维护本模块`ModuleState`的方法，可分为`reducer/effect`（类似vuex的mutation/action）

::: tip 复用公共逻辑

Model形式上就是一个JS类，因此可以通过“**继承**”来复用一些公共逻辑。

:::

## Modle的类型

```ts
export interface CommonModel {
  readonly moduleName: string; //模块名称
  readonly state: ModuleState; //模块状态
  //model被挂载到store时触发，在一个store中一个model只会被挂载一次
  onMount(env: 'init' | 'route' | 'update'): void | Promise<void>;
  //当前page被激活时触发
  onActive(): void;
  //当前page被变为历史快照时触发
  onInactive(): void;
}
```

## 创建一个Model

下面我们用一个比较复杂的根模块`stage.model`作为示例：

1. 在模块目录下创建`model.ts`

    ```ts
    // src/modules/stage/model.ts
    import {pathToRegexp} from 'path-to-regexp';
    import {BaseModel, ErrorCodes, LoadingState, effect, reducer} from '@elux/react-web';
    import {APPState} from '@/Global';

    //定义本模块的状态结构
    export interface ModuleState {
        curUser: CurUser; //该字段用来记录当前用户信息
        subModule?: SubModule;//该字段用来记录当前路由下展示哪个子Module
        currentView?: CurrentView; //该字段用来记录当前路由下展示哪个自己的View
        globalLoading?: LoadingState; //该字段用来记录一个全局的loading状态
        error?: string; //该字段用来记录启动错误，如果该字段有值，则显示错误
    }

    //定义路由中的本模块感兴趣的信息
    export interface RouteParams {
        subModule?: SubModule;
        currentView?: CurrentView;
    }

    //定义本模块的Model，必需继承BaseModel
    export class Model extends BaseModel<ModuleState, APPState> {
        protected routeParams: RouteParams; //保存从当前路由中提取的信息结果

        //提取当前路由中的本模块感兴趣的信息
        protected getRouteParams(): RouteParams {
            const {pathname} = this.getRouter().location;
            //自己定义好路由规则
            const [, subModule, currentView] = pathToRegexp('/:subModule/:currentView').exec(pathname) || [];
            return {subModule, currentView} as RouteParams;
        }
    
        //初始化或路由变化时都需要重新挂载Model
        //在此钩子中必需完成本模块ModuleState的初始赋值(可以异步)
        //在此钩子执行完成之前，本模块的UI将不会Render
        //在此钩子中并可以await子模块挂载，等待所有子模块都mount完成后，一次性Render UI
        //也可以不await子模块挂载，这样子模块可能需要自己设计并展示Loading界面，这样就形成了2种不同的路由风格
        //一种是数据前置，路由后置(所有数据全部都准备好了再跳转、展示界面)
        //一种是路由前置，数据后置(路由先跳转，展示设计好的loading界面)
        //SSR时只能使用"数据前置"风格
        public async onMount(env: 'init' | 'route' | 'update'): Promise<void> {
            this.routeParams = this.getRouteParams();
            const {subModule, currentView} = this.routeParams;
            //getPrevState()可以获取路由跳转前的状态
            //以下意思是:如果curUser已经存在(之前获取过了)，就直接使用而不再调用API获取
            //你也可以利用这个方法来复用路由之前的任何有效状态，从而减少数据请求
            const {curUser: _curUser} = this.getPrevState() || {};
            try {
                //如果用户信息不存在(第一次)，等待获取当前用户信息
                const curUser = _curUser || (await api.getCurUser());
                const initState: ModuleState = {curUser, subModule, currentView};
                //_initState是基类BaseModel中内置的一个reducer
                //this.dispatch是this.store.dispatch的快捷方式
                //以下语句等于this.store.dispatch({type: 'stage._initState', payload: initState})
                this.dispatch(this.privateActions._initState(initState));
            } catch (err: any) {
                //如果根模块初始化中出现错误，将错误放入ModuleState.error字段中
                //渲染其它UI将变得没有实际意义
                const initState: ModuleState = {curUser: {...guest}, subModule, currentView, error: err.message || err.toString()};
                this.dispatch(this.privateActions._initState(initState));
            }
        }

        //定义一个reducer，用来更新当前用户状态
        //注意该render不希望对外开放，所以定义为protected
        @reducer
        protected putCurUser(curUser: CurUser): ModuleState {
            //如果是VUE，可以直接修改ModuleState: Object.assign(this.state, {curUser});
            return {...this.state, curUser};
        }

        //定义一个effect，用来执行登录逻辑
        //effect(参数)，参数可以用来将该effect的执行进度注入ModuleState中，如effect('this.loginLoading')
        //如果不需要跟踪该effect的执行进度，请使用effect(null)
        @effect()
        public async login(args: LoginParams): Promise<void> {
            const curUser = await api.login(args);
            this.dispatch(this.privateActions.putCurUser(curUser));
            const fromUrl: string = this.getRouter().location.searchQuery.from || HomeUrl;
            //用户登录后清空所有路由栈，并跳回原地
            this.getRouter().relaunch({url: fromUrl}, 'window');
        }

        //支持路由守卫
        //路由跳转前会自动派发'stage._testRouteChange'的Action
        //可以通过effect来监听这个Action，并决定是否阻止
        //如果想阻止路由跳转，可以抛出一个错误
        @effect(null)
        protected async ['this._testRouteChange']({pathname}: {pathname: string}): Promise<void> {
            if (pathname.startsWith('/my/') && !this.state.curUser.hasLogin) {
                throw new CustomError(CommonErrorCode.unauthorized, '请登录！', pathname, true);
            }
        }

        //ActionHandler运行中的出现的任何错误都会自动派发'stage._error'的Action
        //可以通过effect来监听这个Action，并决定是消化错误还是继续抛出
        //如果继续抛出，则整个ActionBus链将终止执行
        //注意：如果继续抛出，请抛出原错误，不要创建新的错误，以防止无穷递归
        @effect(null)
        protected async ['this._error'](error: CustomError): Promise<void> {
            if (error.code === CommonErrorCode.unauthorized) {
                //如果错误是需要登录，则跳到登录界面
                this.getRouter().push({url: LoginUrl}, 'window');
            } else {
                window.alert(error.message);
            }
            throw error;
        }
    }
    ```

2. 导出该Model

    ```ts
    // src/modules/stage/index.ts
    import {exportModule} from '@elux/react-web';
    import {Model} from './model';
    import main from './views/Main';

    export default exportModule('stage', Model, {main});
    ```

## 使用Model

### 获取State

- 在Model中获取State：

    ```ts
    export class Model extends BaseModel<ModuleState, APPState> {
        protected test() {
            //获取本模块的ModuleState
            const moduleState = this.state;
            //获取所有模块的ModuleState
            const currentRootState = this.getRootState();
            //获取路由跳转前的StoreState，可以充分利用之前的数据结果
            const previousRootState = this.getRootState('previous');
            //获取未提交到Store的StoreState，用于模块之间的同步获取
            const previousRootState = this.getRootState('uncommitted');
        }
    }
    ```

- 在View中获取State：

  ```ts
  function mapStateToProps(appState: APPState): StoreProps {
    const {subModule, curView, globalLoading, error} = appState.stage!;
    return {
        subModule,
        curView,
        globalLoading,
        error,
    };
  }

  const storeProps = connectStore(mapStateToProps);
  ```

### 派发Action

- 在Model中派发Action：

    ```ts
    import {Modules} from '@/Global';

    export class Model extends BaseModel<ModuleState, APPState> {
        protected async test() {
            //派发本模块的action
            this.dispatch(this.actions.logout());
            //派发其它模块的action
            this.dispatch(Modules.article.actions.search());
            //以上语句等于this.store.dispatch({type:'article.search'})
        }
    }
    ```

- 在View中派发Action：
  
    ```ts
    import {Modules, GetActions} from '@/Global';

    const Component = ({dispatch}) => {
        const onClick = () => {
            dispatch(Modules.stage.actions.logout());
            dispatch(Modules.article.actions.search());
            //一种更简洁的写法:
            const {stage, article} = GetActions('stage', 'article');
            dispatch(stage.logout());
            dispatch(article.search())
        }
    }
    ```
