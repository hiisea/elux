# Store

Elux中Store的概念与Redux和Vuex基本相同。

::: tip Elux中Store的特别之处

- 不是单例，所以不要全局保存和引用Store，而要使用useStore()
- Store保存在Router历史栈中，Router和Store是一对多的关系
- Model挂载在Store下面，Store和Model也是一对多的关系
- 每次路由变化都会生成一个新的Store，参见[Router](/guide/basics/router.html)

:::

![store与router](/images/router-store.svg)

## Store的定义

```ts
export interface IStore {
  sid: number;
  active: boolean; //当前是否是时激活状态
  //Store挂载在Router下面，和Router是多对一的关系
  router: IRouter; 
  dispatch: Dispatch; //派发Action
  getState(): StoreState; //获取已提交的状态
  getUncommittedState(): StoreState; //获取未提交的状态
  //在该Store中挂载指定的Model
  mount(moduleName: string, env: 'init' | 'route' | 'update'): void | Promise<void>;
  destroy(): void; //销毁，框架会自动调用
}
```

## 创建Store

Store无需手动创建，每一次路由发生变化都会创建一个新的Store，并触发执行根Model的`onMount('route')`方法，而在此方法中又可以await子模块mount(非必需)，因此可以形成一条mount链。

## 使用Store

- 在Model中获取Store：直接使用`this.store`
- 在View中获取Store：使用`useStore()`

    ```ts
    import {Modules, useStore} from '@/Global';

    const Component = (props) => {
        const store = useStore();
        const onClick = () => {
            store.dispatch(Modules.stage.actions.logout());
        };
        return <div onClick={onClick}>logout</div>;
    };
    ```

## Store的销毁

Store保存在Router的历史栈中，对应的历史记录溢出时Store将自动销毁

## State的清理与擦除

在Redux或者Vuex中，Store一直缺少一种清理与擦除机制：由于Store是单例，所以保存在Store中的State会不断增加累积（除非自己写代码去清空某些过时的数据）

而在Elux中这将得到解决，每次路由变化都将产生一个新的`空Store`，它就像是一张白纸，然后重新挑选有用的数据进行挂载。

## DevTools

Elux兼容Redux的`devTools`，并改进了它的显示信息，参见[/guide/dev-tools](/guide/dev-tools)
