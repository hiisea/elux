import { ComponentType } from 'react';
import { IStore } from '@elux/core';
import { EluxContext } from './base';
export declare function renderToDocument(id: string, APP: ComponentType<any>, store: IStore, eluxContext: EluxContext, fromSSR: boolean): void;
export declare function renderToString(id: string, APP: ComponentType<any>, store: IStore, eluxContext: EluxContext): string;
