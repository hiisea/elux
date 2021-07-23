import { ComponentType } from 'react';
import { CreateApp, CreateSSR, BaseConfig } from '@elux/app';
export * from '@elux/react-components';
export * from '@elux/app';
export declare function setConfig(conf: BaseConfig & {
    LoadComponentOnError?: ComponentType<{
        message: string;
    }>;
    LoadComponentOnLoading?: ComponentType<{}>;
}): void;
export declare const createApp: CreateApp;
export declare const createSSR: CreateSSR;
