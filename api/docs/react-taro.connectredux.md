<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@elux/react-taro](./react-taro.md) &gt; [connectRedux](./react-taro.connectredux.md)

## connectRedux() function

连接store与react组件

<b>Signature:</b>

```typescript
export declare function connectRedux<S = {}, D = {}, W = {}>(mapStateToProps?: (state: any, owner: W) => S, options?: Options<any, S, W>): InferableComponentEnhancerWithProps<S & D & {
    dispatch: Dispatch;
}>;
```

## Parameters

|  Parameter | Type | Description |
|  --- | --- | --- |
|  mapStateToProps | (state: any, owner: W) =&gt; S | state与props之间的映射与转换 |
|  options | Options&lt;any, S, W&gt; | 连接参数设置 |

<b>Returns:</b>

[InferableComponentEnhancerWithProps](./react-taro.inferablecomponentenhancerwithprops.md)<!-- -->&lt;S &amp; D &amp; { dispatch: [Dispatch](./react-taro.dispatch.md)<!-- -->; }&gt;

## Remarks

参见[react-redux/connect](https://react-redux.js.org/api/connect)
