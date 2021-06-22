import React, { ComponentType } from 'react';
import type { LoadComponent as BaseLoadComponent, RootModuleFacade } from '@elux/core';
export declare const DepsContext: React.Context<{}>;
export declare type LoadView<A extends RootModuleFacade = {}> = BaseLoadComponent<A, {
    OnError?: ComponentType<{
        message: string;
    }>;
    OnLoading?: ComponentType<{}>;
}>;
export declare function setLoadViewOptions({ LoadViewOnError, LoadViewOnLoading, }: {
    LoadViewOnError?: ComponentType<{
        message: string;
    }>;
    LoadViewOnLoading?: ComponentType<{}>;
}): void;
export declare const loadView: LoadView<Record<string, any>>;
