import React from 'react';
/*** @public */
export interface LinkProps extends React.HTMLAttributes<HTMLDivElement> {
    disabled?: boolean;
    route?: string;
    onClick?(event: React.MouseEvent): void;
    href?: string;
    action?: 'push' | 'replace' | 'relaunch';
    root?: boolean;
}
declare const _default: React.ForwardRefExoticComponent<LinkProps & React.RefAttributes<HTMLAnchorElement>>;
/*** @public */
export default _default;
//# sourceMappingURL=Link.d.ts.map