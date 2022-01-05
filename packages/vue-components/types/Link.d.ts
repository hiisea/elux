import { HTMLAttributes, VNode } from 'vue';
declare type MouseEvent = any;
export interface Props extends HTMLAttributes {
    route?: string;
    onClick?(event: MouseEvent): void;
    href?: string;
    action?: 'push' | 'replace' | 'relaunch';
    root?: boolean;
}
export default function ({ onClick: _onClick, href, route, action, root, ...props }: Props, context: {
    slots: {
        default?: () => VNode[];
    };
}): VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>;
export {};
//# sourceMappingURL=Link.d.ts.map