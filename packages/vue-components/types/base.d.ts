import { Component } from 'vue';
import { IStore, ICoreRouter } from '@elux/core';
import { IEluxRouter } from '@elux/route';
export declare const vueComponentsConfig: {
    setPageTitle(title: string): void;
    Provider: Component<{
        store: IStore;
    }>;
    LoadComponentOnError: Component<{
        message: string;
    }>;
    LoadComponentOnLoading: Component<{}>;
};
export declare const setVueComponentsConfig: (config: Partial<{
    setPageTitle(title: string): void;
    Provider: Component<{
        store: IStore;
    }>;
    LoadComponentOnError: Component<{
        message: string;
    }>;
    LoadComponentOnLoading: Component<{}>;
}>) => void;
export interface EluxContext {
    deps?: Record<string, boolean>;
    documentHead: string;
    router?: IEluxRouter;
}
export interface EluxStoreContext {
    store: IStore;
}
export declare const EluxContextKey = "__EluxContext__";
export declare const EluxStoreContextKey = "__EluxStoreContext__";
export declare function useRouter(): ICoreRouter;
export declare function useStore(): IStore;
//# sourceMappingURL=base.d.ts.map