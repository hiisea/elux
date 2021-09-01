import { HTMLAttributes, VNode } from 'vue';
declare type MouseEvent = any;
export interface Props extends HTMLAttributes {
    url: string;
    onClick?(event: MouseEvent): void;
    href?: string;
    action?: 'push' | 'replace' | 'relaunch';
    root?: boolean;
}
export default function (props: Props, context: {
    slots: {
        default?: () => VNode[];
    };
}): VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>;
export {};
