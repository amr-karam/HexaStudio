'use client';
import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { cn } from '../../lib/utils';
import { motion } from 'framer-motion';
const Card = ({ title, description, image, variant = 'featured', children, className }) => {
    return (_jsxs(motion.div, { whileHover: { y: -4 }, className: cn('group relative overflow-hidden rounded-2xl border transition-all duration-500', variant === 'featured' && 'border-white/20 bg-gradient-to-b from-white/10 to-transparent', variant === 'minimal' && 'border-transparent hover:bg-white/5', variant === 'glass' && 'bg-[var(--glass-bg)] backdrop-blur-md border-[var(--glass-border)]', variant === 'solid' && 'bg-surface border-border/50', className), children: [image && (_jsx("div", { className: "aspect-video overflow-hidden", children: _jsx("img", { src: image, className: "w-full h-full object-cover transition-transform duration-700 group-hover:scale-105", alt: title || 'Project image' }) })), _jsxs("div", { className: "p-6", children: [title && (_jsx("h3", { className: "text-xl font-serif mb-2 group-hover:text-accent transition-colors duration-300", children: title })), description && (_jsx("p", { className: "text-sm text-white/60 line-clamp-2 mb-4 transition-colors duration-300 group-hover:text-white/80", children: description })), children] })] }));
};
export { Card };
