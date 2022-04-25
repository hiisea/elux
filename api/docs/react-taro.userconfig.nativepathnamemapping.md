<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@elux/react-taro](./react-taro.md) &gt; [UserConfig](./react-taro.userconfig.md) &gt; [NativePathnameMapping](./react-taro.userconfig.nativepathnamemapping.md)

## UserConfig.NativePathnameMapping property

定义内部和宿主平台路由之间的转换与映射

<b>Signature:</b>

```typescript
NativePathnameMapping?: {
        in(nativePathname: string): string;
        out(internalPathname: string): string;
    };
```