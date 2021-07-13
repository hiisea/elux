import type { Component } from 'vue';
import type { ModuleGetter, IStoreMiddleware, StoreBuilder, BStoreOptions, BStore, IStore, RootModuleFacade, RootModuleAPI, RootModuleActions } from '@elux/core';
import type { IRouter } from '@elux/route-browser';
import type { LoadComponent } from './loadComponent';
export { createVuex } from '@elux/core-vuex';
export { ActionTypes, LoadingState, env, effect, mutation, errorAction, reducer, action, setLoading, logger, isServer, serverSide, clientSide, deepMerge, deepMergeState, exportModule, isProcessedError, setProcessedError, delayPromise, exportView, exportComponent, EmptyModuleHandlers, } from '@elux/core';
export { ModuleWithRouteHandlers as BaseModuleHandlers, RouteActionTypes, createRouteModule } from '@elux/route';
export { default as DocumentHead } from './components/DocumentHead';
export { default as Link } from './components/Link';
export type { RootModuleFacade as Facade, Dispatch, EluxComponent } from '@elux/core';
export type { RouteState, PayloadLocation, LocationTransform, NativeLocation, PagenameMap, HistoryAction, Location, DeepPartial } from '@elux/route';
export type { VuexStore, VuexOptions } from '@elux/core-vuex';
export type { LoadComponent } from './loadComponent';
declare module '@vue/runtime-core' {
    interface App {
        render: (options: RenderOptions) => Promise<IStore | string>;
    }
}
export declare const defineView: (args_0: any) => {
    new (...args: any[]): {
        $: import("vue").ComponentInternalInstance;
        $data: {};
        $props: Partial<{}> & Omit<Readonly<{
            [x: string]: any;
        }> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, never>;
        $attrs: {
            [x: string]: unknown;
        };
        $refs: {
            [x: string]: unknown;
        };
        $slots: Readonly<{
            [name: string]: import("vue").Slot | undefined;
        }>;
        $root: import("vue").ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, {}, false, import("vue").ComponentOptionsBase<any, any, any, any, any, any, any, any, any, {}>> | null;
        $parent: import("vue").ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, {}, false, import("vue").ComponentOptionsBase<any, any, any, any, any, any, any, any, any, {}>> | null;
        $emit: (event: string, ...args: any[]) => void;
        $el: any;
        $options: import("vue").ComponentOptionsBase<Readonly<{
            [x: string]: any;
        }>, object, {}, import("vue").ComputedOptions, import("vue").MethodOptions, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, {}>;
        $forceUpdate: import("vue").ReactiveEffect<any>;
        $nextTick: typeof import("vue").nextTick;
        $watch(source: string | Function, cb: Function, options?: import("vue").WatchOptions<boolean> | undefined): import("vue").WatchStopHandle;
    } & Readonly<{
        [x: string]: any;
    }> & import("vue").ShallowUnwrapRef<{} & object> & {
        [x: string]: never;
    } & import("vue").MethodOptions & import("vue").ComponentCustomProperties;
    __isFragment?: undefined;
    __isTeleport?: undefined;
    __isSuspense?: undefined;
} & import("vue").ComponentOptionsBase<Readonly<{
    [x: string]: any;
}>, object, {}, import("vue").ComputedOptions, import("vue").MethodOptions, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, {}> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & import("@elux/core").EluxComponent;
export declare const defineComponent: (args_0: any) => {
    new (...args: any[]): {
        $: import("vue").ComponentInternalInstance;
        $data: {};
        $props: Partial<{}> & Omit<Readonly<{
            [x: string]: any;
        }> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, never>;
        $attrs: {
            [x: string]: unknown;
        };
        $refs: {
            [x: string]: unknown;
        };
        $slots: Readonly<{
            [name: string]: import("vue").Slot | undefined;
        }>;
        $root: import("vue").ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, {}, false, import("vue").ComponentOptionsBase<any, any, any, any, any, any, any, any, any, {}>> | null;
        $parent: import("vue").ComponentPublicInstance<{}, {}, {}, {}, {}, {}, {}, {}, false, import("vue").ComponentOptionsBase<any, any, any, any, any, any, any, any, any, {}>> | null;
        $emit: (event: string, ...args: any[]) => void;
        $el: any;
        $options: import("vue").ComponentOptionsBase<Readonly<{
            [x: string]: any;
        }>, object, {}, import("vue").ComputedOptions, import("vue").MethodOptions, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, {}>;
        $forceUpdate: import("vue").ReactiveEffect<any>;
        $nextTick: typeof import("vue").nextTick;
        $watch(source: string | Function, cb: Function, options?: import("vue").WatchOptions<boolean> | undefined): import("vue").WatchStopHandle;
    } & Readonly<{
        [x: string]: any;
    }> & import("vue").ShallowUnwrapRef<{} & object> & {
        [x: string]: never;
    } & import("vue").MethodOptions & import("vue").ComponentCustomProperties;
    __isFragment?: undefined;
    __isTeleport?: undefined;
    __isSuspense?: undefined;
} & import("vue").ComponentOptionsBase<Readonly<{
    [x: string]: any;
}>, object, {}, import("vue").ComputedOptions, import("vue").MethodOptions, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, {}> & import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps & import("@elux/core").EluxComponent;
export declare function setSsrHtmlTpl(tpl: string): void;
export declare function setConfig(conf: {
    actionMaxHistory?: number;
    pagesMaxHistory?: number;
    pagenames?: Record<string, string>;
    NSP?: string;
    MSP?: string;
    MutableData?: boolean;
    DepthTimeOnLoading?: number;
    LoadComponentOnError?: Component;
    LoadComponentOnLoading?: Component;
    disableNativeRoute?: boolean;
}): void;
export interface RenderOptions {
    viewName?: string;
    id?: string;
    ssrKey?: string;
    url?: string;
}
export declare function createApp(moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string): {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator }: StoreBuilder<O, B>): import("vue").App<Element>;
};
export declare function createSsrApp(moduleGetter: ModuleGetter, middlewares?: IStoreMiddleware[], appModuleName?: string): {
    useStore<O extends BStoreOptions = BStoreOptions, B extends BStore<{}> = BStore<{}>>({ storeOptions, storeCreator }: StoreBuilder<O, B>): import("vue").App<Element>;
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
    LoadComponent: LoadComponent<A>;
    Modules: RootModuleAPI<A>;
    Actions: RootModuleActions<A>;
    Pagenames: {
        [K in keyof A['route']['components']]: K;
    };
};
export declare function getApp<T extends {
    GetActions: any;
    GetRouter: any;
    LoadComponent: any;
    Modules: any;
    Pagenames: any;
}>(): Pick<T, 'GetActions' | 'GetRouter' | 'LoadComponent' | 'Modules' | 'Pagenames'>;
