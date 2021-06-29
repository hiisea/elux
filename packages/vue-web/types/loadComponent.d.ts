import type { LoadComponent as BaseLoadComponent, RootModuleFacade } from '@elux/core';
import { Component } from 'vue';
export declare const DepsContext = "__EluxDepsContext__";
export declare type LoadComponent<A extends RootModuleFacade = {}> = BaseLoadComponent<A, {
    OnError?: Component;
    OnLoading?: Component;
}>;
export declare function setLoadComponentOptions({ LoadComponentOnError, LoadComponentOnLoading, }: {
    LoadComponentOnError?: Component<{
        message: string;
    }>;
    LoadComponentOnLoading?: Component<{}>;
}): void;
export declare const loadComponent: LoadComponent;
