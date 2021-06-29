import React from 'react';
export interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    replace?: boolean;
}
export default function (props: Props, context: {
    slots: any;
}): import("vue").VNode<import("vue").RendererNode, import("vue").RendererElement, {
    [key: string]: any;
}>;
