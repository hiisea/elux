import { Component, App } from 'vue';
import { RootModuleFacade } from '@elux/core';
import { LoadComponentOptions } from '@elux/vue-components';
import { UserConfig, GetBaseAPP, AttachMP } from '@elux/app';
export * from '@elux/vue-components';
export * from '@elux/app';
export declare type GetApp<A extends RootModuleFacade> = GetBaseAPP<A, LoadComponentOptions>;
export declare function setConfig(conf: UserConfig & {
    LoadComponentOnError?: Component<{
        message: string;
    }>;
    LoadComponentOnLoading?: Component<{}>;
}): void;
export declare const createMP: AttachMP<App>;
