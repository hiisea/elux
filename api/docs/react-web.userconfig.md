<!-- Do not edit this file. It is automatically generated by API Documenter. -->

[Home](./index.md) &gt; [@elux/react-web](./react-web.md) &gt; [UserConfig](./react-web.userconfig.md)

## UserConfig interface

全局参数设置

<b>Signature:</b>

```typescript
export interface UserConfig 
```

## Remarks

可通过 [setConfig()](./react-web.setconfig.md) 个性化设置

## Properties

|  Property | Type | Description |
|  --- | --- | --- |
|  [DepthTimeOnLoading?](./react-web.userconfig.depthtimeonloading.md) | number | <i>(Optional)</i> 定义Loading超过多少秒视为深度加载 |
|  [DisableNativeRouter?](./react-web.userconfig.disablenativerouter.md) | boolean | <i>(Optional)</i> 是否不通知原生路由 |
|  [HomeUrl](./react-web.userconfig.homeurl.md) | string | 定义应用的首页 |
|  [LoadComponentOnError?](./react-web.userconfig.loadcomponentonerror.md) | Elux.Component&lt;{ message: string; }&gt; | <i>(Optional)</i> 定义默认视图加载错误组件 |
|  [LoadComponentOnLoading?](./react-web.userconfig.loadcomponentonloading.md) | Elux.Component&lt;{}&gt; | <i>(Optional)</i> 定义默认视图加载中组件 |
|  [ModuleGetter](./react-web.userconfig.modulegetter.md) | [ModuleGetter](./react-web.modulegetter.md) | 定义模块获取方法 |
|  [NativePathnameMapping?](./react-web.userconfig.nativepathnamemapping.md) | { in(pathname: string): string; out(pathname: string): string; } | <i>(Optional)</i> 定义内部和宿主平台路由之间的转换与映射 |
|  [QueryString](./react-web.userconfig.querystring.md) | { parse(str: string): { \[key: string\]: any; }; stringify(query: { \[key: string\]: any; }): string; } | 定义路由参数序列化方法 |
|  [StageModuleName?](./react-web.userconfig.stagemodulename.md) | string | <i>(Optional)</i> 定义APP根模块名称 |
|  [StageViewName?](./react-web.userconfig.stageviewname.md) | string | <i>(Optional)</i> 定义APP根视图名称 |
|  [StoreLogger?](./react-web.userconfig.storelogger.md) | [StoreLogger](./react-web.storelogger.md) | <i>(Optional)</i> 定义Store日志记录器 |
|  [StoreMiddlewares?](./react-web.userconfig.storemiddlewares.md) | [StoreMiddleware](./react-web.storemiddleware.md)<!-- -->\[\] | <i>(Optional)</i> 定义Store中间件 |
