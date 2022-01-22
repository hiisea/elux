import { ComponentType } from 'react';
import { LoadComponent } from '@elux/core';
/*** @public */
export interface LoadComponentOptions {
    OnError?: ComponentType<{
        message: string;
    }>;
    OnLoading?: ComponentType<{}>;
}
/*** @internal */
declare const loadComponent: LoadComponent<Record<string, any>, LoadComponentOptions>;
export default loadComponent;
//# sourceMappingURL=loadComponent.d.ts.map