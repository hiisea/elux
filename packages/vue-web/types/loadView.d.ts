import type { LoadComponent as BaseLoadComponent, RootModuleFacade } from '@elux/core';
import { Component } from 'vue';
export declare type LoadView<A extends RootModuleFacade = {}> = BaseLoadComponent<A, {
    OnError?: Component;
    OnLoading?: Component;
}>;
export declare function setLoadViewOptions({ LoadViewOnError, LoadViewOnLoading, }: {
    LoadViewOnError?: Component<{
        message: string;
    }>;
    LoadViewOnLoading?: Component<{}>;
}): void;
export declare const loadView: LoadView;
