---
prev: /guide/configure.html
---

# Module

注意这里的Module不是指JS中的模块，而是指微模块(**业务功能模块**)。应用由一个个的微模块组成，微模块又由一个 Model (用来处理业务逻辑) 和一组 View (用来展示数据与交互)组成。

![elux静态结构图](/images/static-structure.svg)

::: tip Module是一种集合，也是一个文件夹

- 划分视角: `业务功能`（非UI区域，一个Module可能包含多个独立的UI界面）
- 划分原则: `高内聚、低耦合`（除了公共资源，其它相关资源都应集中放在该目录下）

:::

## 创建一个Module

1. 为Module取个唯一的`moduleName`，并以此为名字创建一个文件夹（可以有层级）
2. 创建业务模型`model.ts`
3. 创建视图`views/Main.tsx`（可选，Module也许没有View）
4. 在`index.ts`中导出，如：

    ```ts
    // src/modules/article/index.ts
    import {exportModule} from '@elux/react-web';
    import {Model} from './model';
    import main from './views/Main';

    export default exportModule('article', Model, {main}, {data:'aaaa'});
    ```

    exportModule方法类型如下：

    ```ts
    // 如果某些UI组件过大，可以使用异步方式导出
    type AsyncComponent = () => Promise<{
        default: Component;
    }>;

    function exportModule(
        moduleName: string, 
        ModelClass: CommonModelClass, 
        components: {
            [componentName: string]: Component | AsyncComponent;
        }, 
        data?: any
    ): TModule;
    ```

## 使用Module

1. 为应用配置模块获取方式：

    ```ts
    // src/Project.ts
    // 该文件可以看作应用的配置文件
    import stage from '@/modules/stage';
    
    // 定义模块的获取方式，同步或者异步都可以
    // 注意key名必需和模块名保持一致
    export const ModuleGetter = {
        stage: () => stage,//通常stage为根模块，使用同步加载
        article: () => import('@/modules/article'), //异步按需加载
        my: () => import('@/modules/my'),//异步按需加载
    };
    ```

2. 加载Module中的指定View：

    ```ts
    // src/modules/article/views/Main.tsx
    import {LoadComponent} from '@/Global';
    import NotFound from '@/components/NotFound';

    // 采用LoadComponent来加载视图，可以懒执行，并自动初始化与之对应的model
    // Stage中只显示子模块的根视图，如 acticle 模块的 main 视图
    // 具体 acticle.main 中显示什么由 acticle 模块自己决定，类似于子路由
    const Article = LoadComponent('article', 'main');
    const My = LoadComponent('my', 'main');

    const Component = (props) => {
        return (
            <Switch elseView={<NotFound />}>
            {props.currentModule === 'article' && <Article />}
            {props.currentModule === 'my' && <My />}
            </Switch>
        );
    };

    export default exportView(Component);
    ```

3. 获取Module中指定View(不渲染)：

    ```ts
    import {GetComponent} from '@/Global';

    //返回一个Promise
    const article = GetComponent('article', 'main');
    ```

4. 获取Module中导出的Data：

    ```ts
    import {GetData} from '@/Global';

    //返回一个Promise
    const article = GetData('article');
    ```

## 模块之间的层级

虽然模块之间`逻辑上都是平级`的，但在初始化顺序和UI展示上有着先后和嵌套关系。

![module层级](/images/module-level.svg)

::: tip 入口模块也叫根模块，通常约定为: stage

它一定存在、同步加载、且最先被初始化，所以其它模块可以放心的依赖它。你也可以把它当作一个全局载体（在**微前端**模式中，它被定义为`基座`），一些公共资源、组件和全局状态都可以用它来承载。

:::

在UI结构中，根模块的View也是一个顶层容器，它最先决定了其它模块的View是否显示。

## 模块之间的交流

> 模块是`高内聚、低耦合`的，所以模块之间的交流不会特别复杂。(如果交流特别复杂和密切，你应当把它们放到一个模块)

模块之间的交流方式通常有三种方式：

- 通过Store中的Stage，每个模块都可以读取其它模块存储在Store中的State（注意不应当修改它）
- 通过派发Action，Action相当于Model中的事件，可以在模块之间派发和监听（通过reducer和effect）
- 直接调用，通过import或者其它方法直接获取模块内部元素（不推荐）
