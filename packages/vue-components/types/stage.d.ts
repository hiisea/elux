import { DefineComponent, PropType } from 'vue';
import type { App } from 'vue';
import { UStore } from '@elux/core';
import { EluxContext } from './base';
export declare const Page: DefineComponent<{
    store: {
        type: PropType<UStore<import("@elux/core").RootState, import("@elux/core").RootState>>;
        required: true;
    };
    view: {
        type: PropType<DefineComponent<{}, {}, {}, import("vue").ComputedOptions, import("vue").MethodOptions, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{} & {}>, {}>>;
        required: true;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    store: UStore<import("@elux/core").RootState, import("@elux/core").RootState>;
    view: DefineComponent<{}, {}, {}, import("vue").ComputedOptions, import("vue").MethodOptions, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{} & {}>, {}>;
} & {}>, {}>;
export declare const Router: DefineComponent<{}, () => JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, import("vue").EmitsOptions, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{} & {}>, {}>;
export declare function renderToMP(eluxContext: EluxContext, app: App): void;
export declare function renderToDocument(id: string, APPView: DefineComponent<{}>, eluxContext: EluxContext, fromSSR: boolean, app: App, store: UStore): void;
export declare function renderToString(id: string, APPView: DefineComponent<{}>, eluxContext: EluxContext, app: App, store: UStore): Promise<string>;
//# sourceMappingURL=stage.d.ts.map