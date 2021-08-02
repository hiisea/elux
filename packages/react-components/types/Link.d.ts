import React from 'react';
export interface Props extends React.HTMLAttributes<HTMLDivElement> {
    url: string;
    onClick?(event: React.MouseEvent): void;
    href?: string;
    replace?: boolean;
    portal?: boolean;
}
declare const _default: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLAnchorElement>>;
export default _default;
