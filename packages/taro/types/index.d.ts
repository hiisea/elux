/// <reference path="../runtime/runtime.d.ts" />
import { SingleDispatcher } from '@elux/core';
import { IHistory } from '@elux/route-mp';
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
    search: string;
    action: 'PUSH' | 'POP' | 'REPLACE' | 'RELAUNCH';
};
export declare const eventBus: SingleDispatcher<RouteChangeEventData>;
export declare const tabPages: {
    [path: string]: boolean;
};
export declare const taroHistory: IHistory;
export declare function getTabPages(): {
    [path: string]: boolean;
};
export {};
//# sourceMappingURL=index.d.ts.map