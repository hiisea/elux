import { ComponentType } from 'react';
import { RootModuleFacade } from '@elux/core';
import { LoadComponentOptions } from '@elux/react-components';
import { UserConfig, GetBaseAPP } from '@elux/app';
export * from '@elux/react-components';
export * from '@elux/app';
export { createMP } from '@elux/taro';
export declare type GetApp<A extends RootModuleFacade> = GetBaseAPP<A, LoadComponentOptions>;
export declare function setConfig(conf: UserConfig & {
    LoadComponentOnError?: ComponentType<{
        message: string;
    }>;
    LoadComponentOnLoading?: ComponentType<{}>;
}): void;
