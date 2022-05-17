# Taro与小程序

Elux可以运行在任何JS环境中，所以也可以用来`模型驱动`小程序。

[Taro](https://taro-docs.jd.com/taro/docs)是一个使用React/Vue作为DSL语言转译为各种小程序的框架。
它专注于如何使用统一的UI语言，而不是`工程管理`和`状态管理`；对于路由跳转，它也是`直译`为小程序原生，并没有建立一套自己的体系来替代。

所以Elux与Taro是专注于不同领域的互补框架，使用`Elux+Taro`来开发各种小程序也是一种水到渠成的优雅方案。

## 开发脚手架

Taro提供了各种小程序的开发脚手架，而Elux本身只是一个普通的NPM包，所以直接使用Taro脚手架创建工程，然后作为依赖安装Elux即可。参见：[安装Taro](/guide/install.html#关于taro项目)

## 使用Elux

开发小程序的Elux工程与其它工程基本一样，只需要少量改动：

1. 修改入口文件app.tsx
<CodeGroup>
  <CodeGroupItem title="React" active>

```ts
import {createApp} from '@elux/react-taro';
import {appConfig} from './Project';

function App(props: any) {
  const Provider = createApp(appConfig);
  return <Provider>{props.children}</Provider>;
}

export default App;
```

  </CodeGroupItem>

  <CodeGroupItem title="Vue">

```ts
import {createApp} from '@elux/vue-taro';
import {appConfig} from './Project';

const App = createApp(appConfig);

export default App;
```

  </CodeGroupItem>
</CodeGroup>

2. 修改src/Project.ts

   ```ts
   export const appConfig: AppConfig = setConfig({
        //因为小程序的路由与目录结构是强关联的，此处可以与Elux中的虚拟路由做映射
        NativePathnameMapping: {
          in(nativePathname) {//小程序Url转化为内部虚拟Url
            if (nativePathname === '/') {
              nativePathname = '/modules/article/pages/list';
            }
            return nativePathname.replace(/^\/modules\/(\w+)\/pages\//, '/$1/');
          },
          out(internalPathname) {//内部虚拟Url转化为小程序Url
            return internalPathname.replace(/^\/(\w+)\//, '/modules/$1/pages/');
          },
        },
   })
   ```

3. 增加相应的Page文件。因为Elux是基于`微模块`的架构，所以Page文件最好也放在对应的模块中。我们在每个微模块下建立`pages`目录，用来存放Page：

   ```txt
    ├── src
    │    ├── modules
    │    │      ├── article
    │    │      │   ├── pages //增加pages目录
    │    │      │   │     ├── list.tsx //增加小程序专用page文件
    │    │      │   │     └── detail.tsx //增加小程序专用page文件
    │    │      │   ├── views
    │    │      │   ├── model.ts
    │    │      │   └── index.ts
    │    │      ├── my
    │    │      └── stage
    │    ├── Global.ts
    │    ├── Project.ts
    │    ├── app.tsx
    │    └── app.config.ts

   ```

   小程序专用page文件，其实千篇一律，只需要导出EluxPage即可：

   ```ts
    import {EluxPage} from '@elux/react-taro';

    //Taro提供的配置页面方法
    definePageConfig({
        navigationBarTitleText: '文章列表',
    });

    export default EluxPage;
   ```

4. 最后我们修改小程序配置文件src/app.config.ts

   ```ts
    //该方法由Taro提供
    export default defineAppConfig({
      pages: [
        'modules/article/pages/list',
        'modules/article/pages/detail',
        'modules/my/pages/userSummary',
        'modules/stage/pages/login',
      ],
      tabBar: {
        list: [
          {
            pagePath: 'modules/article/pages/list',
            text: '文章',
          },
          {
            pagePath: 'modules/my/pages/userSummary',
            text: '我的',
          },
        ],
      },
      window: {
        navigationStyle: 'custom',
      },
    });
   ```

## 使用分包加载

使用Elux工程开发小程序支持小程序原生的分包加载，方法如下：

1. 修改src/Project.ts

   ```ts
    import stage from '@/modules/stage';
    import article from '@/modules/article';
    import my from '@/modules/my';
    //要使用分包加载的微模块，只需引入类型
    import type {Shop} from '@/modules/shop';

    export const ModuleGetter = {
        stage: () => stage,
        article: () => article,
        my: () => my,
        //要使用分包加载的微模块，返回一个空对象即可
        shop: () => ({} as Shop),
    };
   ```

2. 配置小程序分包加载src/app.config.ts

   ```ts
   //该方法由Taro提供
   export default defineAppConfig({
       subPackages: [
        {
          root: 'modules/shop',
          pages: ['pages/goodsList'],
        },
      ],
   })
   ```

## 使用Elux虚拟路由

Elux虚拟路由提供了4个路由跳转方法：(参见[router](/guide/basics/router.html))

- push：在指定栈中新增一条历史记录，并跳转路由。
- replace：在指定栈中替换当前历史记录，并跳转路由。
- relaunch：清空指定栈中的历史记录，并跳转路由。
- back：回退指定栈中的历史记录，并跳转路由。

它们可以联动小程序的原生路由：

- push 联动`navigateTo`
- replace 联动`redirectTo`
- relaunch 如果是TabPage联动`switchTab`，否则联动`reLaunch`
- back 联动`navigateBack`

::: tip 更灵活的历史栈

- 通过联动小程序原生路由，从而保持其历史栈和虚拟路由的`PageHistoryStack`同步。
- 而Elux独有的另一种历史栈`PageHistoryStack`，仍然可以在小程序中使用。

:::

### 不联动原生路由

当然你也可以选择不联动小程序原生路由，这样相当于一个运行在小程序中的`单页应用SPA`。此时你可以通过自定义TabBar和NavBar来展示更个性化的导航，也可以放心的使用`路由拦截与守卫`。

> 但这样做的缺点也很明显：无法屏蔽一些物理键的操作、无法使用原生路由带来的体验。

::: tip 路由拦截与守卫

Elux虚拟路由本身支持`路由拦截与守卫`，但必须是虚拟路由先发起的跳转。(如果直接操作原生路由是无法拦截的)

:::
