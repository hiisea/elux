import { Component, App } from 'vue';
import { Facade } from '@elux/core';
import { LoadComponentOptions } from '@elux/vue-components';
import { CreateApp, CreateSSR, UserConfig, GetBaseFacade } from '@elux/app';
export { DocumentHead, Switch, Else, Link } from '@elux/vue-components';
export type { DocumentHeadProps, SwitchProps, ElseProps, LinkProps, LoadComponentOptions } from '@elux/vue-components';
export { errorAction, LoadingState, env, effect, reducer, setLoading, effectLogger, isServer, deepMerge, exportModule, exportView, exportComponent, modelHotReplacement, EmptyModel, BaseModel, RouteModel, loadModel, getModule, getComponent, } from '@elux/core';
export type { Facade, Dispatch, UStore, DeepPartial, StoreMiddleware, StoreLogger, CommonModule, Action, HistoryAction } from '@elux/core';
export type { GetState, EluxComponent, AsyncEluxComponent, CommonModelClass, ModuleAPI, ReturnComponents, GetPromiseModule, GetPromiseComponent, ModuleState, RootState, CommonModel, RouteState, ActionsThis, PickHandler, ModuleGetter, LoadComponent, HandlerThis, FacadeStates, FacadeModules, FacadeActions, FacadeRoutes, PickActions, UNListener, ActionCreator, } from '@elux/core';
export { location, createRouteModule, safeJsonParse } from '@elux/route';
export type { NativeLocationMap, EluxLocation, NativeLocation, StateLocation, URouter, UHistoryRecord, ULocationTransform, PagenameMap, } from '@elux/route';
export { getApi, patchActions } from '@elux/app';
export type { ComputedStore, GetBaseFacade, UserConfig, CreateApp, CreateSSR, RenderOptions } from '@elux/app';
/*** @public */
export declare type GetFacade<F extends Facade, R extends string = 'route'> = GetBaseFacade<F, LoadComponentOptions, R>;
/*** @public */
export declare function setConfig(conf: UserConfig & {
    LoadComponentOnError?: Component<{
        message: string;
    }>;
    LoadComponentOnLoading?: Component<{}>;
}): void;
/*** @public */
export declare const createApp: CreateApp<App>;
/*** @public */
export declare const createSSR: CreateSSR<App>;
//# sourceMappingURL=index.d.ts.map