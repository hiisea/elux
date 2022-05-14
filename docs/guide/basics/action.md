# Action与Handler

Elux中的Action概念与Redux基本相同。

::: tip Elux中Action的特别之处

- Action是Model中的事件，dispatch一个Action将触发各模块中监听该Action的多个ActionHandler执行
- ActionHandler按职能可分为：
  - `Reducer`类似vuex中的`Mutation`是修改State的唯一途径
  - `Effect`类似vuex中的`Action`Effect不可以直接修改State，但它可以dispatch action来触发Reducer

:::

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

- 自动创建（更可以享受到TS的类型提示）

    ```ts
    import {Modules} from '@/Global';

    export class Model extends BaseModel<ModuleState, APPState> {
        protected async test() {
            //本Model中可以用this.actions
            const logoutAction = this.actions.logout();
            console.log(logoutAction); //{type:'stage.logout'}
            //可以await该Action的所有Handler执行完成
            await this.dispatch(logoutAction);
            //非本Model中可以用Modules.article.actions
            const searchAction = Modules.article.actions.search({keyword:'aaa'});
            console.log(searchAction); //{type:'article.search', payload:{keyword:'aaa'}}
            this.dispatch(searchAction);
        }
    }
    ```

- 手动创建

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

```ts
// src/modules/stage/model.ts
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

```ts
// src/modules/moduleA/model.ts
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

```ts
// src/modules/moduleB/model.ts
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

- 所有`reducer`被先同步执行，而此`action宿主模块`的reducer被最先执行。stage模块是此action的宿主模块，其它都是`被动监听模块`。
- 所有`effect`都在reducer执行完成之后才执行，同样`action宿主模块`的effect被最先执行。

### 改变执行顺序

可以使用Action的`priority`属性来强制更改不同Handler的执行顺序，如：

> `dispatch({type: 'stage.logout', priority: ['moduleB']})`

这样会把moduleB的reducer和effect优先执行，但是最好不要这样做，而保持模块之间的松散性。
如果模块handler依赖于其它模块作为先决条件，可以让其它模块在完成之后dispatch一个新的action。

### await所有Hander的执行

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

::: tip 同一个Model对同一个Action保持一份监听(reducer和effect各一个)

为什么？因为没必要多份，你完全可以在reducer和effect中调用其它方法。

:::

## 错误与处理

ActionHandler相当于一条执行链，执行过程中若出现任何错误，框架将自动dispatch一个type为`stage._error`的Action（通常actionName为_表示是框架内置的Action）

任何模块都可以通过effect来监听这个ErrorAction，然后决定是消化错误还是继续抛出。**如果继续抛出，则该ActionHandler的执行链将就此中断**。参见 [/guide/basics/model](/guide/basics/model.html)

## 中间件与日志记录

中间件可以在Action和Store中间建立一条管道，类似于Redux的Middlewar，它的类型定义如下：

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
