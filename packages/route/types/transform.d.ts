import { RootState } from '@elux/core';
import { NativeLocationMap, PagenameMap, EluxLocation, NativeLocation, StateLocation } from './basic';
export declare const urlParser: {
    type: {
        e: string;
        s: string;
        n: string;
    };
    getNativeUrl(pathname: string, query: string): string;
    getEluxUrl(pathmatch: string, args: Record<string, any>): string;
    getStateUrl(pagename: string, payload: Record<string, any>): string;
    parseNativeUrl(nurl: string): {
        pathname: string;
        query: string;
    };
    parseStateUrl(surl: string): {
        pagename: string;
        payload: Record<string, any>;
    };
    getUrl(type: 'e' | 'n' | 's', path: string, search: string): string;
    getPath(url: string): string;
    getSearch(url: string): string;
    stringifySearch(data: Record<string, any>): string;
    parseSearch(search: string): Record<string, any>;
    checkUrl(url: string): string;
    checkPath(path: string): string;
    withoutProtocol(url: string): string;
};
/**
 * 用于3种路由描述之间的转换
 *
 * @remarks
 * 该转换器由 {@link location | location(...)} 创建
 *
 * @public
 */
export interface ULocationTransform {
    /**
     * 返回当前路由所属的`Pagename`
     */
    getPagename(): string;
    /**
     * 返回当前路由所对应的`Params`，注意 Params 等于传参（`payload`）+ 模块默认路由参数（`defaultRouteParams`）合并后的结果。
     * 因为模块有可能是异步加载的，所以defaultRouteParams也可能是异步获取，所以此方法最终结果可能为Promise
     */
    getParams(): RootState | Promise<RootState>;
    /**
     * 转换为 {@link StateLocation}，并返回其URL
     */
    getStateUrl(): string;
    /**
     * 转换为 {@link EluxLocation}，并返回其URL
     */
    getEluxUrl(): string;
    /**
     * 转换为 {@link NativeLocation}，并返回其URL
     */
    getNativeUrl(withoutProtocol?: boolean): string;
}
/**
 * 创建路由Location转换器
 *
 * @remarks
 * 框架中内置3种路由描述分别是：NativeLocation，EluxLocation，StateLocation，其中 StateLocation 为`标准形态`，其余2种为临时形态
 *
 * 对应的3种Url路由协议分别是：`n://xxx?_={...}`，`e://xxx?{...}`，`s://xxx?{...}`
 *
 * 其转换关系通常为：NativeLocation -\> EluxLocation -\> StateLocation
 *
 * @param dataOrUrl - 3种路由描述或3种路由协议的url
 *
 * @returns
 * 路由Location转换器
 *
 * @public
 */
export declare function location(dataOrUrl: string | EluxLocation | StateLocation | NativeLocation): ULocationTransform;
/**
 * 创建Route模块
 *
 * @remarks
 * Route模块相对于其它`业务模块`来说是一个框架内置的特殊模块，通过本方法创建。
 *
 * @param moduleName - 通常约定为`route`
 * @param pagenameMap - 定义Page及路由参数，参见 {@link PagenameMap}
 * @param nativeLocationMap - 运行环境`原始路由`与`Elux路由`之间的映射与转换
 *
 * @public
 */
export declare function createRouteModule<TPagenameMap extends PagenameMap, TRouteModuleName extends string>(moduleName: TRouteModuleName, pagenameMap: TPagenameMap, nativeLocationMap?: NativeLocationMap): {
    moduleName: TRouteModuleName;
    initModel: (store: import("@elux/core").UStore<RootState, RootState>) => void | Promise<void>;
    state: import("@elux/core").ModuleState;
    routeParams: import("@elux/core").ModuleState;
    actions: import("@elux/core").PickActions<import("@elux/core").CommonModel>;
    components: {};
    data: keyof TPagenameMap;
};
//# sourceMappingURL=transform.d.ts.map