import { Component } from 'vue';
import type { App } from 'vue';
import { RootModuleFacade } from '@elux/core';
import { LoadComponentOptions } from '@elux/vue-components';
import { CreateApp, CreateSSR, UserConfig, GetBaseAPP, RenderOptions, IStore } from '@elux/app';
export * from '@elux/vue-components';
export * from '@elux/app';
declare module '@vue/runtime-core' {
    interface App {
        render: (options?: RenderOptions) => Promise<IStore | string>;
    }
}
export declare type GetApp<A extends RootModuleFacade> = GetBaseAPP<A, LoadComponentOptions>;
export declare function setConfig(conf: UserConfig & {
    LoadComponentOnError?: Component<{
        message: string;
    }>;
    LoadComponentOnLoading?: Component<{}>;
}): void;
export declare const createApp: CreateApp<App>;
export declare const createSSR: CreateSSR<App>;
