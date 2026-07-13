import * as React from 'react';
export interface CardProps {
    title?: string;
    description?: string;
    image?: string;
    variant?: 'featured' | 'minimal' | 'glass' | 'solid';
    children?: React.ReactNode;
    className?: string;
}
declare const Card: ({ title, description, image, variant, children, className }: CardProps) => React.JSX.Element;
export { Card };
