'use client';
import { jsx as _jsx, Fragment as _Fragment, jsxs as _jsxs } from "react/jsx-runtime";
import { useState, useEffect } from 'react';
import { cn } from '../../lib/utils';
import { Button } from './Button';
export const NavBar = ({ logo, links, ctaText, ctaHref, className }) => {
    const [scrolled, setScrolled] = useState(false);
    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);
    return (_jsxs("nav", { className: cn("fixed top-0 left-0 w-full z-40 transition-all duration-500 px-8 py-4 flex items-center justify-between", scrolled ? "bg-obsidian/40 backdrop-blur-lg border-b border-white/10 py-3" : "bg-transparent py-6", className), children: [_jsx("div", { className: "flex items-center gap-2 font-serif text-2xl font-bold text-white", children: logo || (_jsxs(_Fragment, { children: ["HEXA ", _jsx("span", { className: "text-gold", children: "STUDIO" })] })) }), _jsx("div", { className: "hidden md:flex items-center gap-8", children: links?.map((link) => (_jsxs("a", { href: link.href, className: "relative text-sm uppercase tracking-widest text-white/60 hover:text-white transition-colors group", children: [link.label, _jsx("span", { className: "absolute -bottom-1 left-0 w-0 h-px bg-gold transition-all duration-300 group-hover:w-full" })] }, link.href))) }), ctaText && (_jsx(Button, { variant: "primary", size: "sm", className: "rounded-full px-6", asChild: true, children: _jsx("a", { href: ctaHref, children: ctaText }) }))] }));
};
