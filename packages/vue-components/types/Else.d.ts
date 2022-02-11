import { VNode } from 'vue';
/*** @public */
export interface ElseProps {
    elseView?: VNode;
}
/*** @public */
export default function (props: ElseProps, context: {
    slots: {
        default?: () => VNode[];
        elseView?: () => VNode[];
    };
}): VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>;
//# sourceMappingURL=Else.d.ts.map