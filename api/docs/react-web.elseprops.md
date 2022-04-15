<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@elux/react-web](./react-web.md) &gt; [ElseProps](./react-web.elseprops.md)

## ElseProps interface

内置UI组件

<b>Signature:</b>

```typescript
export interface ElseProps 
```

## Remarks

该组件用来控制子元素的渲染方式：如果非空子元素大于0，则渲染所有非空子元素，否则将渲染`props.elseView`<!-- -->， 与 [\`&lt;Switch&gt;\`](./react-web.switch.md) 的区别在于：`<Switch>` 仅渲染非空子元素中的第1个

## Example


```html
<Else elseView={<NotFound />}>
 {subView === 'detail' && <Detail />}
 {subView === 'list' && <List />}
</Else>
```

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [children](./react-web.elseprops.children.md) | ReactNode |  |
|  [elseView?](./react-web.elseprops.elseview.md) | ReactNode | <i>(Optional)</i> |
