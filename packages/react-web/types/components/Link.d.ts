import React from 'react';
export interface Props extends React.AnchorHTMLAttributes<HTMLAnchorElement> {
    replace?: boolean;
}
export declare const Link: React.ForwardRefExoticComponent<Props & React.RefAttributes<HTMLAnchorElement>>;
