import './env';
import { defineComponent } from 'vue';
import type { Component } from 'vue';
import type { ModuleGetter, IStoreMiddleware, StoreBuilder, BStoreOptions, BStore, RootModuleFacade, RootModuleAPI, RootModuleActions } from '@elux/core';
import type { IRouter } from '@elux/route-browser';
import type { LoadView } from './loadView';
export { createVuex } from '@elux/core-vuex';
export { ActionTypes, LoadingState, env, effect, mutation, errorAction, reducer, action, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@elux/route';
export { defineComponent } from 'vue';
export type { RootModuleFacade as Facade, Dispatch, CoreModuleState as BaseModuleState } from '@elux/core';
export type { RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial } from '@elux/route';
export type { VuexStore, VuexOptions } from '@elux/core-vuex';
export type { LoadView } from './loadView';
export declare const defineView: typeof defineComponent;
export declare function setSsrHtmlTpl(tpl: string): void;
export declare function setConfig(conf: {
    actionMaxHistory?: number;
    pagesMaxHistory?: number;
    pagenames?: Record<string, string>;
    NSP?: string;
    MSP?: string;
    DepthTimeOnLoading?: number;
    LoadViewOnError?: Component;
    LoadViewOnLoading?: Component;
    disableNativeRoute?: boolean;
}): void;
export interface RenderOptions {
    viewName?: string;
    id?: string;
    ssrKey?: string;
}
export interface SSROptions {
    viewName?: string;
    id?: string;
    ssrKey?: string;
    url: string;
}
export declare function createApp(moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string): {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator }: StoreBuilder<O, B>): {
        render({ id, ssrKey, viewName }?: RenderOptions): Promise<import("@elux/core").IStore<any> & B>;
        ssr({ id, ssrKey, url, viewName }: SSROptions): Promise<string>;
    };
};
export declare function patchActions(typeName: string, json?: string): void;
export declare type GetAPP<A extends RootModuleFacade> = {
    State: {
        [M in keyof A]: A[M]['state'];
    };
    RouteParams: {
        [M in keyof A]?: A[M]['params'];
    };
    GetRouter: () => IRouter<{
        [M in keyof A]: A[M]['params'];
    }, Extract<keyof A['route']['components'], string>>;
    GetActions<N extends keyof A>(...args: N[]): {
        [K in N]: A[K]['actions'];
    };
    LoadView: LoadView<A>;
    Modules: RootModuleAPI<A>;
    Actions: RootModuleActions<A>;
    Pagenames: {
        [K in keyof A['route']['components']]: K;
    };
};
export declare function getApp<T extends {
    GetActions: any;
    GetRouter: any;
    LoadView: any;
    Modules: any;
    Pagenames: any;
}>(): Pick<T, 'GetActions' | 'GetRouter' | 'LoadView' | 'Modules' | 'Pagenames'>;
