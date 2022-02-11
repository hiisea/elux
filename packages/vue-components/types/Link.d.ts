import { HTMLAttributes, VNode, Events } from 'vue';
/*** @public */
export interface LinkProps extends HTMLAttributes {
    disabled?: boolean;
    route?: string;
    onClick?(event: Events['onClick']): void;
    href?: string;
    action?: 'push' | 'replace' | 'relaunch';
    root?: boolean;
}
/*** @public */
export default function ({ onClick: _onClick, disabled, href, route, action, root, ...props }: LinkProps, context: {
    slots: {
        default?: () => VNode[];
    };
}): VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>;
//# sourceMappingURL=Link.d.ts.map