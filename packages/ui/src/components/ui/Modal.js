'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';
import { Button } from './Button';
const Modal = ({ isOpen, onClose, title, children, variant = 'centered', className }) => {
    return (_jsx(AnimatePresence, { children: isOpen && (_jsx(motion.div, { initial: { opacity: 0 }, animate: { opacity: 1 }, exit: { opacity: 0 }, className: "fixed inset-0 z-50 flex items-center justify-center bg-obsidian/60 backdrop-blur-xl p-4", onClick: onClose, children: _jsxs(motion.div, { initial: { scale: 0.95, opacity: 0 }, animate: { scale: 1, opacity: 1 }, exit: { scale: 0.95, opacity: 0 }, onClick: (e) => e.stopPropagation(), className: cn('bg-white/5 border border-white/10 backdrop-blur-2xl rounded-3xl p-8 shadow-2xl relative', variant === 'centered' && 'max-w-lg w-full', variant === 'full-screen' && 'fixed inset-0 m-0 rounded-none p-12', variant === 'side-panel' && 'fixed right-0 top-0 h-full w-full max-w-md rounded-l-3xl rounded-tr-3xl p-8', className), children: [_jsxs("div", { className: "flex justify-between items-center mb-6", children: [_jsx("h2", { className: "text-2xl font-serif", children: title }), _jsx(Button, { variant: "ghost", size: "sm", onClick: onClose, className: "rounded-full w-8 h-8 p-0", children: "\u2715" })] }), children] }) })) }));
};
export { Modal };
