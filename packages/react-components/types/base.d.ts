import React from 'react';
import { EluxContext, IRouter } from '@elux/core';
export declare const EluxContextComponent: React.Context<EluxContext>;
export declare function UseRouter(): IRouter;
export declare const reactComponentsConfig: {
    hydrate?: (component: any, container: any) => void;
    render?: (component: any, container: any) => void;
    renderToString?: (component: any) => string;
};
export declare const setReactComponentsConfig: (config: Partial<{
    hydrate?: ((component: any, container: any) => void) | undefined;
    render?: ((component: any, container: any) => void) | undefined;
    renderToString?: ((component: any) => string) | undefined;
}>) => void;
//# sourceMappingURL=base.d.ts.map