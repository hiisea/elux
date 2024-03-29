# Elux项目快速上手

`快速上手三步曲：`

1. 划分微模块
2. 创建微模块
   - 创建Model
   - 创建View
   - 导出模块
3. 引入微模块
  
## 新建一个微模块

> 假设我们想创建一个新Module:`article`

1. 在`src/modules/`下面新建一个文件夹`article`
2. 在`src/modules/article`下面新建一个文件`model.ts`
3. 在`model.ts`中定义业务模型Model，例如：

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

      //定义一个reducer/mutation，用来更新列表
      @reducer
      protected putList(listSearch: ListSearch, list: ListItem[]) {
        //如果是vue，可以直接修改state
        this.state.listSearch = listSearch;
        this.state.list = list;
        //如果是React，需要返回一个新对象
        //return {...this.state, listSearch, list}
      }

      //定义一个effect/action，用来执行列表查询
      @effect()
      public async fetchList(listSearch: ListSearch) {
        const {list} = await api.getList(listSearch);
        this.dispatch(this.privateActions.putList(listSearch, list));
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
    };
   ```

8. 完成收工
