import React, { ComponentType } from 'react';
import { IStore } from '@elux/core';
import { IBaseRouter } from '@elux/route';
export declare const reactComponentsConfig: {
    setPageTitle(title: string): void;
    Provider: ComponentType<{
        store: IStore;
    }>;
    useStore(): IStore<any>;
    LoadComponentOnError: ComponentType<{
        message: string;
    }>;
    LoadComponentOnLoading: ComponentType<{}>;
};
export declare const setReactComponentsConfig: (config: Partial<{
    setPageTitle(title: string): void;
    Provider: ComponentType<{
        store: IStore;
    }>;
    useStore(): IStore<any>;
    LoadComponentOnError: ComponentType<{
        message: string;
    }>;
    LoadComponentOnLoading: ComponentType<{}>;
}>) => void;
export interface EluxContext {
    deps?: Record<string, boolean>;
    documentHead: string;
    router?: IBaseRouter<any, string>;
}
export declare const EluxContextComponent: React.Context<EluxContext>;
