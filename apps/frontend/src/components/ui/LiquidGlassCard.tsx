'use client';

import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

export interface LiquidGlassCardProps {
  children: React.ReactNode;
  className?: string;
  goldAccent?: boolean;
  glow?: boolean;
  onClick?: () => void;
}

export const LiquidGlassCard: React.FC<LiquidGlassCardProps> = ({
  children,
  className = '',
  goldAccent = false,
  glow = true,
  onClick,
}) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const rect = cardRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;
    setMousePos({ x, y });
  };

  return (
    <motion.div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`relative rounded-2xl overflow-hidden transition-all duration-300 ${
        goldAccent ? 'artisan-glass-gold' : 'artisan-glass'
      } ${onClick ? 'cursor-pointer' : ''} ${className}`}
    >
      {/* Specular Top Reflection Hairline */}
      <div className="artisan-specular-top" />

      {/* Mouse-reactive Liquid Highlight Glow */}
      {glow && (
        <div
          className="pointer-events-none absolute -inset-px transition-opacity duration-300 opacity-0 group-hover:opacity-100"
          style={{
            opacity: isHovered ? 1 : 0,
            background: `radial-gradient(400px circle at ${mousePos.x}% ${mousePos.y}%, rgba(212, 175, 55, 0.15), transparent 70%)`,
          }}
        />
      )}

      {/* Card Body */}
      <div className="relative z-10 p-6 sm:p-8">{children}</div>
    </motion.div>
  );
};

export default LiquidGlassCard;
