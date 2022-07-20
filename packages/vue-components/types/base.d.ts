import { Dispatch, IRouter, StoreState, VStore } from '@elux/core';
export declare const EluxContextKey = "__EluxContext__";
export declare const EluxStoreContextKey = "__EluxStoreContext__";
export declare function UseRouter(): IRouter;
export declare function UseStore(): VStore;
export declare const vueComponentsConfig: {
    renderToString?: (component: any) => Promise<string>;
};
export declare const setVueComponentsConfig: (config: Partial<{
    renderToString?: ((component: any) => Promise<string>) | undefined;
}>) => void;
/**
 * 提供类似于react-redux的connect方法
 *
 * @param mapStateToProps - state与props之间的映射与转换
 *
 * @public
 */
export declare function connectStore<S extends StoreState, P extends Record<string, any>>(mapStateToProps?: (state: S) => P): import("vue").ShallowReactive<P & {
    dispatch: Dispatch;
}>;
//# sourceMappingURL=base.d.ts.map