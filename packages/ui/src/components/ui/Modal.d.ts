import * as React from 'react';
export interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    children?: React.ReactNode;
    variant?: 'centered' | 'full-screen' | 'side-panel';
    className?: string;
}
declare const Modal: ({ isOpen, onClose, title, children, variant, className }: ModalProps) => React.JSX.Element;
export { Modal };
