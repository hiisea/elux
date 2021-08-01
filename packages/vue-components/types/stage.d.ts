import { Component } from 'vue';
import type { App } from 'vue';
import { IStore } from '@elux/core';
import { EluxContext } from './base';
export declare const RootComponent: Component;
export declare function renderToMP(store: IStore, eluxContext: EluxContext, app: App): void;
export declare function renderToDocument(id: string, APPView: Component<any>, store: IStore, eluxContext: EluxContext, fromSSR: boolean, app: App): void;
export declare function renderToString(id: string, APPView: Component<any>, store: IStore, eluxContext: EluxContext, app: App): Promise<string>;
