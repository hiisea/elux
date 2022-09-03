# Router与路由

Elux抹平了各平台、各UI库中路由的千差万别，实现了统一的带`二维历史栈`的虚拟路由。设计思想参见[路由与历史](/designed/route-history.html)，用直观的映像来描述Elux中的虚拟路由：

~~敲黑板：**相当于在单页中虚拟了一个浏览器，并将Tab窗口叠起来...**

![elux虚拟路由示意图1](/images/router-browser.svg)

从图中可以看出，Elux虚拟路由的历史栈有2种：

- PageHistoryStack：相当于我们平时接触到的`window.history`，用来保存页面跳转的历史记录，每条历史记录可以想象成就是一条Url。
- WindowHistoryStack：相当于浏览器内部的`tab.history`，用来保存Tab窗口切换的历史记录，每条历史记录是一个虚拟Window（包括PageHistoryStack、View、Store）的历史快照。

路由的时候，我们可以选择在原Tab窗口中打开，或者新开一个Tab窗口打开：

- `router.push({url: "/list"}, "page")`在原窗口打开，`PageHistoryStack`将新增一条历史记录
- `router.push({url: "/list"}, "window")`新开一个Tab窗口打开，`WindowHistoryStack`将新增一条历史记录

![elux路由与历史记录](/images/router-stacks.svg)

- 这里的`Window`并非浏览器对象，而是Elux中的**虚拟Window**（也可以想象成浏览器的Tab窗口），它包含了一条`PageHistoryStack`和`CurrentPage`的历史快照(Store和View)。
- 这里的`Page`仅包含路由信息(Url)，每次发生路由跳转我们就认为打开了一个新**Page**，将其Url记录在`PageHistoryStack`。
- Window中保存了PageHistoryStack、Store和View，属于"重资产"，我们在`WindowHistoryStack`中只保存`10`条`Window`记录。
- Page其实只是一条Url，属于"轻资产"，我们在`PageHistoryStack`只保存`20`条`Url`记录。

::: tip 二维历史栈

注意这里是二维历史栈，并不是2条历史栈。`WindowHistoryStack`最多保存`10`条Window记录，而每个Window中都包含一条`PageHistoryStack`，所以最多可能存在`11`条历史栈，总共可以记录`200`次路由跳转历史记录。

:::

## Current与Active

- 每条历史栈中的第一个记录是`当前记录`，如上图所示，`WindowHistoryStack`的当前记录叫`CurrentWindow`，`PageHistoryStack`的当前记录叫`CurrentPage`。
- CurrentWindow中的CurrentPage是`ActivePage`，它是**唯一被显示的当前页面**。
- 其它CurrentPage是`InactivePage`，它们相当于历史快照，只有在路由`回退`时它们才会重新显示。

WindowHistoryStack新增一条记录，将导致当前ActivePage变为InactivePag；而`路由回退`操作，将导致历史栈中的InactivePage重新变为ActivePage。`ActivePage`与`InactivePage`相互转变时，会触发各挂载model的钩子：

- 页面被**激活**（变为显示页面）时将触发各model的`onActive()`钩子，可以执行一些激活逻辑，比如开启定时器轮询最新数据。
- 页面被**冻结**（变为历史快照）时将触发各model的`onInactive()`钩子，可以清除onActive中的副作用，比如清除计时器。

更多相关信息参见：[Model](/guide/basics/model)

## Router的定义

Router维护和管理了这些历史栈，并提供了一些方法给外界使用。

```ts

//二种历史栈类型
export type RouteTarget = 'window' | 'page';

export interface IRouter {
  //路由初始化时的参数，通常用于SSR时传递原生的Request和Response对象
  initOptions: RouterInitOptions;
  action: RouteAction; //当前路由的动作
  location: Location; //当前路由的信息
  routeKey: string; //当前路由的唯一ID
  runtime: RouteRuntime<TStoreState>; //当前路由的相关运行信息
  getActivePage(): {store: IStore; location: Location}; //获取当前被激活显示的页面(WindowHistoryStack中的第一条)
  getCurrentPages(): {store: IStore; location: Location}[]; //获取当前所有CurrentPage(PageHistoryStack中的第一条)
  getHistoryLength(target?: RouteTarget): number; //获取指定栈的长度
  getHistory(target?: RouteTarget): IRouteRecord[]; //获取指定栈中的记录
  //用`唯一key`来查找历史记录，如果没找到则返回 `{overflow: true}`
  findRecordByKey(key: string): {record: IRouteRecord; overflow: boolean; index: [number, number]};
  //用`回退步数`来查找历史记录，如果步数溢出则返回 `{overflow: true}`
  findRecordByStep(delta: number, rootOnly: boolean): {record: IRouteRecord; overflow: boolean; index: [number, number]};
  //根据部分路由信息计算完整Url
  computeUrl(partialLocation: Partial<Location>, action: RouteAction, target: RouteTarget): string;
  //清空指定栈中的历史记录，并跳转路由
  relaunch(location: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
  //在指定栈中新增一条历史记录，并跳转路由
  push(location: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
  //在指定栈中替换当前历史记录，并跳转路由
  replace(location: Partial<Location>, target?: RouteTarget, refresh?: boolean): void | Promise<void>;
  //回退指定栈中的历史记录，并跳转路由
  back(stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean), target?: RouteTarget, refresh?: boolean, overflowRedirect?: string): void | Promise<void>;
}
```

## 创建Router

Router的创建与销毁由框架自动完成，无需干预。

- 在SSR(服务器渲染)时，每个`用户请求request`将生成一个独立的Router；
- 其它CSR(客户端渲染)时，全局只会创建一个唯一的Router。

## 获取Router

- 在Model中，可以通过`this.getRouter()`获取
- 在View中，可以通过`useRouter()`获取
- 在非SSR环境中因为全局只会有一个Router，所以也可以通过`GetClientRouter()`获取
- 如果获得了Store对象，也可以通过`store.router`获取

## 路由描述

- Location对象

  ```ts
  interface Location {
    url: string;
    pathname: string;
    search: string;
    hash: string;
    classname: string;
    searchQuery: {[key: string]: any};
    hashQuery: {[key: string]: any};
    state: any;
  }
  ```

- Url转换为Location：

  ```ts
  import {urlToLocation} from '@elux/react-web';

  const location = urlToLocation('/article/list?currentPage=1&pageSize=10&__c=dialog#summary', {aaa: 111});
 
  /* location值为：
  {
    url: '/article/list?currentPage=1&pageSize=10',
    pathname: '/article/list',
    search: 'currentPage=1&pageSize=10',
    hash: 'summary',
    classname: 'dialog',
    searchQuery: {currentPage: '1', pageSize: '10'},
    hashQuery: {},
    state: {aaa: 111},
  }
  */
  ```

- Location转换为Url，只需提供部分路由信息即可：

  ```ts
  import {locationToUrl} from '@elux/react-web';

  const url = locationToUrl({
    pathname: '/article/list',
    searchQuery: {currentPage: '1', pageSize: '10'},
    hash: 'summary',
    classname: 'dialog',
  })

  /* url值为：
  '/article/list?currentPage=1&pageSize=10&__c=dialog#summary'
  */
  ```

::: tip 注意事项

- Location中的`state`可以用来传递任何值，但不会被保存在Url中。
- Location中的`classname`用来指定窗口的classname，它将以特殊参数`__c`保存在Url中。

:::

## 路由方法

4个基本的路由跳转方法为：

- push：跳转路由，并在指定栈中**新增**一条历史记录。
- replace：跳转路由，并在指定栈中**替换**当前历史记录。
- relaunch：跳转路由，**清空**指定栈中的历史记录。
- back：**回退**到指定栈中的历史记录。

```ts
relaunch(location: Partial<Location>, target?: RouteTarget, refresh?: boolean);
push(location: Partial<Location>, target?: RouteTarget, refresh?: boolean);
replace(location: Partial<Location>, target?: RouteTarget, refresh?: boolean);
back(stepOrKeyOrCallback: number | string | ((record: IRouteRecord) => boolean), target?: RouteTarget, refresh?: boolean, overflowRedirect?: string);
```

- 第一个参数为路由描述，`back()`与其它方法有点不一样，后面再介绍。
- 第二个参数`target`为指定历史栈。因为Elux虚拟路由中存在2种历史栈`WindowHistoryStack`和`PageHistoryStack`，所以路由跳转时必需指明对哪个栈进行操作，默认为`PageHistoryStack`。

::: tip 双栈单链

虽然Elux虚拟路由中可能存在`1条WindowHistoryStack`和`10条PageHistoryStack`，但我们使用**单链**模式，实际上能操作的历史栈只有2条：

- WindowHistoryStack
- CurrentWindow（WindowHistoryStack的第一条记录）下面的PageHistoryStack

:::

```ts
//不指定RouteTarget，默认为'page'，即操作的是CurrentWindow下面的PageHistoryStack
router.push({url: '/home'});

//指定RouteTarget为'window'，即操作的是WindowHistoryStack
router.push({pathname: '/article/list', searchQuery: {currentPage: '1'}}, 'window');

```

- 第三个参数`refresh`为是否强制刷新，默认为`false`。使用强制刷新时，页面内所有组件都会被重新create而不是update，这意味着组件内部的`state`也会被重新初始化。

### back()

- 第一个参数：

  ```ts
  //是大于0的数字时，表示回退多少步：
  router.back(1);

  //是数字0时，表示刷新：
  router.back(0);

  //是负数时，表示回退到历史栈中最早的那条记录
  router.back(-1);

  //是字符且不为空时，表示回退到某条历史记录的ID：
  router.back('2_14');

  //是空字符时，表示退出本站
  router.back('');

  //是function时，表示遍历历史记录的回调：
  router.back((record) => {
    //回退到最近的不需要登录的那条历史记录
    return !this.checkNeedsLogin(record.location.pathname);
  });

  ```

- 第二个参数：

  ```ts
  //如果target为page，表示依次回退所有`PageHistoryStack`中的记录
  router.back(1);
  router.back(1, 'page');

  //如果target为window，表示仅回退WindowHistoryStack中的记录
  router.back(1, 'window');
  ```

- 第四个参数`overflowRedirect`。如果后退溢出了（后退步数超出历史栈记录数，或者没找到对应的历史记录），路由回退将失败，并抛出`ROUTE_BACK_OVERFLOW`的错误，该传参将附带在错误中。

  ```ts
  export class Model extends BaseModel{
    //统一错误处理
    @effect(null)
    protected async ['this._error'](error: CustomError) {
      if (error.code === CommonErrorCode.unauthorized) {
        this.getRouter().push({url: '/login'}, 'window');
      } else if (error.code === ErrorCodes.ROUTE_BACK_OVERFLOW) {
        //用户后退溢出时，重新跳转到首页
        this.getRouter().relaunch({url: error.detail.redirect || '/'}, 'window')
      }
      throw error;
    }
  }

  router.back(9999);
  router.back(11, 'window', false, '/article/list');
  ```

## 路由跳转流程

路由跳转流程大致如下：

1. `store.dispatch({type: 'stage._testRouteChange'})`向Store派发一个`准备跳转`的Action。  
   可以使用effect监听该Action，并决定是否阻止(在effect中抛出一个错误可阻止)。
2. `store.dispatch({type: 'stage._beforeRouteChange'})`向Store派发一个`跳转前`的Action。  
   可以使用effect监听该Action，在跳转前保存某些有用的数据，如未提交的表单等。
3. 创建一个新的空Store，并触发根模块`Model.onMount()`钩子。
4. 通知原生路由系统（非必需，也可以不通知）。
5. `store.dispatch({type: 'stage._afterRouteChange'})`向Store派发一个`跳转后`的Action。  
   可以使用effect监听该Action，例如获取新的路由信息注入ModuleState中。

### 路由前置与后置

> 注意以上第3步：创建一个新的空Store，并触发根模块`Model.onMount()`钩子。

在`Model.onMount()`方法执行完成前，UI不会被渲染，这意味着：

- 你可以在此方法中`await`API数据返回，这样可以延迟UI渲染。
- 你也可以不`await`API数据返回，先渲染UI为Loading或骨架屏。

因此这也对应了2种路由跳转风格：

- `数据前置，路由后置`：先把页面所需的数据全部获取准备好，再跳转UI。优点是UI不用设计加载过程，也不用考虑加载出错（如果数据请求出错，路由将终止跳转）；缺点是必需根据路由手动编写数据请求的代码。
- `路由前置，数据后置`：UI先跳转，数据请求根据UI渲染而自动触发。优点是简单，不用额外编写数据请求的代码；缺点是UI需要设计`Loading/骨架屏/出错展示`等细节，而且数据请求也因为UI渲染顺序而瀑布式加载。

::: tip SSR服务器渲染，只支持数据前置，路由后置

服务器渲染时，必需先取回数据，然后再渲染UI，所以只能使用`数据前置，路由后置`路由风格

:::

### 路由拦截与守卫

在Model中监听`stage._testRouteChange`Action，并抛出一个错误，即可实现路由拦截，例如：

```ts
export class Model extends BaseModel{
    @effect(null)
    protected async ['stage._testRouteChange']({url, pathname}): Promise<void> {
      if (!this.state.curUser.hasLogin && this.checkNeedsLogin(pathname)) {
        throw new CustomError(CommonErrorCode.unauthorized, '请登录！', url, true);
      }
    }

     @effect(null)
    protected async ['stage._error'](error: CustomError) {
      if (error.code === CommonErrorCode.unauthorized) {
        this.getRouter().push({url: '/login'}, 'window');
      }
      throw error;
    }
}
```

### 获取跳转前的Store状态

通过`router.runtime.prevState`可以在路由跳转后，获取到路由跳转前的Store状态：

```ts
export interface RouteRuntime<TStoreState extends StoreState = StoreState> {
  timestamp: number; //路由跳转发生的时间戳
  prevState: TStoreState; //路由跳转前的状态
  completed: boolean; //路由跳转是否已经完成
}
```

### 传递数据

通过`Location.state`可以为跳转后页面传递任何数据，例如：

```ts
//state可以传递callback
router.push({
  pathname: '/article/list', 
  searchQuery: {currentPage: '1'},
  state: ()=>console.log('callback'),
});

//可以通过router.location.state获取
const locationState = router.location.state;
```

## KeepAlive与跳转动画

KeepAlive是指保持路由跳转前的页面元素不被销毁，优点：

- 路由前后的页面元素都存在，所以可以形成`跳转动画`。
- 路由回退时，由于历史页面没有被销毁，所以用户的浏览行为将得以保留，比如滚动位置等。
- 路由回退时，由于历史页面没有被销毁，所以无需重新构建，速度更快。

> 缺点就是：由于历史页面没有被销毁，它们将占用很大的资源。

Elux中的`虚拟Window`其实就是一个实现了`KeepAlive`的历史快照，它不仅保持了跳转前的页面元素，还包括PageHistoryStack和冻结的Store。所以如果你需要`KeepAlive`，可以在路由跳转时指定第二个参数target为`window`。

## 为虚拟Window指定样式

通过`Location.classname`可以为跳转窗口指定classname，例如：

> router.push({url: '/login', classname: '_dialog'}, 'window');

该命令将为跳转后的`虚拟Window`指定一个`class="_dialog"`，你可以通过该class来定制`虚拟Window`的外观样式，比如将它变成一个Dialog外观风格。

具体请参考模版中的CSS代码...

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

## 与运行平台原生路由的关系

Elux中的虚拟路由不依赖于原生路由而独立运行，原生路由可以以`外挂`的模式与虚拟路由建立关联与互动。

它们之间的互动分为二种场景：

- 虚拟路由主动发起，带动原生路由：用户体验较好，可以使用路由拦截、守卫等功能。
- 原生路由主动发起，带动虚拟路由，原生路由已经跳转了，所以虚拟路由的拦截、守卫将失去意义。

::: tip 尽量使用Elux虚拟路由主动发起跳转

- 除了用户使用物理按键，直接触发原生路由跳转，否则请优先使用Elux虚拟路由进行跳转。
- 虚拟路由的Url可与原生路由Url不一致，应用内部使用的都是`虚拟Url`，对原生Url的转换可在`入口和出口`处进行统一进行。

:::

> 虚拟URL是用户不可见的，而原生路由的URL是对外公开的。开发中使用虚拟URL，后续从产品角度美化/简化/语义化原生URL，不会引起代码的大规模改动（只需要修改映射规则即可）

![elux路由与历史记录](/images/router-transform.svg)

小程序中虚拟Url和原生Url的映射举例：

```ts
// src/Project.ts
setConfig({
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

// 小程序原生Url => elux虚拟Url
// /modules/article/pages/list => /article/list
```

### 不通知原生路由

Elux的虚拟路由是可以独立运行的，所以你也可以不通知原生路由。

例如在小程序中，当`target`为`page`时，默认是不通知原生路由的，这样相当于在小程序中运行一个**SinglePage单页**应用。

> 利用原生路由往往能得到更佳的用户体验。

## 用组件的方式执行路由跳转

框架提供了一个内置组件`<Link>`，它类似于Html标签`<a>`，例如：

```jsx
<Link disabled={pagename==='/home'} to='/home' action='push' target='window' cname="_dialog">
    Home
</Link>
```
