<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@elux/react-web](./react-web.md) &gt; [IRouter](./react-web.irouter.md) &gt; [relaunch](./react-web.irouter.relaunch.md)

## IRouter.relaunch() method

跳转一条路由，并清空所有历史记录

<b>Signature:</b>

```typescript
relaunch(urlOrLocation: Partial<Location>, target?: RouteTarget, payload?: any): void | Promise<void>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  urlOrLocation | Partial&lt;[Location](./react-web.location.md)<!-- -->&gt; | 路由描述 |
|  target | [RouteTarget](./react-web.routetarget.md) | 指定要操作的路由栈，默认:<code>page</code> |
|  payload | any | 提交给 [RouteRuntime](./react-web.routeruntime.md) 的数据 |

<b>Returns:</b>

void \| Promise&lt;void&gt;
