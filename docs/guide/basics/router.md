# Router与路由

Elux抹平了各平台、各UI库中路由的千差万别，实现了统一的带二维历史栈的虚拟路由。设计思想参见：[路由与历史](/designed/route-history.html)

![elux路由与历史记录](/images/router-stacks.svg)

从图中可以看出，Elux中的历史栈有2种：`WindowHistoryStack`和`PageHistoryStack`，分别用来保存`Window`和`Page`的历史记录。

- 这里的`Window`并非浏览器对象，而是Elux中的**虚拟Window**，它包含了一条`PageHistoryStack`和`CurrentPage`的历史快照(Store和View)。
- 这里的`Page`仅包含路由信息(Url)，每次发生路由跳转我们就认为打开了一个新**Page**，将其Url记录在`PageHistoryStack`。
- Window中保存了Store和View，属于"重资产"，我们限制`WindowHistoryStack`的条数最多为`10`条
- Page中仅保存Url，属于"轻资产"，我们限制`PageHistoryStack`的条数最多为`20`条

::: tip 二维历史栈

注意这里是二维历史栈，并不是2条历史栈。`WindowHistoryStack`最大为10，每个Window中包含一条`PageHistoryStack`，所以最多可能存在`11`条历史栈，总共可以记录`200`次路由跳转历史记录

:::

## Current与Active

- 每条历史栈中的第一个记录是`当前记录`，如图所示包括一个`CurrentWindow`和多个`CurrentPage`。
- CurrentWindow中的CurrentPage是`ActivePage`，它是**唯一被显示的当前页面**。
- 其它CurrentPage是`InactivePage`，它们相当于历史快照，如果不发生路由`回退`操作，它们将无法感知。

WindowHistoryStack的`增加`操作，将导致当前ActivePage变为InactivePage，而`回退`操作，将导致历史栈中的InactivePage变为ActivePage。

> 从图中可以看出，`Router/Store/Model`之间都存在某种一对多的关联...

ActivePage与InactivePage相互转变时，会触发相应的`store.active`属性发生变化，进而触发store中挂载的model的钩子`onActive()`和`onInactive()`

::: tip 激活和冻结

- 页面被**激活**（变为显示页面）时将触发`model.onActive()`钩子，可以执行一些激活逻辑，比如开启定时器轮询最新数据。
- 页面被**冻结**（变为历史快照）时将触发`model.onInactive()`钩子，可以清除onActive中的副作用，比如清除计时器。

:::

更多相关信息参见：[Model](/guide/basics/model)

## Router的定义

Router维护和管理了这些历史栈，并提供了一些方法给外界使用。

```ts

//二种历史栈类型
export type RouteTarget = 'window' | 'page';

export interface IRouter {
  //路由跳转时，Router本身也会派发一个事件
  addListener(callback: (data: RouteEvent) => void | Promise<void>): UNListener;
  //路由初始化时的参数，通常用于SSR时传递原生的Request和Response对象
  initOptions: RouterInitOptions;
  action: RouteAction; //当前路由的动作
  location: Location; //当前路由的信息
  routeKey: string; //当前路由的唯一ID
  runtime: RouteRuntime<TStoreState>; //当前路由的相关运行信息
  getActivePage(): {url: string; store: IStore}; //获取当前被激活显示的页面
  getCurrentPages(): {url: string; store: IStore}[]; //获取当前所有CurrentPage(PageHistoryStack中的第一条)
  getHistoryLength(target?: RouteTarget): number; //获取指定栈的长度
  getHistory(target?: RouteTarget): IRouteRecord[]; //获取指定栈中的记录
  //用`唯一key`来查找历史记录，如果没找到则返回 `{overflow: true}`
  findRecordByKey(key: string): {record: IRouteRecord; overflow: boolean; index: [number, number]};
  //用`回退步数`来查找历史记录，如果步数溢出则返回 `{overflow: true}`
  findRecordByStep(delta: number, rootOnly: boolean): {record: IRouteRecord; overflow: boolean; index: [number, number]};
  //清空指定栈中的历史记录，并跳转路由
  relaunch(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
  //在指定栈中新增一条历史记录，并跳转路由
  push(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
  //在指定栈中替换当前历史记录，并跳转路由
  replace(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
  //回退指定栈中的历史记录，并跳转路由
  back(stepOrKey?: number | string, target?: RouteTarget, payload?: any, overflowRedirect?: string): void | Promise<void>;
}
```

## 创建Router

Router的创建与销毁由框架自动完成，无需干预。

- 在SSR(服务器渲染)时，每个`用户请求request`将生成一个独立的Router；
- 其它CSR(客户端渲染)时，全局只会创建一个唯一的Router。

## 获取Router

- 在Model中，可以通过`this.getRouter()`获取
- 在View中，可以通过`useRouter()`获取
- 在非SSR环境中因为是唯一的，所以也可以通过`GetClientRouter()`获取
- 如果获得了Store对象，也可以通过`store.router`获取

## 路由跳转

::: tip 双栈单链

虽然Elux虚拟路由有**双栈**(最多可能存在`11`条历史栈)，但因为我们使用**单链**模式，实际上能操作的历史栈只有`2`条：

- WindowHistoryStack
- CurrentWindow下面的PageHistoryStack

:::

因为存在2条可以操作的历史栈，所以路由跳转时必需指明对哪个栈进行操作，即指明`RouteTarget`，默认为`PageHistoryStack`。

4个基本的路由跳转方法为：

- push：在指定栈中**新增**一条历史记录，并跳转路由。
- replace：在指定栈中**替换**当前历史记录，并跳转路由。
- relaunch：**清空**指定栈中的历史记录，并跳转路由。
- back：**回退**指定栈中的历史记录，并跳转路由。

### push/replace/relaunch方法类似

`relaunch(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any)`

其中第3个参数`payload`如果给出，它将保存到`router.runtime`中，可供后续路由页面使用。

```ts
//不指定RouteTarget，默认为'page'，即操作的是CurrentPageHistoryStack
this.getRouter().relaunch({url: '/home'});
//指定RouteTarget为'window'，即操作的是WindowHistoryStack
this.getRouter().relaunch({url: '/home'}, 'window');
//第3个参数将直接保存到router.runtime中，可供路由后的页面获取
this.getRouter().relaunch({url: '/home'}, 'window', {refreshRequired: true});
```

### back方法有点不一样

`back(stepOrKeyOrCallback?: number|string|function, target?: RouteTarget, payload?: any, overflowRedirect?: string | null)`

- 第一个参数：
  - 是数字时，表示回退多少步
  - 是字符时，表示回退到哪条历史记录，key是历史记录的唯一ID
  - 是回调函数时：(record: IRouteRecord) => boolean
- 回退溢出：如果回退步数超过历史栈中的记录数，或者找不到回退目标记录。此时将直接`relaunch()`到第4个参数`overflowRedirect`或者全局设置的`应用首页`，并抛出`ROUTE_BACK_OVERFLOW`错误。这可以理解为，默认回退到最后会跳回`首页`。
- 注意回退目标为`page`时，范围并不限于CurrentWindow下面的`PageHistoryStack`，而是将所有`PageHistoryStack`拼合在一起。这可以理解为，回退所有历史记录直到溢出。

```ts

//回退2步。不指定RouteTarget，默认为'page'，操作的是所有PageHistoryStack
back(2);
//回退到key为'23_12'的那一条历史记录。target为'window'，操作的是WindowHistoryStack
back('23_12', 'window');
//回退到第一条不需要登录的历史记录
back((record) => {
  return !checkNeedsLogin(record.location.pathname);
}, 'window')
//第3个参数将直接保存到router.runtime中，可供路由后的页面获取
back(3, 'window', {refreshRequired: true});
```

### 跳转Runtime

注意到以上路由方法中的第3个参数`payload?: any`，该参数将保存在`Router.runtime`中，作为`路由后页面`获取`路由前页面`某些数据的途径。

除此之外，`Route.runtime`还保存路由跳转前的Store状态：

```ts
export interface RouteRuntime<TStoreState extends StoreState = StoreState> {
  timestamp: number; //路由跳转发生的时间戳
  payload: unknown; //路由跳转时附加的数据，路由跳转方法的第3个参数
  prevState: TStoreState; //路由跳转前的状态
  completed: boolean; //路由跳转是否已经完成
}
```

## 搜索历史记录

在[路由与历史](/designed/route-history.html)中提到过一个场景：

> 打开商品列表页面之前，我们可以先查找一下当前的历史栈中是否存在商品列表记录，如果没有则push('/goodsList')，如果有则back(2)

我们来看一下相关API：

```ts
//获取指定栈中的记录条数
getHistoryLength(target): number;
//获取指定栈中的记录
getHistory(target?: RouteTarget): IRouteRecord[]; 
//用`唯一key`来查找某条路由记录，如果没找到则返回 `{overflow: true}`
findRecordByKey(key: string): {record: IRouteRecord; overflow: boolean; index: [number, number]};
//用`回退步数`来查找某条路由历史记录，如果步数溢出则返回 `{overflow: true}`
findRecordByStep(step: number, rootOnly: boolean): {record: IRouteRecord; overflow: boolean; index: [number, number]};
```

场景中的解决方案为：

```ts
toGoodsList() {
    const router = this.getRouter();
    const record = router.getHistory('window').find((item) => item.location.pathname === '/goodsList');
    if (record) {
      router.back(record.key);
    } else {
      router.push({url: '/goodsList'});
    }
}
```

### 路由前置与后置

按照数据的提前获取与滞后获取，Elux有2种路由跳转风格：

- `数据前置，路由后置`：在UI跳转前，先把页面所需的数据全部获取准备好。优点是UI跳转时数据都已准备好，所以UI上不用设计`Loading/骨架屏`等加载过程，也不用考虑加载出错（如果数据请求出错，路由将放弃跳转）；缺点是必需根据路由手动编写数据请求的代码。
- `路由前置，数据后置`：UI先跳转，数据根据UI加载自动瀑布式获取。优点是简单，不用额外编写数据请求的代码；缺点是UI跳转了，此时数据可能还没请求回来，需要设计`Loading/骨架屏`等加载过程，还得考虑数据请求出错时的错误展示。

::: tip SSR服务器渲染，只支持数据前置，路由后置

服务器渲染时，必需先取回数据，然后再渲染UI，所以只能使用`数据前置，路由后置`路由风格

:::

### 跳转流程

所有路由跳转的流程大致如下：

1. `store.dispatch({type: 'stage._testRouteChange'})`向Store派发一个`准备跳转`的Action。  
   可以使用effect监听该Action，并决定是否阻止(在effect中抛出一个错误可阻止)。
2. `store.dispatch({type: 'stage._beforeRouteChange'})`向Store派发一个`跳转前`的Action。  
   可以使用effect监听该Action，在跳转前保存某些有用的数据，如未提交的表单等。
3. 创建一个新的空Store，并触发根模块`Model.onMount()`钩子。
4. 调用原生路由系统（也可以不调用）。
5. `router.dispatch(routeEvent)`Router自身派发一个路由事件。
6. `store.dispatch({type: 'stage._afterRouteChange'})`向Store派发一个`跳转后`的Action。  
   可以使用effect监听该Action，例如获取新的路由信息注入ModuleState中。

### 转场动画

因为只有`WindowHistoryStack`中保存了历史快照，所以转场动画只能存在于target为`window`时路由方法`push`和`back`。

```ts
this.getRouter().push({url: '/article/edit'}, 'window');

this.getRouter().back(2);
```

转场时顶级容器会经历以下`className`的变化：

- push时：
  1. class="`elux-app elux-animation elux-change elux-push`"
  2. class="`elux-app elux-animation`"
  3. class="`elux-app`"
- back时：
  1. class="`elux-app elux-animation elux-change elux-back`"
  2. class="`elux-app`"

大家可以根据这几个`className`来定义转场动画，通常有`左右滑动`和`淡入淡出`等，具体可以参考模版中的CSS代码。

### 定制window样式

当路由跳转target为`window`时，将产生一个`虚拟Window`，它的UI样式默认是全屏覆盖的，你也可以定制它的样式：

```ts
push({url: '/shop/list', classname:'_dialog'}, 'window');
```

参数`classname:'_dialog'`将生成className为`_dialog`的虚拟Window，可以它来定义CSS。例如模版中的Admin风格，就定义了Dialog风格的路由跳转。

## 与运行平台原生路由的关系

Elux中的虚拟路由不依赖于原生路由而独立运行，原生路由可以以`外挂`的模式与虚拟路由建立关联与互动。

它们之间的互动分为二种场景：

- 虚拟路由主动发起，带动原生路由：用户体验较好，可以使用路由拦截、守卫等功能。
- 原生路由主动发起，带动虚拟路由，可能造成反应滞后或超前的不佳用户体验，且无法拦截。

::: tip 尽量使用Elux虚拟路由主动发起

- 除非受到运行平台的限制而无法使用虚拟路由（如:浏览器中用户可以点击后退按钮，操作地址栏等；小程序中用户可以点击手机后退键、点击TabBar跳转等)，否则优先使用Elux虚拟路由进行跳转。

- 虚拟路由的Url可与原生路由不一致，应用内部流通应当使用虚拟路由Url，对原生路由Url的转换在路由`入口和出口`处进行统一进行。

:::

> 虚拟路由使用的URL是用户不可见的，而原生路由的URL才是对外公开的。开发中使用虚拟路由的URL，后续从产品角度美化/简化/语义化URL，不会引起代码的大规模改动（只需要修改映射规则即可）

![elux路由与历史记录](/images/router-transform.svg)

虚拟路由和原生路由Url的映射：

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

### 强制不通知原生路由

Elux的虚拟路由是独立运行的，所以你也可以选择完全忽略原生路由：

```ts
// src/Project.ts
export const appConfig: AppConfig = setConfig({
  DisableNativeRouter: true,
});
```

## 用组件的方式执行路由跳转

框架提供了一个内置组件`<Link>`，它类似于Html标签`<a>`

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
