import type { LoadComponent } from '@elux/core';
import { Component } from 'vue';
/**
 * EluxUI组件加载参数
 *
 * @remarks
 * EluxUI组件加载参见 {@link LoadComponent}，加载参数可通过 {@link setConfig | setConfig(...)} 设置全局默认，
 * 也可以直接在 `LoadComponent(...)` 中特别指明
 *
 * @example
 * ```js
 *   const OnError = ({message}) => <div>{message}</div>
 *   const OnLoading = () => <div>loading...</div>
 *
 *   const Article = LoadComponent('article', 'main', {OnLoading, OnError})
 * ```
 *
 * @public
 */
export interface LoadComponentOptions {
    OnError?: Component<{
        message: string;
    }>;
    OnLoading?: Component<{}>;
}
export declare const loadComponent: LoadComponent<Record<string, any>, LoadComponentOptions>;
//# sourceMappingURL=loadComponent.d.ts.map