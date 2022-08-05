# Elux项目快速上手

假设您已经是一名React/Vue熟手，使用过Redux/Vuex/Dva，那么上手Elux项目很快...

## 派发Action

先回忆一下，不管是redux还是vuex，派发`action/mutation`都类似，派发体都是形如`{type:"xxx", args:xxx}`的格式，例如：

> dispatch({type:"user.login", payload:{username:"jimmy", password:"123456"}})

> commit({type:"user.updateUser", payload:{username:"jimmy", password:"123456"}})

这种方法有个很大的弊端，就是`派发体`需要手写，TS又不能很好的验证与提示，很容易写错。比如type写成了user.updat**a**User，也验证不到，更容易出错的是参数部分，如果参数是一个复杂的结构体，盲写很容易写错。

Elux中改进了这种原始写法，自动生成派发体，并且配合TS类型提示，再也不用担心写错type和参数：

```ts
//自动生成{type:"xxx",args:xxx}
const action = userActions.login('jimmy','123456');
dispatch(action);
```

![elux-ts](/images/case/type.jpg)

并且Elux中也没有`commit`这个方法，统一使用`dispatch`来派发，减小了心智负担。

## 创建一个新Module

> 假设我们想创建一个新Module：**article**

1. 在`src/modules/`下面新建一个文件夹`article`
2. 在`src/modules/article`下面新建一个文件`model.ts`
3. 在`model.ts`中定义Model，通常格式如下：

   ```ts
    //定义本模块的ModuleState
    export interface ModuleState {
      listSearch: ListSearch; //用来记录列表搜索条件
      list?: ListItem[]; //用来记录列表
    }
    
    //定义要从路由中提取的信息
    interface RouteParams {
      listSearch: ListSearch;
    }

    export class Model extends BaseModel<ModuleState, APPState> {

      //尽量避免使用public方法，所以构建this.privateActions来引用私有actions
      protected privateActions = this.getPrivateActions({putList: this.putList});

      //实现路由中提取信息
      protected getRouteParams(): RouteParams {
        const listSearch = queryString.parse(this.getRouter().location.search)
        return {listSearch};
      }
      
      //module被Mount的时候会触发此钩子
      //在此钩子中必需完成ModuleState初始化，可以异步
      public onMount(): void {
        const {listSearch} = this.getRouteParams();
        //完成ModuleState初始化
        //_initState是内置的注入初始State的reducer/mutation
        this.dispatch(this.privateActions._initState({listSearch}));
        //发起列表查询
        this.dispatch(this.actions.fetchList(listSearch));
      }

      //定义一个effect/action，用来执行列表查询
      @effect()
      public async fetchList(listSearch: ListSearch) {
        const {list} = await api.getList(listSearch);
        this.dispatch(this.privateActions.putList(listSearch, list));
      }

      //定义一个reducer/mutation，用来更新列表
      @reducer
      protected putList(listSearch: ListSearch, list: ListItem[]) {
        //如果是vue，可以直接修改state
        this.state.listSearch = listSearch;
        this.state.list = list;
        //如果是React，需要返回一个新对象
        //return {...this.state, listSearch, list}
      }
    }
   ```

4. 在`src/modules/article`下面新建一个文件`views`
5. 在`src/modules/article/views`下面建立并编写`View`，就是React/Vue的`Component`
6. 在`src/modules/article`下面新建一个文件`index.ts`

   ```ts
    //封装并导出本模块
    import {exportModule} from '@elux/vue-web';
    import {Model} from './model';
    import main from './views/Main';

    export default exportModule('article', Model, {main});
   ```

7. 打开`src/Project.ts`，import新Module

   ```ts
   export const ModuleGetter = {
      stage: () => stage, //通常stage为根模块，使用同步加载
      article: () => import('@/modules/article'),
      shop: () => import('@/modules/shop'),
      admin: () => import('@/modules/admin'),
      my: () => import('@/modules/my'),
    };
   ```

8. 完成收工
