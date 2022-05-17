# 服务器渲染SSR

Elux不仅支持SSR(服务器渲染)，更强大：

- Server端代码为简单函数调用，不捆绑任何Server框架(可选择`express/koa/nestjs`等)。
- 和CSR(浏览器渲染)同构，使用同一套代码。
- 和CSR(浏览器渲染)混合渲染。
  - 首屏请求Server渲染
  - 用户交互不再经过Server，提高用户体验，减轻服务器压力
  - 用户刷新又再次请求Server渲染，保持一致的路由

![elux服务器渲染](/images/ssr-flow.svg)

## 开启SSR

1. 修改`elux.config.js`配置：

   ```js
   // elux.config.js
   module.exports = {
     type: 'react ssr', //修改为对应的SSR模式
     all: {
        clientGlobalVar: {
            ApiPrefix: apiHosts[APP_ENV],
            StaticPrefix: apiHosts[APP_ENV],
        },
        serverGlobalVar: { //增加Server环境下的全局变量
            ApiPrefix: apiHosts[APP_ENV],
            StaticPrefix: apiHosts[APP_ENV],
        },
     },
     //如果要使用SSG(Static Site Generation),在此配置生成方式
     gen: {...} 
   }
   ```

2. 增加一个`server.ts`作为Server端入口文件：

   ```ts
   // src/server.ts
   import {createSSR} from '@elux/react-web';
   import {appConfig} from './Project';

   /**
    * 该方法最终将被Server框架调用，依据所选Server框架(如express/kao/nestjs)的不同而变化，
    * 框架的request和response对象传给createSSR后，在应用中可以通过`router.initOptions`获取
    */
    export default function server(request: {url: string}, response: any): Promise<string> {
      return createSSR(appConfig, {url: request.url, request, response} as any).render();
    }

   ```

## 注意事项

- 在Server端，每个用户Request都会创建一个Elux中的Router，而浏览器中全局只有一个Router。
- 在Server端，Model执行完根模块的`onMount('init')`即停止，所以必须在此方法中`await`子模块的Mount，即只支持**路由后置**风格：

  ```ts
  // src/modules/stage/model.ts
  export class Model extends BaseModel {

      //初始化或路由变化时都需要重新挂载Model
      //在此钩子中必需完成ModuleState的初始赋值(可以异步)
      //在此钩子执行完成之前，UI将不会Render
      //在此钩子中并可以await子模块挂载，等待所有子模块都mount完成后，一次性Render UI
      //也可以不await子模块挂载，这样子模块可能需要自己设计并展示Loading界面，这样就形成了2种不同的路由风格
      //一种是数据前置，路由后置(所有数据全部都准备好了再跳转、展示界面)
      //一种是路由前置，数据后置(路由先跳转，展示设计好的loading界面)
      //SSR时只能使用"数据前置"风格
      public async onMount(env: 'init' | 'route' | 'update'): Promise<void> {
          ...
      }
  }
  ```

- 一套代码运行在浏览器与服务器环境中，调用专属API时需要注意区分环境，比如不要在Server端调用window对象。
- 服务器中操作路由跳转，会派发一个code为`ELIX.ROUTE_REDIRECT`的错误，server可以捕获该错误进行301跳转。
