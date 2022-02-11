import { VNode } from 'vue';
/*** @public */
export interface SwitchProps {
    elseView?: VNode;
}
/*** @public */
export default function (props: SwitchProps, context: {
    slots: {
        default?: () => VNode[];
        elseView?: () => VNode[];
    };
}): VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>;
//# sourceMappingURL=Switch.d.ts.map