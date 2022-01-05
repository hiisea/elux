import type { LoadComponent } from '@elux/core';
import { Component } from 'vue';
export interface LoadComponentOptions {
    OnError?: Component<{
        message: string;
    }>;
    OnLoading?: Component<{}>;
}
declare const loadComponent: LoadComponent<Record<string, any>, LoadComponentOptions>;
export default loadComponent;
//# sourceMappingURL=loadComponent.d.ts.map