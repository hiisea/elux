/// <reference path="../runtime/runtime.d.ts" />
import { SingleDispatcher } from '@elux/core';
import { RouteENV } from '@elux/route-mp';
export interface PageConfig {
    dispatch?(action: {
        type: string;
    }): any;
    onLoad?(options: any): void;
    onUnload?(): void;
    onShow?(): void;
    onHide?(): void;
}
declare type RouteChangeEventData = {
    pathname: string;
    searchData?: {
        [key: string]: string;
    };
    action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';
};
export declare const eventBus: SingleDispatcher<RouteChangeEventData>;
export declare const tabPages: {
    [path: string]: boolean;
};
export declare const routeENV: RouteENV;
export declare function getTabPages(): {
    [path: string]: boolean;
};
export {};
