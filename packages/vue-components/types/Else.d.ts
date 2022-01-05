import { VNode } from 'vue';
interface Props {
    elseView?: VNode;
}
export default function (props: Props, context: {
    slots: {
        default?: () => VNode[];
        elseView?: () => VNode[];
    };
}): VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>;
export {};
//# sourceMappingURL=Else.d.ts.map