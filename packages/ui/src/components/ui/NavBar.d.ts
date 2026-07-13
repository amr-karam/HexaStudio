import * as React from 'react';
export interface NavBarProps {
    logo?: React.ReactNode;
    links?: {
        label: string;
        href: string;
    }[];
    ctaText?: string;
    ctaHref?: string;
    className?: string;
}
export declare const NavBar: ({ logo, links, ctaText, ctaHref, className }: NavBarProps) => React.JSX.Element;
