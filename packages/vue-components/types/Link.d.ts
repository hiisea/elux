import { HTMLAttributes } from 'vue';
declare type MouseEvent = any;
export interface Props extends HTMLAttributes {
    url: string;
    onClick?(event: MouseEvent): void;
    href?: string;
    replace?: boolean;
}
export default function (props: Props, context: {
    slots: any;
}): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>;
export {};
