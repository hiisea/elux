import React, { ComponentType } from 'react';
import { IStore } from '@elux/core';
import { EluxContext } from './base';
export declare function renderToMP(store: IStore, eluxContext: EluxContext): ComponentType<any>;
export declare function renderToDocument(id: string, APPView: ComponentType<any>, store: IStore, eluxContext: EluxContext, fromSSR: boolean): void;
export declare function renderToString(id: string, APPView: ComponentType<any>, store: IStore, eluxContext: EluxContext): Promise<string>;
export declare const Portal: React.FC<{}>;
