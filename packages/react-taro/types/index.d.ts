import { ComponentType } from 'react';
import { RootModuleFacade } from '@elux/core';
import { LoadComponentOptions } from '@elux/react-components';
import { UserConfig, GetBaseAPP, CreateMP } from '@elux/app';
export { DocumentHead, Switch, Else, Link, loadComponent } from '@elux/react-components';
export * from '@elux/app';
export declare type GetApp<A extends RootModuleFacade> = GetBaseAPP<A, LoadComponentOptions>;
export declare function setConfig(conf: UserConfig & {
    LoadComponentOnError?: ComponentType<{
        message: string;
    }>;
    LoadComponentOnLoading?: ComponentType<{}>;
}): void;
export declare const createMP: CreateMP;
//# sourceMappingURL=index.d.ts.map