import { ComponentType } from 'react';
import { IStore } from '@elux/core';
import { EluxContext } from './base';
export declare function renderToMP(eluxContext: EluxContext): ComponentType<any>;
export declare function renderToDocument(id: string, APPView: ComponentType<any>, eluxContext: EluxContext, fromSSR: boolean, app: {}, store: IStore): void;
export declare function renderToString(id: string, APPView: ComponentType<any>, eluxContext: EluxContext, app: {}, store: IStore): Promise<string>;
//# sourceMappingURL=stage.d.ts.map