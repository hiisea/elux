import { ComponentType } from 'react';
import { LoadComponent } from '@elux/core';
export interface LoadComponentOptions {
    OnError?: ComponentType<{
        message: string;
    }>;
    OnLoading?: ComponentType<{}>;
}
declare const loadComponent: LoadComponent<Record<string, any>, LoadComponentOptions>;
export default loadComponent;
