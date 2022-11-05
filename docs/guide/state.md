# Elux中的状态管理

笔者也用过很多态管理框架，大部分都是`Flux框架`的变种，只不过加上了一些自己的糖衣和辅助方法。

![7bf3a2fb783c277bb2131d9d5e40a87a.jpeg](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/5ac117b826a64ed083533591a1a4ce7e~tplv-k3u1fbpfcp-watermark.image?)

- 📢 只要糖衣做得好，省时省力人人要！
- 后面随着`Typescript`的普及，自动类型推断也是状态管理框架易用性的重要指标。
  
我们先简单回顾几款主流的Flux状态管理框架写法：

```ts
//基于Redux的Dva：
{
  state(){
    return {curUser: null}
  },
  reducers: {
    setUser(state, {payload}) {
      return {...state, curUser: payload}
    },
  },
  effects: {
    *login({ payload: {username, password} }, { put, call }){
      const { data } = yield call(api.login, username, password);
      yield put({ type: 'setUser', payload: data }); //无TS类型提示
    }
  }
};

//Vuex：
{
  state(){
    return {curUser: null}
  },
  mutations: {
    setUser(state, curUser) {
      state.curUser = curUser;
    }
  },
  actions: {
    async login({ commit }, {username, password}) {
      const { data } = await api.login(username, password);
      commit('setUser', data) //无TS类型提示
    }
  }
}

//Pinia：
{
 state(){
  return {curUser: null}
 },
 actions: {
   setUser(curUser) {
    this.curUser = curUser;
   }
   async login(username, password) {
      const { data } = await api.login(username, password);
      this.setUser(data) //有TS类型提示
   }
 } 
}
```

果然都是一个妈生的，本质上无非就是玩3个概念：

- State
- 同步Action
- 异步Action

## 为Flux再添一把火🔥

Elux内置了自己的状态管理框架，它也是属于`Flux`框架的一个变种，先看它的基本用法：

```ts
class Model{
  onMount() {
    //初始赋值State
    this.dispatch(this.actions._initState({curUser: null}));
  }

  @reducer //类似Vuex的mutations
  setUser(curUser) {
    //react中必需返回一个新state
    //return {...this.state, curUser};
    this.state.curUser = curUser;
  }

  @effect() //类似Vuex的action
  async login(username, password) {
    const { data } = await api.login(username, password);
    await this.dispatch(this.actions.setUser(data));
    this.getRouter().relaunch({url: HomeUrl});
  }
}
```

- **onMount**：初始化钩子，在其中完成State的初始赋值。
- **reducer**：React系很容易理解，Vue系可以理解为mutation，它是改变State的唯一途径。
- **effect**：React系很容易理解，Vue系可以理解为action，它是异步Action。

所以从糖衣语法来说`Elux`其实与Dva/Vuex/Pinia也差不多，不同在于：

- Elux使用`Decorator`装饰器语法来定义`reducer(mutation)`和`effect(action)`，这样更简洁。
- Elux使用`Class`来组织Model，有2点好处：
  - 可以通过类的继承和多态来复用公共逻辑。
  - 可以通过TS的类成员权限（public/private/protected）来更好的封装。

## Elux特性

除了糖衣语法，Elux还有其更深层次的创新：

![model-structure.png](https://p6-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/ffda8e7762a541f88e25a78db11239e9~tplv-k3u1fbpfcp-watermark.image?)

从图中可以看出Elux的特性：

- store中保存了所有state
- 每个Model管理store下的一个节点
- view从store中获取state
- dispatch(action)是触发reducer/effect的唯一途径
- reducer是纯函数，也是修改state的唯一途径
- effect可以处理任何异步操作，但不能直接修改state
- 一个action的派发类似于事件，可以触发多个reducer和effect监听
- view/effect/router都可以派发action

### 自动生成Action

这点类似于Pinia，不需要手动盲写类似于`{type:"xxx.xxx",payload:xxxx}`这样的Action结构体，而是通过方法自动生成：

```ts
const loginAction = stageActions.login('admin','123456');
//等于{type: 'user.login', payload:{username:'admin', password:'123456'}}
dispatch(loginAction);
```

且具备完美的TS类型提示：

![elux-ts](https://p3-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/4575053fad264ef986d5c89730636774~tplv-k3u1fbpfcp-zoom-1.image)

### 模块化

Elux使用**微模块**来组合应用，每个微模块对应一个`业务模型Model`，每个`Model`使用`reducer/effect`来维护`Store`下的一个节点`ModuleState`。

**微模块**是一种前端业务模块化方案，参见[《微模块》](/designed/micro-module.html)

### 事件化

将`action`当做Model中的事件，将`reducer`、`effect`当做Handler，这意味着dispatch(action)可以触发多个reducer和effect。

通过`事件总线机制`，在保持各Model松散性的同时，加强Model之间的协同交互，举个例子：

> 假设有3个模块：user(用户模块)、article(文章模块)、my(个人中心模块)
>
> 当用户登录时，article(文章模块)需要将状态修改为可编辑，my(个人中心模块)需要获取最新通知

`user/model.ts`中编写登录逻辑：

```ts
// src/modules/user/model.ts

export class Model extends BaseModel<ModuleState> {
  @reducer
  public setUser(curUser: User) {
    this.state.curUser = curUser;
  }
  @effect()
  public async login(username: string, password: string) {
    const { data } = await api.login(username, password);
    await this.dispatch(this.actions.setUser(data));
    this.getRouter().relaunch({url: HomeUrl});
  }
}
```

`article/model.ts`中通过reducer监听`setUserAction`：

```ts
// src/modules/article/model.ts

export class Model extends BaseModel<ModuleState> {
  @reducer
  public ['user.setUser'](curUser: User) {
    //根据当前用户是否登录来决定是否可编辑
    this.state.editable = curUser.hasLogin;
  }
}
```

`my/model.ts`中通过effect监听`setUserAction`：

```ts
// src/modules/my/model.ts

export class Model extends BaseModel<ModuleState> {
  @reducer
  public updateNotices(notices: Notices[]) {
    this.state.notices = notices;
  }
  @effect()
  public async ['user.setUser'](curUser: User) {
    if(curUser.hasLogin){
        const notices = await this.api.getNotices();
        this.dispatch(this.actions.updateNotices(notices));
    }
  }
}
```

`user/views/Login.tsx`中派发`loginAction`：

```tsx
// src/modules/user/views/Login.tsx

export default ({dispatch}) => {
  const login = () => {
    dispatch(userActions.login('admin', '123456'));
  };
  return (
     <div>
        <button onClick={login} >登录</button>
     </div>
  );
}
```

### 统一化

数据模式有2大基本阵营：ImmutableData 和 MutableData。Redux是`ImmutableData`阵营的代表；Vue为`MutableData`的代表。

Elux可以**同时兼容这2种数据模式**，它们的唯一区别在reducer中：

- ImmutableData：要求返回一个新数据，不可以修改原数据。
- MutableData：可以直接修改原数据。

```ts
class Model{
  @reducer
  setUser(curUser) {
    //vue中可以直接修改state：
    this.state.curUser = curUser;
    //react中必需返回一个新state
    //return {...this.state, curUser};
  }
}
```

当然，在MutableData模式下，返回一个新数据也是可以的，这为`跨React和Vue项目共享Model`提供了解决方案。

### await dispatch

actionHander中如果有异步操作，将返回一个promise，可以await其执行，例如：

```ts
// src/modules/user/views/Login.tsx

const onSubmit = (values: HFormData) => {
    const result = dispatch(userActions.login(values));
    result.catch(({message}) => {
      //如果出错(密码错误)，在form中展示出错信息
      form.setFields([{name: 'password', errors: [message]}]);
    });
};
```

### 跟踪effect执行情况

通常effect中包含异步操作，对于异步操作我们通常都需要显示Loading，Elux中可以很方便的跟踪它的执行情况，只需要在装饰器`effect()`中传入Loading状态Key名即可。

- @effect('this.loginLoading')：表示将执行情况注入`this.state.loginLoading`中
- @effect() 不传参数等于@effect('stage.globalLoading')：表示将执行情况注入`stage.state.globalLoading`中
- @effect(null)：参数为null表示不跟踪执行情况

```ts
// src/modules/user/model.ts

export class Model extends BaseModel<ModuleState> {
  
  @effect('this.loginLoading') //将该方法的执行情况注入this.state.loginLoading中
  public async login(username: string, password: string) {
    const { data } = await api.login(username, password);
    await this.dispatch(this.actions.setUser(data));
    this.getRouter().relaunch({url: HomeUrl});
  }
}
```

在View中使用`loginLoading`状态

```tsx
// src/modules/user/views/Login.tsx

export default ({dispatch, loginLoading}) => {
  return (
     <div>
        <button onClick={login} disable={loginLoading==='Start'} >登录</button>
     </div>
  );
}
```

### 自动合并和维护Loading队列

不仅可以很方便的跟踪和注入loading状态，框架还自动维护loading队列，比如相同Key名的多笔loading状态将自动合并成队列管理（队列中的任务全部完成即改变loading状态）。

### 自动区分浅度Loading和深度Loading

```ts
export type LoadingState = 'Start' | 'Stop' | 'Depth';
```

比如不超过1秒的loading为浅度Loading，否则为深度Loading，这样区分的好处是：对于浅度Loading只需要防止用户重复点击，视觉上用户不用感知，否则会出现一闪而过的Loading界面，反而会影响用户体验。

```tsx
const Component: FC<Props> = ({loadingState}) => {
  return (
    <div className="global-loading">
      {loadingState === 'Depth' && <div className="loading-icon" />}
    </div>
  );
};
```

## 方便的错误处理

effect执行中出现任何失败或者错误，都将自动派发一个`stage._error`的内置action，可以监听它来集中处理错误：

```ts
// src/modules/stage/model.ts

export class Model extends BaseModel<ModuleState> {
  @effect(null)
  protected async ['this._error'](error: CustomError) {
      if (error.code === CommonErrorCode.unauthorized) {
          this.getRouter().push({url: '/login'}, 'window');
      }else{
          alert(error.message);
      }
      throw error;
  }
}
```

### 支持泛监听

可以使用一个Hander监听多个Action：

- 使用`,`符号分隔多个actionType
- 使用`*`符号作为moduleName的通配符
- 使用`this`可以指代本模块名

```ts
class Model extends BaseModel 
  @effect()
  //同时监听2个模块的'_initState'
  async ['moduleA._initState, moduleA._initState'](){
    console.log('moduleA/moduleB inited');
  }
  @effect()
  //同时监听所有模块的'_initState'
  async ['*._initState'](){
    console.log('all inited');
  }
}
```

### 支持路由守卫

路由发生跳转时会自动派发几个内置的action：

- `stage._testRouteChange`：是否允许本次跳转。你可以监听它，阻止路由跳转：

  ```ts
  export class Model extends BaseModel<ModuleState> {
    private checkNeedsLogin(pathname: string): boolean {
      return pathname.startsWith('/admin/')
    }
    @effect(null)
    protected async ['this._testRouteChange']({url, pathname}) {
      if (!this.state.curUser.hasLogin && this.checkNeedsLogin(pathname)) {
          throw new CustomError(CommonErrorCode.unauthorized, '请登录！');
      }
    }
  }
  ```

- `stage._beforeRouteChange`：路由即将跳转。你可以监听它，执行某些逻辑...
- `stage._afterRouteChange`：路由跳转完成。你可以监听它，执行某些逻辑...

### 多实例历史快照

- 路由push时你可以将当前Store实例冻结起来，并保存在历史栈中。
- 路由back时将自动激活之前被冻结的Store实例，快速恢复历史状态。

![router-store.png](https://p1-juejin.byteimg.com/tos-cn-i-k3u1fbpfcp/0f5151b47fd94b47b645b7d97870b05d~tplv-k3u1fbpfcp-watermark.image?)

### 自动清理无用状态

传统全局Store有个很大的弊端，就是Store中的状态会不断累积，缺乏自动释放机制。比如当前路由从`用户列表`跳转到了`文章列表`，如果不主动操作，Store中的`userList`可能一直存在。

Elux改进了这个痛点，每次路由发生变化时都将创建一个空的Store，然后挑选出有用的状态重新挂载，这也相当于一种自动垃圾回收机制。
