import { Component } from 'vue';
import { IStore } from '@elux/core';
import { IBaseRouter } from '@elux/route';
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
    router?: IBaseRouter<any, string>;
}
export interface EluxStoreContext {
    store: IStore;
}
export declare const EluxContextKey = "__EluxContext__";
export declare const EluxStoreContextKey = "__EluxStoreContext__";
