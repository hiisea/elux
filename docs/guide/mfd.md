# 微前端与微模块

微前端是一种泛称，Elux项目中使用颗粒度更小的`微模块`来实现微前端，设计思想参见：[微模块](/designed/micro-module.html)

假设应用有A(`根模块`),B,C,D,E,F,G模块，由4个Team独立开发：

- TeamA 负责开发 A,B,C
- TeamB 负责开发 D,E
- TeamC 负责开发 F,G
- TeamD 负责根据客户需求，挑选并集成以上模块

## TeamA工程

```txt
├── env
│    ├── local
│    └── test
├── dist
├── mock
├── public
├── src
│    ├── modules
│    │      ├── A //根模块作为公共模块(基座)
│    │      │   ├──...
│    │      │   ├── assets //作为公共资源
│    │      │   ├── components //作为公共组件
│    │      │   ├── index.ts
│    │      │   └── package.json //作为npm包
│    │      ├── B
│    │      │   ├──...
│    │      │   ├── assets //私有资源
│    │      │   ├── components //私有组件
│    │      │   ├── index.ts
│    │      │   └── package.json //作为npm包
│    │      └── C
│    │          ├──...
│    │          ├── index.ts
│    │          └── package.json //作为npm包
│    ├── Global.ts
│    ├── Project.ts
│    └── index.ts
├── elux.config.js
├── lerna.json
└── package.json
```

1. 首先，使用微模块必需`彻底的模块化`，不能再有公共资源`src/assets`、`src/components`等文件夹了。我们可以将`根模块A`当成公共模块(基座)，将原来的公共资源都当成A的资源，将相关文件夹由`src/`移动到`src/modules/A/`
2. 然后，因为TeamA要开发多个微模块，所以我们需要Monorepo工程模式，如使用`lerna+workspace`

    ```json
     // src/package.json
     {
         "workspaces": [
           "./public",
           "./src/modules/*"
         ],
         
     }
     ```

     配置lerna：

     ```json
     // src/lerna.json
    {
        "version": "1.0.0",
        "npmClient": "yarn",
        "useWorkspaces": true,
        "packages": [
            "src/modules/*"
        ]
    }
     ```

3. 虽然TeamA只开发A,B,C模块，但它们有可能依赖到别的模块(`假设依赖了E,G模块`)，为了开发和调试方便，我们可以使用2种方式实现依赖：

   - 安装真实的依赖模块。直接在package.json中添加依赖：

     ```json
     // src/package.json
     {
         "dependencies": {
           //假设我们把所有模块都发布到@newProject作用域
           "@newProject/E": "^1.0.0",
           "@newProject/G": "^1.0.0"
         }
     }
     ```

   - Mock假的依赖模块。修改src/Project.ts

     ```ts
     // src/Project.ts
     import {exportModule, exportView, EmptyModel} from '@elux/react-web';
     import A from './modules/A';
     import B from './modules/B';
     import C from './modules/C';
     
     //mock一个假的E模块
     const MockViewE = exportView(() => <div>MockViewE</div>);
     const MockModuleE = exportModule('E', EmptyModel, {main: MockViewE});

     //mock一个假的G模块
     const MockViewG = exportView(() => <div>MockViewG</div>);
     const MockModuleG = exportModule('G', EmptyModel, {main: MockViewG});

     export const ModuleGetter = {
       A: () => A,
       B: () => B,
       C: () => C,
       E: () => MockModuleE,
       G: () => MockModuleG,
     };

     ```

4. 将A,B,C微模块当作独立的NPM包模块，在其文件夹中添加package.json文件，并整理好依赖：

   ```json
    // src/modules/B/package.json
    {
        //假设我们把所有微模块都发布到@newProject作用域
        "name": "@newProject/B",
        "version": "1.0.0",
        "main": "index.ts",
        "peerDependencies": {
            "@newProject/A": "^1.0.0",
            "@elux/react-web": "^2.0.0",
        }
    }
   ```

5. 因为`src/modules/`下面的微模块都将发布到npm，所以注意跨模块的import不要使用`相对路径`或者`alias`，请使用npm包名；微模块内部的相互引用可以使用`相对路径`。

   ```ts
   // src/modules/B/model.ts

   //import {mergeDefaultParams} from '@modules/A/utils/tools';
   import {mergeDefaultParams} from '@newProject/A/utils/tools';
   ```

   注意：本工程微模块之间的调用也属于跨模块，所以也要使用npm包名。但是typescript无法理解package.json中的`workspaces`设置，所以必须手动设置tsconfig中的别名：

   ```ts
   // src/tsconfig.json
    {
        "compilerOptions": {
            "paths": {
                "@/Global": ["./Global"],
                "@newProject/A": ["./modules/A"],
                "@newProject/A/*": ["./modules/A/*"],
                "@newProject/B": ["./modules/B"],
                "@newProject/B/*": ["./modules/B/*"],
                "@newProject/C": ["./modules/C"],
                "@newProject/C/*": ["./modules/C/*"]
            }
        },
    }
   ```

6. 如果需要支持`动态微模块`(webpack5的ModuleFederation)，还需设置elux.config.json

   ```ts
   // elux.config.json
    {
        moduleFederation: {
            name: 'teamA',
            filename: 'remote.js',
            exposes: {
                './modules/B': './src/modules/B',
                './modules/C': './src/modules/C',
            },
            shared: {
                react: {singleton: true, eager: true, requiredVersion: '*'},
                'react-dom': {singleton: true, eager: true, requiredVersion: '*'},
                '@elux/react-web': {singleton: true, eager: true, requiredVersion: '*'},
            },
        },
    }
   ```

7. 各微模块开发好之后，就可以使用Lerna来统一发布。值得注意的是，可以直接将各模块的`源码`发布，无需编译打包（使用私有npm源）。

## TeamB/TeamC工程

TeamB/TeamC工程都是作为内容的提供者，与TeamA类似。

> A模块作为根模块，每个工程都必需安装

## TeamD集成

假设TeamD依据客户需求，挑选了`A,B,D,G`4个微模块，他建立工程如下：

```txt
├── src
│    ├── Global.ts
│    ├── Project.ts
│    └── index.ts
├── elux.config.js
└── package.json
```

1. 可以看到它已经不需要`src/modules`目录了，因为所有微模块都来自于npm包
2. 在package.json中增加各微模块的依赖

    ```json
    // src/package.json
    {
        "dependencies": {
            //可以利用npm版本号来管理需求
            "@newProject/A": "^1.0.0",
            "@newProject/B": "^1.2.0",
            "@newProject/D": "^1.4.0",
            "@newProject/G": "^1.1.0",
        }
    }
    ```

3. 配置Project.ts

     ```ts
     // src/Project.ts
     import A from '@newProject/A';
     import B from '@newProject/B';

     export const ModuleGetter = {
       A: () => A,
       B: () => B,
       D: () => import('@newProject/D'), //可以按需加载
       G: () => import('@newProject/G'), //可以按需加载
     };

     ```

4. 现在有2种集成方式，参见[微模块](/designed/micro-module.html)
   - **静态编译**  
     静态编译最简单，就是一个普通webpack工程。注意的是，如果我们的微模块是以`源码`直接发布的，那么要注意防止webpack的相关loader默认忽略node_modules中的转换。

   - **动态注入**  
     微模块`D,E`是TeamB负责开发和维护，假设TeamB频繁的发布小版本(也许是bug多)。客户为了使用最新的D，不得不跟随TeamB重新编译、部署、重新上线...  
     为了解决这种尴尬的场景，可以使用微模块的`动态注入`，其原理就是使用Webpack5的`ModuleFederation`。  
     - TeamB自己上线一个`team-b.com`，提供了微模块`D,E`的在线引用，每次发布小版本的时候，他会重新发布这个网站。
     - 客户工程中不再`硬编译`微模块D，而是每次动态拉取`team-b.com`中提供的最新`D`，`D`更新的时候客户工程不再需要重新编译（用户刷新浏览器就会重新拉取）。

     使用动态注入方案，需要将原`src/index.ts`改名为`bootstrap.ts`，并重新建立`src/index.ts`

     ```ts
     // src/index.ts
     import bootstrap from './bootstrap';

     bootstrap(() => undefined);
     ```

     配置`elux.config.json`，更多设置参见webpack的`Module-Federation`

     ```ts
     // elux.config.json
     moduleFederation: {
        name: 'dynamic-runtime',
        modules: {
            '@newProject/D': '@teamB/modules/D',
        },
        remotes: {
            '@teamB': 'teamB@http://team-b.com/client/remote.js',
        },
        shared: {
            react: {singleton: true, eager: true, requiredVersion: '*'},
            'react-dom': {singleton: true, eager: true, requiredVersion: '*'},
            '@elux/react-web': {singleton: true, eager: true, requiredVersion: '*'},
        },
     },
     ```
