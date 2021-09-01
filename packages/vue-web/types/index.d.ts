import { Component } from 'vue';
import type { App } from 'vue';
import { RootModuleFacade } from '@elux/core';
import { LoadComponentOptions } from '@elux/vue-components';
import { CreateApp, CreateSSR, UserConfig, GetBaseAPP } from '@elux/app';
export { DocumentHead, Switch, Else, Link, loadComponent } from '@elux/vue-components';
export * from '@elux/app';
export declare type GetApp<A extends RootModuleFacade, R extends string = 'route', NT = unknown> = GetBaseAPP<A, LoadComponentOptions, R, NT>;
export declare function setConfig(conf: UserConfig & {
    LoadComponentOnError?: Component<{
        message: string;
    }>;
    LoadComponentOnLoading?: Component<{}>;
}): void;
export declare const createApp: CreateApp<App>;
export declare const createSSR: CreateSSR<App>;
