import { ComponentType } from 'react';
import { UStore } from '@elux/core';
import { EluxContext } from './base';
export declare function renderToMP(eluxContext: EluxContext): ComponentType<any>;
export declare function renderToDocument(id: string, APPView: ComponentType<any>, eluxContext: EluxContext, fromSSR: boolean, app: {}, store: UStore): void;
export declare function renderToString(id: string, APPView: ComponentType<any>, eluxContext: EluxContext, app: {}, store: UStore): Promise<string>;
//# sourceMappingURL=stage.d.ts.map