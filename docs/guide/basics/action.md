# Action与Handler

Elux中的Action概念与Redux基本相同，其特别之处在于：

- Action是Model中的事件，dispatch一个Action将触发各模块中监听该Action的多个ActionHandler执行
- ActionHandler按职能可分为：
  - `Reducer`类似vuex中的`Mutation`，是修改State的唯一途径。
  - `Effect`类似vuex中的`Action`，Effect不可以直接修改State，但它可以dispatch action来触发Reducer来修改。

![elux动态逻辑图](/images/dynamic-structure.svg)

## Aciton的定义

```ts
export interface Action {
  type: string; //通常由ModuleName.ActionName组成
  //通常无需设置，同时有多个handler时，可以特别指明处理顺序
  priority?: string[];
  payload?: any[];
}
```

## 创建并派发Action

- 自动创建（更可以享受到**TS的类型提示**）

    在Model中自动创建并派发Action:

    ```ts{6,10}
    import {Modules} from '@/Global';

    export class Model extends BaseModel<ModuleState, APPState> {
        protected async test() {
            //本Model中可以用this.actions
            const logoutAction = this.actions.logout();
            console.log(logoutAction); //{type:'stage.logout'}
            await this.dispatch(logoutAction); //可以await该Action的执行
            //非本Model中可以用Modules.article.actions
            const searchAction = Modules.article.actions.search({keyword:'aaa'});
            this.dispatch(searchAction);
        }
    }
    ```

    在View中自动创建并派发Action:

    ```ts
    const Component = ({curUser, notices, dispatch}) => {
       const onLogout = () => dispatch(Modules.stage.actions.logout());

       return <button onClick={onLogout}>退出</button>
    }
    ```

    使用GetActions()写法：

    ```ts
    //当需要 dispatch 多个 module 的 action 时，例如：
    dispatch(Modules.a.actions.a1())
    dispatch(Modules.b.actions.b1())

    //这种写法可以简化为：
    const {a, b} = GetActions('a', 'b')
    dispatch(a.a1())
    dispatch(b.b1())
    
    ```

- 手动创建（type和payload都没有TS类型提示）

    ```ts

    export class Model extends BaseModel<ModuleState, APPState> {
        protected async test() {
            const logoutAction = {type:'stage.logout'};
            await this.dispatch(logoutAction);
            const searchAction = {type:'article.search', payload:{keyword:'aaa'}};
            this.dispatch(searchAction);
        }
    }
    ```

## 内置特殊Action

框架内置了几个特殊的Action(以_前缀)，它们在特定的时机会自动派发：

- `stage._error` effect运行中出现任何错误，框架将自动派发该action，可以使用effect监听该action来统一处理错误。
- `stage._testRouteChange` 路由`准备跳转`时会自动派发该action，可以使用effect监听该action，并阻止路由跳转。
- `stage._beforeRouteChange` 路由`准备前`时会自动派发该action，可以使用effect监听该action，在跳转前保存某些有用的数据，如未提交的表单等。
- `stage._afterRouteChange` 路由`准备完成`时会自动派发该action，可以使用effect监听该action，如获取最新的路由信息注入ModuleState中。
- `module._initState` 用来注入初始的ModuleState，Model的onMount中必需派发该action。
- `module._updateState` 用来简单的合并更新ModuleState。
- `module._loadingState` 用来将执行过程作为loading状态注入ModuleState，effect的执行过程可以自动派发该action。

## 泛监听

可以使用一个Hander监听多个Action：

- 使用`,`符号分隔多个actionType
- 使用`*`符号作为moduleName的通配符
- 使用`this`可以指代本模块名

```ts
// src/modules/moduleB/model.ts
class Model extends BaseModel 

  @effect()
  //同时监听2个模块的'_initState' Action
  async ['moduleA._initState, moduleA._initState'](){
    console.log('moduleA/moduleB inited');
  }

  @effect()
  //同时监听所有模块的'_initState' Action
  async ['*._initState'](){
    console.log('all inited');
  }
}
```

## 多个Handler的执行顺序

既然Action是Model中的事件，dispatch一个action可以触发多个reducer和effect，那么它们是同步还是异步？执行顺序是怎样的？

假设有3个模块都监听了Stage.logout事件：

```ts{7,13}
// src/modules/stage/model.ts

//监听本模块自己的Action
class Model extends BaseModel {
  @reducer
  logout(){
    console.log('stage.reducer');
    return {...this.state, curUser: null}
  }

  @effect()
  async ['this.logout'](){
    console.log('stage.effect');
  }
}
```

```ts{7,14}
// src/modules/moduleA/model.ts

//监听其它模块的Action
class Model extends BaseModel {
  @reducer
  ['stage.logout'](){
    console.log('moduleA.reducer');
    return {...this.state, editable: false}
  }

  @effect()
  //注意后面的小尾巴[,]这是一种hack写法
  async ['stage.logout,'](){
    console.log('moduleA.effect');
  }
}
```

```ts{7,14}
// src/modules/moduleB/model.ts

//监听其它模块的Action
class Model extends BaseModel {
  @reducer
  ['stage.logout'](){
    console.log('moduleB.reducer');
    return {...this.state, editable: false}
  }

  @effect()
  //注意后面的小尾巴[,]这是一种hack写法
  async ['stage.logout,'](){
    console.log('moduleB.effect');
  }
}
```

现在`dispatch(Modules.stage.actions.logout())`，我们可以看到：

```text
stage.reducer
moduleA.reducer
moduleB.reducer
stage.effect
moduleA.effect
moduleB.effect
```

- 所有`reducer`被最先同步执行，而此`action宿主模块`的reducer第一个执行（stage模块是此action的宿主模块，其它都是被动监听模块）。
- 所有`effect`都在reducer执行完成之后才执行，同样`action宿主模块`的effect第一个执行。

::: tip 同一个Model对同一个Action保持一份监听(reducer和effect各一个)

为什么？因为没必要多份，你完全可以在 reducer 和 effect 中调用其它方法。

:::

### 改变执行顺序

可以使用Action的`priority`属性来强制更改不同Handler的执行顺序，如：

> `dispatch({type: 'stage.logout', priority: ['moduleB']})`

这样会把 moduleB 的 reducer 和 effect 优先执行，**但是不推荐这么做，保持模块之间的松散性**，可以改为：

- ModuleB 执行完后，dispatch一个新的action
- MouldeA 监听这个新的action

### await Action执行结果

可以等待一个action的所有handler执行完成，比如：

- 在View中：

  ```ts
  // src/modules/stage/views/LoginForm.tsx

  const onSubmit = () => {
    const result = dispatch(Modules.stage.actions.login({username, password}));
    // 结果是一个Promise
    result.catch(({message}) => {
      setErrorMessage(message);
    });
  }

  ```

- 在Model中：

  ```ts
  // src/modules/article/model.ts

  public async onMount(): Promise<void> {
    this.dispatch(this.privateActions._initState({currentView}));
    if (currentView === 'list') {
      await this.dispatch(this.actions.fetchList(listSearch));
    } else if (currentView && itemId) {
      await this.dispatch(this.actions.fetchItem(itemId));
    }
  }

  ```

## 错误与处理

ActionHandler相当于一条执行链，执行过程中若出现任何错误，框架将自动dispatch一个type为`stage._error`的Action（通常actionName为_表示是框架内置的Action）

可以通过effect来监听这个ErrorAction，然后决定是消化错误还是继续抛出。**如果继续抛出，则该ActionHandler的执行链将就此中断**。

## 中间件与日志记录

中间件可以在Action和Store中间建立一条管道，类似于Redux的Middleware，它的类型定义如下：

```ts
export type StoreMiddleware = (api: {getStore: () => IStore; dispatch: Dispatch}) => (next: Dispatch) => (action: Action) => void | Promise<void>;
```

日志记录是一个回调函数，每一次dispatch都会调用该回调函数，它的类型定义如下：

```ts
export type storeLoggerInfo = {
  id: number;
  isActive: boolean;
  actionName: string;
  payload: any[];
  priority: string[];
  handers: string[];
  state: any;
  effect: boolean;
};

export type StoreLogger = (info: storeLoggerInfo) => void;
```

使用中间件和日志记录：

```ts
// src/Project.ts
//Elux全局设置，参见 https://eluxjs.com/api/react-web.setconfig.html
export const appConfig: AppConfig = setConfig({
  StoreLogger: (info) => console.log(info),
  StoreMiddlewares: [...],
});
```

## DevTools

Elux兼容Redux的`devTools`，并改进了它的显示信息，参见[/guide/dev-tools](/guide/dev-tools)
