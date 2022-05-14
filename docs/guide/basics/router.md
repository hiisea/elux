# Router与路由

Elux抹平了各平台、各UI库中路由的千差万别，实现了统一的带二维历史栈的虚拟路由。设计思想参见：[路由与历史](/designed/route-history.html)

![elux路由与历史记录](/images/router-stacks.svg)

从图中可以看出，Elux中的历史栈有2种：`WindowHistoryStack`和`PageHistoryStack`，分别用来保存`Window`和`Page`的历史记录。

- 这里的`Window`并非浏览器对象，而是Elux中的**虚拟Window**，它包含了一条`PageHistoryStack`和`CurrentPage`的历史快照(Store和View)。
- 这里的`Page`仅包含路由信息(URL)，每次发生路由跳转我们就认为产生了一个**Page**，将其路由信息记录在`PageHistoryStack`。

::: tip 注意

- Window属于"重资产"，我们限制`WindowHistoryStack`的条数最多为`10`条
- Page属于"轻资产"，我们限制`PageHistoryStack`的条数最多为`20`条

:::

> 注意这里是二维历史栈，并不是2条历史栈，`WindowHistoryStack`最大为10，所以实际上最多可能存在`11`条历史栈，可以记录`200`次路由跳转历史记录

## Current与Active

- 每条历史栈中的第一个记录是`当前记录`，如图所示包括一个`CurrentWindow`和多个`CurrentPage`。
- CurrentWindow中的CurrentPage称为`ActivePage`，它是**唯一被显示的当前页面**。
- 其它CurrentPage称为`InactivePage`，它们相当于历史快照，如果不发生路由`回退`操作，它们将无法感知。

WindowHistoryStack的`Push`操作，将导致当前ActivePage变为InactivePage，而`back`操作，将导致历史栈中的InactivePage变为ActivePage。

> 从图中可以看出，`Router/Store/Model`之间都存在某种一对多的关联。

ActivePage与InactivePage相互转变时，会触发相应的`store.active`属性发生变化，进而触发store中挂载的model的钩子`onActive()`和`onInactive()`

::: tip 注意

- 在`model.onActive()`钩子中，可以执行一些激活逻辑，比如开启定时器轮询最新数据；
- 在`model.onInactive()`钩子中记得要清除这些计时器。

:::

## 路由器的定义

路由器维护和管理了这些历史栈，并提供了一些方法给外界使用。

```ts

//二种历史栈类型
export type RouteTarget = 'window' | 'page';

export interface IRouter {
  //可以监听路由事件
  addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener;
  initOptions: RouterInitOptions; //路由初始化时的参数，SSR时可用来引用用户请求
  action: RouteAction; //路由动作
  location: Location; //路由信息
  routeKey: string; //每次路由变化都会产生唯一ID
  runtime: RouteRuntime<TStoreState>; //路由运行的状态
  getActivePage(): {url: string; store: IStore}; //获取当前被激活的页面
  getCurrentPages(): {url: string; store: IStore}[]; //获取所有window中的当前页面
  getHistoryLength(target?: RouteTarget): number; //获取指定路由栈的长度
  getHistory(target?: RouteTarget): IRouteRecord[]; //获取指定路由栈中的记录
  //用`唯一key`来查找某条路由记录，如果没找到则返回 `{overflow: true}`
  findRecordByKey(key: string): {record: IRouteRecord; overflow: boolean; index: [number, number]};
  //用`回退步数`来查找某条路由历史记录，如果步数溢出则返回 `{overflow: true}`
  findRecordByStep(delta: number, rootOnly: boolean): {record: IRouteRecord; overflow: boolean; index: [number, number]};
  //跳转一条路由，并清空所有历史记录
  relaunch(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
  //新增一条路由
  push(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
  //替换当前路由
  replace(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
  //回退历史记录
  back(stepOrKey?: number | string, target?: RouteTarget, payload?: any, overflowRedirect?: string): void | Promise<void>;
}
```

## 创建路由器

路由的创建与销毁由框架自动完成，无需干预。

- 在SSR(服务器渲染)时，每个`用户请求request`将生成一个独立的Router；
- 其它CSR(客户端渲染)时，全局只会创建一个唯一的Router。

## 获取路由器

- 在Model中，可以通过`this.getRouter()`获取
- 在View中，可以通过`useRouter()`获取
- 在非SSR环境中因为是唯一的，所以也可以通过`GetClientRouter()`获取
- 如果获得了Store对象，也可以通过`store.router`获取

## 路由跳转

::: tip 双栈单链

虽然Elux虚拟路由有**双栈**(最多可能存在`11`条历史栈)，但因为我们使用**单链**模式，所以实际上能操作的只有`2`条：

- WindowHistoryStack
- CurrentWindow下面的PageHistoryStack

:::

> 因为存在多个历史栈，所以路由跳转时必需指明对哪个栈进行操作`RouteTarget`，如果未指明默认操作的是**PageStack**。

- push
- replace
- relaunch
- back

### 跳转流程

路由的跳转流程大致如下：

1. `store.dispatch({type: 'stage._testRouteChange'})`向Store派发一个`准备跳转`的Action。  
   各Model可以使用effect监听该Action，并决定是不是阻止跳转(**在effect中抛出一个错误即可阻止**)。
2. `store.dispatch({type: 'stage._beforeRouteChange'})`向Store派发一个`跳转前`的Action。  
   各Model可以使用effect监听该Action，可以在跳转前保存某些有用的数据，如未提交的表单等。
3. 创建一个新的空Store，并执行`store.mount('stage')`挂载根模块。此时会调用根模块`onMount()`钩子，
   在此钩子中可重新向Store中注入有效的数据(**可以使用老数据也可以获取新数据**)。
4. 通知原生路由系统，**也可以强制不通知原生路由，此时相当于单页应用**。
5. `this.dispatch(routeEvent)`自身派发一个路由事件。
6. `store.dispatch({type: 'stage._afterRouteChange'})`向Store派发一个`跳转后`的Action。  
   各Model可以使用effect监听该Action，可以获取最新的路由信息注入ModuleState中。

### 转场动画

## 与运行平台原生路由的关系

Elux中的虚拟路由不依赖于原生路由而独立运行，原生路由以`外挂`的模式与虚拟路由建立关联与互动：

- 虚拟路由带动原生路由：用户体验较好，可以使用路由拦截、守卫等功能。
- 原生路由带动虚拟路由，可能造成反应滞后或超前(小程序中)的不佳用户体验，且无法拦截。

::: tip 请尽量使用Elux虚拟路由

1. 除非受到运行平台的限制而无法使用虚拟路由（如:浏览器中用户可以点击后退按钮，操作地址栏等；小程序中用户可以点击手机后退键、点击TabBar跳转等)，否则优先使用Elux虚拟路由进行跳转。
2. 虚拟路由的Url与原生路由可能不一致，**应用内部流通使用的应当是虚拟路由的Url**。而对原生路由Url的转换将在入口和出口处进行统一进行。

:::

![elux路由与历史记录](/images/router-transform.svg)

- 虚拟路由和原生路由Url的映射：

    ```ts
    // src/Project.ts
    export const appConfig: AppConfig = setConfig({
        //因为小程序的路由与目录结构是强关联的，此处映射虚拟路由:
        NativePathnameMapping: {
            in(nativePathname) { //外部(原生)转内部(虚拟)
                if (nativePathname === '/') {
                    nativePathname = '/modules/article/pages/list';
                }
                return nativePathname.replace(/^\/modules\/(\w+)\/pages\//, '/$1/');
            },
            out(internalPathname) { //内部(虚拟)转外部(原生)
                return internalPathname.replace(/^\/(\w+)\//, '/modules/$1/pages/');
            },
        },
    });
    ```

- 虚拟路由中的历史栈可以和原生路由中的历史栈进行同步。
  - 在浏览器环境中运行时，由于浏览器只有一个历史栈，所以不可能精确的进行同步。
  - 在小程序中运行时，框架通过对URL植入一个`小尾巴`来进行精确同步。

### 强制不通知原生路由

```ts
```
