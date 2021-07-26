import { ComponentType } from 'react';
import { IStore } from '@elux/core';
import { EluxContext } from './base';
export declare function renderToMP(id: string, APPView: ComponentType<any>, store: IStore, eluxContext: EluxContext, fromSSR: boolean): ComponentType<any>;
export declare function renderToDocument(id: string, APPView: ComponentType<any>, store: IStore, eluxContext: EluxContext, fromSSR: boolean): void;
export declare function renderToString(id: string, APPView: ComponentType<any>, store: IStore, eluxContext: EluxContext): Promise<string>;
