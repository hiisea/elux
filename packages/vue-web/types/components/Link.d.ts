import { AnchorHTMLAttributes } from 'vue';
export interface Props extends AnchorHTMLAttributes {
    replace?: boolean;
}
export default function (props: Props, context: {
    slots: any;
}): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>;
