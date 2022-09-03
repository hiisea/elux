# 实例分析

假设我们要做这么一个简单的站点：[http://h5-ssr.eluxjs.com](http://h5-ssr.eluxjs.com)，其中主要包括这几个功能：

- [文章管理-增删改查](http://h5-ssr.eluxjs.com/article/list)（在线Demo禁止了增删改，以防数据变乱）
- [商品列表](http://h5-ssr.eluxjs.com/shop/list)
- [个人中心](http://h5-ssr.eluxjs.com/admin/my/userSummary)

## 微模块划分

先不管UI怎么样，仅根据其不同的`业务领域`，我们很容易将微模块划分如下：

```text
src
├── modules
│      ├── article //文章管理领域
│      ├── shop    //商品管理领域
│      ├── my      //个人中心领域
```

另外还有两个隐含的微模块，它们解决的是另外2个领域问题：

- stage（基座）- 它主要用来管理整个APP的启动和公共资源
- admin（鉴权）- 它主要用来管理需要登录和鉴权的公共资源

所以最终微模块规划如下：

```text
src
├── modules
│      ├── article //文章管理领域
│      ├── shop    //商品管理领域
│      ├── my      //个人中心领域
│      ├── admin   //鉴权领域
│      └── stage   //基座领域
```

## 资源内聚

将各资源按照微模块的主题领域内聚在一起，其目录大致如下：

```text
src
├── modules
│      ├── article //文章管理领域
│      │     ├── entities   //领域内业务实体的定义
│      │     ├── assets     //静态资源
│      │     ├── api        //后台API接口封装
│      │     ├── components //UI组件
│      │     ├── views      //业务视图
│      │     ├── model.ts   //业务模型
│      │     └── index.ts   //封装导出
│      │
│      ├── shop    //商品管理领域
│      ├── my      //个人中心领域
│      ├── admin   //鉴权领域
│      └── stage   //基座领域
```

其中需要特别说明的是：

- `stage(基座)` 可以当做所有微模块的公共依赖，比如一些全局样式、全局公共组件、全局方法等都可以放在`stage`微模块中。
- `admin(鉴权)` 可以当做所有需要“登录鉴权”微模块的公共依赖，一些AdminLayout、AdminMenu、消息通知等都可以放在`admin`微模块中。

## View的拆解

根据UI所表达的业务领域，我们也很容易将UI分解为各种**业务视图**，以`article模块`为例，它主要包含以下View：

- [Detail-文章详情](http://h5-ssr.eluxjs.com/article/detail?id=49)
- [Edit-文章编辑](http://h5-ssr.eluxjs.com/article/edit?id=49)
- [List-文章列表](http://h5-ssr.eluxjs.com/article/list?pageCurrent=2)
- Main-模块Entry根视图，也是该微模块的**内部路由Layout**，这个后面再展开说明。

```text
src
├── modules
│      ├── article //文章管理
│      │     ├── entities
│      │     ├── assets
│      │     ├── api
│      │     ├── components
│      │     ├── views //业务视图
│      │     │     ├── Detail  //文章详情
│      │     │     ├── Edit    //文章编辑
│      │     │     ├── List    //文章列表
│      │     │     └── Main    //内部路由
│      │     │
│      │     ├── model.ts
│      │     └── index.ts
│      ├── shop    //商品管理
│      ├── my      //个人中心
│      ├── admin   //鉴权
│      └── stage   //基座
```

## 路由的解析

说得简单一点，路由就是根据URL来控制View的显示，它无非就是做两件事情：

- 解析Url，提取路由信息。
- 根据路由信息来控制View的显示。

由于我们的微模块奉行`独立自治`的思想，所以每一个微模块都需要自己**独立完成路由控制**：

1. 每个微模块从路由中提取自己感兴趣的路由信息。
2. 将提取到的路由信息转换为`ModuleState`状态。
3. 根据`ModuleState`状态来控制View（**MVVM**）。

回到我们具体实例：

- stage模块相当于一级路由，它提取路由信息后可控制admin、article、shop模块何时参与渲染。
- admin、article、shop模块相当于`二级路由`（stage模块的子级路由），其中：
  - admin模块提取路由信息后可控制`my模块`何时参与渲染。
  - article模块提取路由信息后可控制`内部View`：Detail、Edit、List何时参与渲染。
- my模块相当于`三级路由`（admin模块的子级路由），my模块提取路由信息后可控制`内部View`何时参与渲染。

～～ **父路由可以控制子路由，但不参与孙路由的控制**

```ts
// src/modules/article/model.ts

//提取当前路由中的本模块感兴趣的信息
protected getRouteParams(): RouteParams {
    const {pathname, searchQuery} = this.getRouter().location;
    const [, article, curViewStr = ''] = pathToRegexp('/:article/:curView').exec(pathname) || [];
    const curView: CurView | undefined = CurView[curViewStr] || undefined;
    const {pageCurrent = '', keyword, id} = searchQuery as Record<string, string | undefined>;
    const listSearch = {pageCurrent: parseInt(pageCurrent) || undefined, keyword};
    return {curView, itemId: id, listSearch};
}
```

## 建立业务模型

每个微模块都需要建立自己的业务模型，包含2大任务：

- 维护业务状态-ModuleState
- 管理业务动作-Action

我们借助于[Elux框架](https://eluxjs.com/)来实现：

```ts
//src/modules/article/model.ts

//定义本模块的业务状态
export interface ModuleState {
  curView?: CurView; //该字段用来表示当前路由下展示本模块的哪个View
  listSearch: ListSearch; //该字段用来记录列表时搜索条件
  list?: ListItem[]; //该字段用来记录列表
  listSummary?: ListSummary; //该字段用来记录当前列表的摘要信息
  itemId?: string; //该字段用来记录某条记录的ID
  itemDetail?: ItemDetail; //该字段用来记录某条记录的详情
}

//定义本模块的业务模型
export class Model extends BaseModel<ModuleState, APPState> {
    
    //模块被挂载时，需要完成ModuleState的初始赋值
    public async onMount() {
        this.routeParams = this.getRouteParams();
        const {curView, listSearch, itemId} = this.routeParams;
        //将路由信息转换为ModuleState
        this.dispatch(this.privateActions._initState({curView, listSearch}));
        if (curView === 'list') {
          await this.dispatch(this.actions.fetchList(listSearch));
        } else if (curView && itemId) {
          await this.dispatch(this.actions.fetchItem(itemId));
        }
    }
    
    //业务动作-查询列表
    @effect()
    public async fetchList(listSearchData?: ListSearch) {}
    
    //业务动作-获取详情
    @effect()
    public async fetchItem(itemId: string) {}
    
    //业务动作-删除文章
    @effect()
    public async deleteItem(id: string) {}
    
    //业务动作-修改文章
    @effect()
    public async updateItem(id: string) {}
    
    //业务动作-创建文章
    @effect()
    public async createItem(id: string) {}
}
```

## 导出微模块

```ts
//src/modules/article/index.ts

import {exportModule} from '@elux/react-web';
import {Model} from './model';
import main from './views/Main';

export default exportModule('article', Model, {main});

```

## 使用微模块

- 配置微模块源
  在`src/Project.ts`中配置微模块的获取方式，同步或异步都支持：

  ```tsx
  import stage from '@/modules/stage';
  
  export const ModuleGetter = {
     //stage为根模块，使用同步加载
     stage: () => stage,
     article: () => import('@/modules/article'),
     shop: () => import('@/modules/shop'),
     admin: () => import('@/modules/admin'),
     my: () => import('@/modules/my'),
  };
  ```

- 使用微模块的中的View

  ```tsx
  //LoadComponent会自动初始化相关Model，并且是按需加载、懒执行的
  const Article = LoadComponent('article', 'main');
  
  const Component = ({subModule})=>{
      if (subModule === 'article') {
        return <Article />;
      } else {
        return null;
      }
  }
  ```

- 使用微模块中的ModuleState

  ```ts
  function mapStateToProps(appState: APPState): StoreProps {
      const {subModule} = appState.stage;
      return {
        subModule,
      };
  }
  ```

- 触发微模块中的业务动作

  ```ts
  const onDeleteItem = (id: string) => {
    dispatch(Modules.article.actions.deleteItem(id));
  };
  ```

## 单体工程

至此，SRC目录结构大致如下：

```text
src
├── modules
│      ├── article //文章管理领域
│      │     ├── entities   //领域内业务实体的定义
│      │     ├── assets     //静态资源
│      │     ├── api        //后台API接口封装
│      │     ├── components //UI组件
│      │     ├── views      //业务视图
│      │     │     ├── Detail    //文章详情
│      │     │     ├── Edit      //文章编辑
│      │     │     ├── List      //文章列表
│      │     │     └── Main      //内部路由
│      │     ├── model.ts   //业务模型
│      │     └── index.ts   //封装导出
│      │
│      ├── shop    //商品管理领域
│      ├── my      //个人中心领域
│      ├── admin   //鉴权领域
│      └── stage   //基座领域
│
├── Project.ts //微模块源配置
└── index.ts    //App入口文件
```

如果你的工程体量不大，不需要多个Team来合作开发，也不需要使用微前端，那么这样的单体工程就可以了。

::: tip 实例源码

- 运行工程向导：`npm create elux@latest` 或 `yarn create elux`
- 选择`简单示例模板`

:::

## 多Team合作开发

项目不大使用简单的`单体工程`就可以了，而微模块真正的魅力是可以多Team合作开发、独立上线、实现粒度更细的`微前端`。

假设我们有3个Team来合作开发这个项目，他们是微模块的**生产者**：

1. `basic-team` 负责开发模块：stage
2. `article-team` 负责开发模块：article、shop
3. `user-team` 负责开发模块：admin、my

- 每个Team都是一个独立工程，可以单独上线运行。
- 每个Team都将开发的微模块作为`npm包`发布到公司内部私有NPM仓库中。

另外还有2个Team根据业务需求来组合这些微模块，他们是微模块的**消费者**：

1. `app-build-team` 采用**静态编译**(node_modules)的方式集成
2. `app-runtime-team` 采用**动态注入**(module_federation)的方式集成

详情参见：[微前端与微模块](/guide/mfd.html)
