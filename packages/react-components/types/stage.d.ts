import { ComponentType } from 'react';
import { EluxContext } from './base';
export declare function renderToMP(eluxContext: EluxContext): ComponentType<any>;
export declare function renderToDocument(id: string, APPView: ComponentType<any>, eluxContext: EluxContext, fromSSR: boolean): void;
export declare function renderToString(id: string, APPView: ComponentType<any>, eluxContext: EluxContext): Promise<string>;
