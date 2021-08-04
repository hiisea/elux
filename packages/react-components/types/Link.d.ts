import React from 'react';
export interface Props extends React.HTMLAttributes<HTMLDivElement> {
    url: string;
    onClick?(event: React.MouseEvent): void;
    href?: string;
    action?: 'push' | 'replace' | 'relaunch';
    root?: boolean;
}
declare const _default: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLAnchorElement>>;
export default _default;
