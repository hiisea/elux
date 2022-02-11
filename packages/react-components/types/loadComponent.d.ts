import { ComponentType } from 'react';
import { LoadComponent } from '@elux/core';
/*** @public */
export interface LoadComponentOptions {
    OnError?: ComponentType<{
        message: string;
    }>;
    OnLoading?: ComponentType<{}>;
}
declare const reactLoadComponent: LoadComponent<Record<string, any>, LoadComponentOptions>;
export default reactLoadComponent;
//# sourceMappingURL=loadComponent.d.ts.map