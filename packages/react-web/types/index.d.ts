import { ComponentType } from 'react';
import { Facade } from '@elux/core';
import { LoadComponentOptions } from '@elux/react-components';
import { CreateApp, CreateSSR, UserConfig, GetBaseFacade } from '@elux/app';
export { DocumentHead, Switch, Else, Link } from '@elux/react-components';
export type { DocumentHeadProps, SwitchProps, ElseProps, LinkProps, LoadComponentOptions } from '@elux/react-components';
export { errorAction, LoadingState, env, effect, reducer, setLoading, effectLogger, isServer, deepMerge, exportModule, exportView, exportComponent, modelHotReplacement, EmptyModel, BaseModel, RouteModel, loadModel, getModule, getComponent, } from '@elux/core';
export type { Facade, Dispatch, UStore, DeepPartial, StoreMiddleware, StoreLogger, CommonModule, Action, HistoryAction } from '@elux/core';
export type { GetState, EluxComponent, AsyncEluxComponent, CommonModelClass, ModuleAPI, ReturnComponents, GetPromiseModule, GetPromiseComponent, ModuleState, RootState, CommonModel, RouteState, ActionsThis, PickHandler, ModuleGetter, LoadComponent, HandlerThis, FacadeStates, FacadeModules, FacadeActions, FacadeRoutes, PickActions, UNListener, ActionCreator, } from '@elux/core';
export { location, createRouteModule, safeJsonParse } from '@elux/route';
export type { NativeLocationMap, EluxLocation, NativeLocation, StateLocation, URouter, UHistoryRecord, ULocationTransform, PagenameMap, } from '@elux/route';
export { getApi, patchActions } from '@elux/app';
export type { ComputedStore, GetBaseFacade, UserConfig, CreateApp, CreateSSR, RenderOptions } from '@elux/app';
export * from '@elux/react-redux';
/*** @public */
export declare type GetFacade<F extends Facade, R extends string = 'route'> = GetBaseFacade<F, LoadComponentOptions, R>;
/**
 * 全局参数设置
 *
 * @remarks
 * 必须放在初始化最前面，通常没必要也不支持二次修改
 *
 * - UserConfig：{@link UserConfig | UserConfig}
 *
 * - LoadComponentOnError：用于LoadComponent(...)，组件加载失败时的显示组件，此设置为全局默认，LoadComponent方法中可以单独设置
 *
 * - LoadComponentOnLoading：用于LoadComponent(...)，组件加载中的Loading组件，此设置为全局默认，LoadComponent方法中可以单独设置
 *
 * @param conf - 参数
 *
 * @public
 */
export declare function setConfig(conf: UserConfig & {
    LoadComponentOnError?: ComponentType<{
        message: string;
    }>;
    LoadComponentOnLoading?: ComponentType<{}>;
}): void;
/*** @public */
export declare const createApp: CreateApp<{}>;
/*** @public */
export declare const createSSR: CreateSSR<{}>;
//# sourceMappingURL=index.d.ts.map