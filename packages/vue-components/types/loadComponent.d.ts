import type { LoadComponent } from '@elux/core';
import { Component } from 'vue';
/*** @public */
export interface LoadComponentOptions {
    OnError?: Component<{
        message: string;
    }>;
    OnLoading?: Component<{}>;
}
declare const vueLoadComponent: LoadComponent<Record<string, any>, LoadComponentOptions>;
export default vueLoadComponent;
//# sourceMappingURL=loadComponent.d.ts.map