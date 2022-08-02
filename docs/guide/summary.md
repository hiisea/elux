---
prev: /designed/route-history.html
---

# Elux介绍

Elux不只是一个JS框架，更是一种基于“微模块”和“模型驱动”的跨平台、跨框架**同构方案**。它将稳定的业务逻辑与多样化的运行平台、UI框架进行剥离，让核心逻辑得到充分的简化、隔离和复用。

## 平庸的Elux

Elux其实很平庸，它既没有解决其它框架不能解决的问题，也没有发明创造一个新的技术栈，它的价值只是让传统的解决方案更松散一点，更通用一点，更简单一点。

Elux也没有什么高深的技术，复杂的代码，它带给大家的更多是面向“解耦”、面向“抽象”、面向“模块化”的前端思维新风向。

## 神奇的Elux

- 面向“解耦”，让Elux可以搭配React、搭配Vue、搭配更多第三方UI框架来进行开发。
- 面向“解耦”，让Elux可以运行在浏览器，运行在SSR服务器，运行在小程序，运行在手机App。
- 面向“解耦”，让Elux统一了Browser/小程序/App的路由风格，并与原生路由完美配合。
- 面向“解耦”，让Elux可以跨端、跨平台复用“核心业务逻辑”。
- 面向“解耦”，让Elux专注于自己的领域，包容与开放的融纳其它第三方框架。
  
## 简单的Elux

Elux应用范围很广，但并不妨碍它使用简单:

- 它使用既有技术栈，并不侵入、阉割与约束它们。  
- 它属于微框架，压缩后约几十K，小巧迷你。
- 它的所有顶级API也就30多个，并不复杂。
- 它提供开箱即用的脚手架和Cli工程向导，以及多套模版。

## Why Elux

 **~ 崇尚“解耦”的力量 ~**

现在你不用太纠结选型React还是Vue还是其它UI框架，因为UI层在Elux工程已经变得很薄，UI框架不再是工程的核心。

现在你也不必为了React而学习Redux、Redux-saga、Next，为了Vue而学习Vuex、Nuxt，为了微前端而学习Qiankun、Icestark...Elux可以使用一套方案搞定几乎所有平台：Web(浏览器)Micro(微前端)SSR(服务器渲染)MP(小程序)APP(手机应用)

另外不管你是否真的需要独立开发和部署微模块，以“微模块”的方式来架构我们的应用，让资源“高内聚、低耦合”，让工程保持清晰的脉络结构，提高代码的“可维护性和可复用性“，这才是广义上"微模块"能给我们的启迪。

如果有一天，在你使用了Elux后，感觉项目工程的条理似乎更清晰了一点，可维护性更高了一点，**渐进式重构**更容易一点，那么这都不是Elux的功劳，而是“解耦”的力量，是"模块化"带给这个世界的深刻变革...

---

## 案例分析

基于`Elux+Antd`的后台管理系统：

- React版本：[Github](https://github.com/hiisea/elux-react-antd-admin) ｜ [Gitee](https://gitee.com/hiisea/elux-react-antd-admin-fork)
- Vue版本：[Github](https://github.com/hiisea/elux-vue-antd-admin) ｜ [Gitee](https://gitee.com/hiisea/elux-vue-antd-admin-fork)

### 在线预览

<http://admin-react-antd.eluxjs.com/>

### 项目介绍

本项目主要基于`Elux+Antd`构建，包含`React`版本和`Vue`版本，旨在提供给大家一个**简单基础**、**开箱即用**的后台管理系统通用模版，主要包含运行环境、脚手架、代码风格、基本Layout、状态管理、路由管理、增删改查逻辑、列表、表单等。

### 你看得见的UI

- 🚀 提供通用的Admin系统Layout（包括注册、登录、忘记密码等）。
- 🚀 动态获取Menu菜单、轮询最新消息等。
- 🚀 支持第一次后退溢出自动回到首页，再次后退则弹出提示：您确定要离开本站？防止用户误操作。![elux收藏夹](/images/case/leave.jpg)
- 提供&lt;DocumentHead&gt;组件，方便在SinglePage中维护document title、keyword、description等，该组件也可用于SSR，例如：

  ```ts
  <DocumentHead title={(id?'修改':'新增')+'用户'} />
  ```

- 🚀 提供配置式查询表单, 还带TS类型验证哦，再也不担心写错字段名：

  ```ts
  const formItems: SearchFromItems<ListSearchFormData> = [
    {name: 'name', label: '用户名', formItem: <Input placeholder="请输入关键字" />},
    {name: 'nickname', label: '呢称', formItem: <Input placeholder="请输入呢称" />},
    {name: 'status', label: '状态', formItem: <Select placeholder="请选择用户状态" />},
    {name: 'role', label: '角色', formItem: <Select placeholder="请选择用户状态" />},
    {name: 'email', label: 'Email', formItem: <Input placeholder="请输入Email" />},
  ];
  ```

- 🚀 提供展开与隐藏高级搜索：[展开高级](http://admin-react-antd.eluxjs.com/admin/member/list/maintain?email=u.mese%40jww.gh) / [隐藏高级](http://admin-react-antd.eluxjs.com/admin/member/list/maintain)
- 🚀 提供跨页选取、重新搜索后选取、review已选取：[跨页选取](http://admin-react-antd.eluxjs.com/admin/member/list/maintain)
- 🚀 提供配置式批量操作等功能，如：[批量操作](http://admin-react-antd.eluxjs.com/admin/member/list/maintain)

  ```ts
  const batchActions = {
      actions: [
        {key: 'delete', label: '批量删除', confirm: true},
        {key: 'resolved', label: '批量通过', confirm: true},
        {key: 'rejected', label: '批量拒绝', confirm: true},
      ],
      handler: (item: {key: string}, ids: (string | number)[]) => {
        if (item.key === 'delete') {
          deleteItems(ids as string[]);
        } else if (item.key === 'resolved') {
          alterItems(ids as string[], {status: Status.审核通过});
        } else if (item.key === 'rejected') {
          alterItems(ids as string[], {status: Status.审核拒绝});
        }
      },
    };
  ```

- 🚀 提供资源选择器，并封装成select，可单选、多选、选满自动提交，如：[创建文章时，查询并选择责任编辑](http://admin-react-antd.eluxjs.com/admin/article/item/edit?__c=_dialog)

  ```jsx
  <FormItem {...fromDecorators.editors}>
    <MSelect<MemberListSearch>
      placeholder="请选择责任编辑"
      selectorPathname="/admin/member/list/selector"
      fixedSearch={{role: Role.责任编辑, status: Status.启用}}
      limit={[1, 2]}
      returnArray
      showSearch
    ></MSelect>
  </FormItem>
  ```

- 🚀 提供收藏夹书签功能，用其代替Page选项卡，操作更灵活。点击左上角[【+收藏】](http://admin-react-antd.eluxjs.com/admin/member/list/maintain)试试... ![elux收藏夹](/images/case/favs.jpg)
- 🚀 提供页内刷新功能。点击右上角[【刷新按钮】](http://admin-react-antd.eluxjs.com/admin/member/list/maintain)试试...
- 🚀 虚拟Window
  - 路由跳转时可以在新的虚拟窗口中打开，类似于target='_blank'，但是虚拟Window哦，如：[新窗口打开](http://admin-react-antd.eluxjs.com/admin/article/list/index?author=48&__c=_dialog) / [本窗口打开](http://admin-react-antd.eluxjs.com/admin/article/list/index?author=48)
  - 窗口中可以再开新窗口，最多可达10级
  - 弹窗再弹弹窗体验不好？多层弹窗时自动隐藏下层弹窗，关闭上层弹窗自动恢复下层弹窗，保证每一时刻始终之会出现一层弹窗
  - 实现真正意义上的Window（非简单的Dialog），每个窗口不仅拥有独立的Dom、状态管理Store、还自动维护独立的`历史记录栈`
  - 提供窗口工具条：后退、刷新、关闭，如：[文章列表](http://admin-react-antd.eluxjs.com/admin/article/list/index?author=48&__c=_dialog) => 点击标题 => 点击作者 => 点击文章数。然后你可以依次回退每一步操作，也可一次性全部关闭。
  - 提供窗口最大化、最小化按钮，如：[文章详情，窗口左上角按钮](http://admin-react-antd.eluxjs.com/admin/article/item/detail/50?__c=_dialog)；并支持默认最大化，如：[创建文章](http://admin-react-antd.eluxjs.com/admin/article/item/edit?__c=_dialog) ![elux虚拟窗口](/images/case/window.jpg)
  - 窗口可以通过Url发送，如将`http://admin-react-antd.eluxjs.com/admin/member/item/edit/50?__c=_dialog`发送给好友后，其可以通过Url还原窗口。
  - 轻松实现keep-alive，keep-alive优点是用户体验好，缺点是太占资源。现在使用虚拟Windw，你想keep-alive就在新窗口打开，不想keep-alive就在原窗口中打开，关闭窗口就自动销毁keep-alive。
  
- 🚀 基于抽象的增删改查逻辑：
  - 业务逻辑通过类的继承复用，如果是标准的增删改查基本上不用写代码，否则可以自己覆盖父类中的某些方法：

  ```ts
  export class Model extends BaseResource<MemberResource> {
    protected api = api;
    protected defaultListSearch = defaultListSearch;
  }
  ```

  - UI逻辑通过`Hooks`复用。
  - 将视图抽象成为2大类：*列表*(List)和*单条*(Item)，抽取其共性。
  - 在此基础上引入视图`渲染器(Render)`概念，类别名+渲染器=具体某个业务视图，如：
    - type=list,render=maintain(列表+维护)，如：[/admin/member/list/maintain](http://admin-react-antd.eluxjs.com/admin/member/list/maintain)
    - type=list,render=index(列表+展示)，如：[/admin/article/list/index](http://admin-react-antd.eluxjs.com/admin/article/list/index?author=49&__c=_dialog)
    - type=list,render=selector(列表+选择)，如：[/admin/member/list/selector](http://admin-react-antd.eluxjs.com/admin/member/list/selector?role=editor&status=enable&__c=_dialog)
    - type=item,render=detail(单条+展示)，如：[/admin/member/item/detail/49](http://admin-react-antd.eluxjs.com/admin/member/item/detail/49?__c=_dialog)
    - type=item,render=edit(单条+编辑)，如：[/admin/member/item/edit/49](http://admin-react-antd.eluxjs.com/admin/member/item/edit/49?__c=_dialog)

### 你看不见的幕后

- 🚀 使用微模块架构，将业务功能封装成独立微模块，想要哪个功能就安装哪个模块，是一种粒度更细的微前端

  ```txt
   你以前的SRC长这样？？？
    │
    ├─ src
    │  ├─ api                 # API接口管理
    │  ├─ assets              # 静态资源文件
    │  ├─ components          # 全局组件
    │  ├─ config              # 全局配置项
    │  ├─ directives          # 全局指令文件
    │  ├─ enums               # 项目枚举
    │  ├─ hooks               # 常用 Hooks
    │  ├─ language            # 语言国际化
    │  ├─ layout              # 框架布局
    │  ├─ routers             # 路由管理
    │  ├─ store               # store
    │  ├─ styles              # 全局样式
    │  ├─ typings             # 全局 ts 声明
    │  ├─ utils               # 工具库
    │  ├─ views               # 项目所有页面
    │  ├─ App.vue             # 入口页面
    │  └─ main.ts             # 入口文件
  ```

   快来拯救你的SRC🔥，

  ```txt
  使用微模块后SRC长这样！！！
    │
    ├─ src
    │  ├─ moddules            # 各业务微模块
    │  │    ├─ user
    │  │    ├─ article        
    │  │    ├─ comment   
    │  ├─ Project.vue         # 各微模块聚合配置
    │  └─ index.ts            # 入口文件
  ```

  - 微模块支持同步/异步加载
  - 微模块支持本地目录、支持发布成NPM包，支持独立部署（微前端）
  - 微模块支持整体TS类型验证与提示
  
- 🚀 内置最强状态管理框架(^-^)：
  - 同时支持React/Vue，不再深度耦合UI框架。
  - 最大程度简化action和store的写法

  ```ts
  export class Model extends BaseMode {

    @reducer //类似Vuex的mutations
    public putCurUser(curUser: CurUser) {
      this.state.curUser = curUser; // vue中可直接修改
      //this.state = {...this.state, curUser} react中
    }

    @effect() //类似Vuex的action
    public async login(args: LoginParams) {
      const curUser = await api.login(args);
      this.dispatch(this.actions.putCurUser(curUser));
      this.getRouter().relaunch({url: AdminHomeUrl}, 'window');
    }
  }
  ```

  - 与路由结合，支持Store多实例。
  - 路由跳转时自动清空Store，再也不用担心State在Store中无限累积。
  - 为action引入线程机制，支持在处理action的过程中，在派生出新的action线程。
  - action执行中支持异步操作：

  ```ts
  @effect()
  public async updateItem(id: string, data: UpdateItem) {
    await this.api.updateItem!({id, data}); //调用后台API
    await this.getRouter().back(1, 'window'); //路由后退一步(到列表页)
    message.success('编辑成功！'); //提示
    this.getRouter().back(0, 'page'); //back(0)表示刷新当前页(列表页)
  }
  ```

  - 支持awiat action的执行结果，如在UI中等待login这个action的执行结果：

  ```ts
  const onSubmit = (values: HFormData) => {
    const result = dispatch(stageActions.login(values));
    //stageActions.login()中包含异步请求，返回Promise

    result.catch(({message}) => {
      //如果出错(密码错误)，在form中展示出错信息
      form.setFields([{name: 'password', errors: [message]}]);
    });
  };
  ```

  - 为action引入事件机制，dispatch一个action支持多处监听，共同协作完成一个长流程业务。例如：ModelA 和 ModelB 都想监听`用户切换`这个Action：

  ```ts
  // ModelA:
  export class ModelA extends BaseResource {
    @effect()
    public async ['stage.putCurUser'](user: User) {
      if (user.hasLogin) {
          this.dispath(this.actions.xxx());
      } else {
          this.dispath(this.actions.xxx());
      }
    }
  }

  // ModelB:
  export class ModelB extends BaseResource{
    @effect()
    public async ['stage.putCurUser'](user: User) {
      if (user.hasLogin) {
          this.dispath(this.actions.xxx());
      } else {
          this.dispath(this.actions.xxx());
      }
    }
  }
  ```

  - 路由跳转前会自动派发`stage._testRouteChange`的action，你可以监听它，阻止路由跳转：

  ```ts
  @effect(null)
  protected async ['this._testRouteChange']({url, pathname}) {
      if (!this.state.curUser.hasLogin && this.checkNeedsLogin(pathname)) {
          throw new CustomError(CommonErrorCode.unauthorized, '请登录！');
      }
  }
  ```

  - 支持catch action执行过程中的错误，并决定继续或终止当前action执行：

  ```ts
  @effect(null)
  protected async ['this._error'](error: CustomError) {
      if (error.code === CommonErrorCode.unauthorized) {
          this.getRouter().push({url: '/login'}, 'window');
      }else{
          alert(error.message);
      }
      throw error;
  }
  ```

  - 最方便的注入loading状态，想要跟踪异步action的执行情况？只需要在声明方法中传人key名就行了，如：

    ```ts
    @effect('this.listLoading') //将该异步action的执行状态注入this.state.listLoading中
    public async fetchList(listSearchData?: TDefineResource['ListSearch']) {
      const listSearch = listSearchData || this.state.listSearch || this.defaultListSearch;
      const {list, listSummary} = await this.api.getList!(listSearch);
      this.dispatch(this.privateActions.putList(listSearch, list, listSummary));
    }
    ```

  - 武装到牙齿的Typescript智能提示和自动补全（并且类型自动生成，无需手写）：![elux-ts](/images/case/type.jpg)
  
- 🚀 提供基于双栈单链的虚拟路由。
  - 拥有2维历史记录栈，将原生路由体验带入浏览器。

  ```ts
  router.push({url: '/login'}, 'page') //在当前页历史记录栈中新增一条历史记录
  router.push({url: '/login'}, 'window') //在新窗口历史记录栈中新增一条历史记录
  ```

  - 基于虚拟路由，不再直接关联原生路由，中间可以转换映射。如在小程序中映射：

  ```ts
  const NativePathnameMapping = {
    in(nativePathname) { //将小程序路由地址映射为虚拟路由地址
      if (nativePathname === '/') {
        nativePathname = '/modules/article/pages/list';
      }
      const Prefix = {my: '/admin'};
      return nativePathname.replace(/^\/modules\/(\w+)\/pages\//, (match, moduleName) => {
        return (Prefix[moduleName] || '')+'/'+moduleName+'/';
      });
    },
    out(internalPathname) { //将虚拟路由地址映射为小程序路由地址
      internalPathname = internalPathname.replace('/admin/', '/');
      return internalPathname.replace(/^\/(\w+)\//, '/modules/$1/pages/');
    },
  }
  ```

  - 跨平台，可用于浏览器、服务器SSR、小程序、原生应用。
  - 跨框架，可用于React、Vue，不依赖其它路由框架，如react-router、vue-router
  - 可完整保存历史快照，包括Store和Dom元素
  - 可访问和查找历史记录，不再只是一个history.length

  ```ts
  const length = router.getHistoryLength(); //获取历史栈中的记录数
  const list = router.getHistory(); //获取所有历史记录
  const record = router.findRecordByStep(10); //获取10步之前的历史记录
  const record2 = router.findRecordByKey('8_1'); //获取编号为8_1的历史记录
  ```

    例如登录窗口中点击“取消登录”你需要回退到前一个页面，但此时如果前一个页面就是需要登录的页面，那么登录窗口又会被重新弹出。所以点击“取消登录”应当回退到最近的不需要登录的页面：

  ```ts
  @effect()
  public async cancelLogin(): Promise<void> {
    //在历史栈中找到第一条不需要登录的记录
    //如果简单的back(1)，前一个页面需要登录时会引起循环
    this.getRouter().back((record) => {
      return !this.checkNeedsLogin(record.location.pathname);
    }, 'window');
  }
  ```

  - 支持路由拦截和路由守卫
  - 支持后退溢出时重定向，比如防止用户后退过多，不小心退出了本站：

  ```ts
  @effect(null)
  protected async ['this._error'](error: CustomError): Promise<void> {
    if (error.code === ErrorCodes.ROUTE_BACK_OVERFLOW) {
      const redirect: string = HomeUrl;
      //如果已经时主页，则提示用户是否退出本站？
      if (this.getRouter().location.url === redirect && window.confirm('确定要退出本站吗？')){
        //注意: back('')可以退出本站
        setTimeout(() => this.getRouter().back('', 'window'), 0);
      } else {
        //如果不是在主页，则先回到主页
        setTimeout(() => this.getRouter().relaunch({url: redirect}, 'window'), 0);
      }
    };
  }
  ```

  - 可跟踪和等待路由跳转完成。例如修改用户后，需要返回列表页面并刷新：

  ```ts
  @effect()
  public async updateItem(id: string, data: UpdateItem) {
    await this.api.updateItem!({id, data});
    await this.getRouter().back(1, 'window'); //可await路由后退
    message.success('编辑成功！');
    this.getRouter().back(0, 'page'); //back(0)可刷新页面
  }
  ```

  - 提供更多路由跳转方法

  ```ts
  router.push(location, target); //新增
  router.replace(location, target); //替换
  router.relaunch(location, target); //重置
  router.back(stepOrCallback, target) //后退或刷新
  ```

- 🚀 提供与项目同构的本地MockServer，MockServer也使用Typescript，但无需再写类型文件，直接从`src/`下面与项目共享，支持修改自动重启。
- 🚀 开箱即用的脚手架。提供封装好的`Cli命令行`脚手架，不用自己折腾。
- 🚀 基本的`eslint/stylelint/babel`都已经帮你打包好了，不用安装各种插件和写一大堆依赖：

  ```json
  "devDependencies": {
    "@elux/babel-preset": "^1.0.2",
    "@elux/eslint-plugin": "^1.2.2",
    "@elux/stylelint-config": "^1.1.1"
  }
  ```

## 更多相关文章

- [从"微前端"到“微模块”](https://juejin.cn/post/7106791733509226533)
- [不想当Window的Dialog不是一个好Modal，弹窗翻身记...](https://juejin.cn/post/7124177821953425422)
- [手撸Router，还要啥Router框架？让react-router/vue-router躺一边凉快去](https://juejin.cn/post/7124959667326812196)
