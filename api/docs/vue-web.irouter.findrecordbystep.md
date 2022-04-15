<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@elux/vue-web](./vue-web.md) &gt; [IRouter](./vue-web.irouter.md) &gt; [findRecordByStep](./vue-web.irouter.findrecordbystep.md)

## IRouter.findRecordByStep() method

用`回退步数`<!-- -->来查找某条路由历史记录，如果步数溢出则返回 `{overflow: true}`

<b>Signature:</b>

```typescript
findRecordByStep(delta: number, rootOnly: boolean): {
        record: IRouteRecord;
        overflow: boolean;
        index: [number, number];
    };
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  delta | number |  |
|  rootOnly | boolean |  |

<b>Returns:</b>

{ record: [IRouteRecord](./vue-web.irouterecord.md)<!-- -->; overflow: boolean; index: \[number, number\]; }
