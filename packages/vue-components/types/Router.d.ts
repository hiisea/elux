import { PropType } from 'vue';
import { EluxComponent, IStore } from '@elux/core';
export declare const RouterComponent: import("vue").DefineComponent<{}, () => JSX.Element, {}, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, import("vue").EmitsOptions, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{} & {}>, {}>;
export declare const EWindow: import("vue").DefineComponent<{
    store: {
        type: PropType<IStore<import("@elux/core").StoreState>>;
        required: true;
    };
    view: {
        type: PropType<EluxComponent>;
        required: true;
    };
}, () => import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>, unknown, {}, {}, import("vue").ComponentOptionsMixin, import("vue").ComponentOptionsMixin, Record<string, any>, string, import("vue").VNodeProps & import("vue").AllowedComponentProps & import("vue").ComponentCustomProps, Readonly<{
    store: IStore<import("@elux/core").StoreState>;
    view: EluxComponent;
} & {}>, {}>;
//# sourceMappingURL=Router.d.ts.map