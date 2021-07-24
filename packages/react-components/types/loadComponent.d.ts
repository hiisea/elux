import { ComponentType } from 'react';
import { LoadComponent as BaseLoadComponent, RootModuleFacade } from '@elux/core';
export declare type LoadComponent<A extends RootModuleFacade = {}> = BaseLoadComponent<A, {
    OnError?: ComponentType<{
        message: string;
    }>;
    OnLoading?: ComponentType<{}>;
}>;
declare const loadComponent: LoadComponent<Record<string, any>>;
export default loadComponent;
