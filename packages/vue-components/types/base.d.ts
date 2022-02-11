import { Component } from 'vue';
import { UStore } from '@elux/core';
import { URouter } from '@elux/route';
export declare const vueComponentsConfig: {
    setPageTitle(title: string): void;
    Provider: Component<{
        store: UStore;
    }>;
    LoadComponentOnError: Component<{
        message: string;
    }>;
    LoadComponentOnLoading: Component<{}>;
};
export declare const setVueComponentsConfig: (config: Partial<{
    setPageTitle(title: string): void;
    Provider: Component<{
        store: UStore;
    }>;
    LoadComponentOnError: Component<{
        message: string;
    }>;
    LoadComponentOnLoading: Component<{}>;
}>) => void;
export interface EluxContext {
    deps?: Record<string, boolean>;
    documentHead: string;
    router?: URouter;
}
export interface EluxStoreContext {
    store: UStore;
}
export declare const EluxContextKey = "__EluxContext__";
export declare const EluxStoreContextKey = "__EluxStoreContext__";
export declare function useRouter(): URouter;
export declare function useStore(): UStore;
//# sourceMappingURL=base.d.ts.map