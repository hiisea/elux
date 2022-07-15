import { IRouter, VStore } from '@elux/core';
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
//# sourceMappingURL=base.d.ts.map