import React, { ComponentType } from 'react';
import { UStore } from '@elux/core';
import { URouter } from '@elux/route';
export declare const reactComponentsConfig: {
    setPageTitle(title: string): void;
    Provider: ComponentType<{
        store: UStore;
    }>;
    useStore(): UStore;
    LoadComponentOnError: ComponentType<{
        message: string;
    }>;
    LoadComponentOnLoading: ComponentType<{}>;
};
export declare const setReactComponentsConfig: (config: Partial<{
    setPageTitle(title: string): void;
    Provider: ComponentType<{
        store: UStore;
    }>;
    useStore(): UStore;
    LoadComponentOnError: ComponentType<{
        message: string;
    }>;
    LoadComponentOnLoading: ComponentType<{}>;
}>) => void;
export interface EluxContext {
    deps?: Record<string, boolean>;
    documentHead: string;
    router?: URouter;
}
export declare const EluxContextComponent: React.Context<EluxContext>;
//# sourceMappingURL=base.d.ts.map