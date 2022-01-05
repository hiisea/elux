import { ComponentType } from 'react';
import { RootModuleFacade } from '@elux/core';
import { LoadComponentOptions } from '@elux/react-components';
import { CreateApp, CreateSSR, UserConfig, GetBaseAPP } from '@elux/app';
export { DocumentHead, Switch, Else, Link, loadComponent } from '@elux/react-components';
export type { DocumentHeadProps, SwitchProps, ElseProps, LinkProps, LoadComponentOptions } from '@elux/react-components';
export * from '@elux/app';
/*** @internal */
export declare type GetApp<A extends RootModuleFacade, R extends string = 'route', NT = unknown> = GetBaseAPP<A, LoadComponentOptions, R, NT>;
/*** @internal */
export declare function setConfig(conf: UserConfig & {
    LoadComponentOnError?: ComponentType<{
        message: string;
    }>;
    LoadComponentOnLoading?: ComponentType<{}>;
}): void;
/*** @internal */
export declare const createApp: CreateApp;
/*** @internal */
export declare const createSSR: CreateSSR;
//# sourceMappingURL=index.d.ts.map