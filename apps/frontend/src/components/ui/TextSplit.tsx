'use client';

import React, { useEffect, useRef } from 'react';
import gsap from 'gsap';

interface TextSplitProps {
  children: string;
  className?: string;
  delay?: number;
}

export const TextSplit = ({ children, className, delay = 0 }: TextSplitProps) => {
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!textRef.current) return;

    const text = children;
    const words = text.split(' ');
    
    // Clear current content
    textRef.current.innerHTML = '';

    const container = document.createElement('div');
    container.className = 'flex flex-wrap justify-center md:justify-start';

    words.forEach((word, i) => {
      const wordSpan = document.createElement('span');
      wordSpan.className = 'inline-block overflow-hidden mr-[0.2em]';
      
      const innerSpan = document.createElement('span');
      innerSpan.className = 'inline-block translate-y-full block';
      innerSpan.textContent = word + ' ';
      
      wordSpan.appendChild(innerSpan);
      container.appendChild(wordSpan);

      gsap.to(innerSpan, {
        y: 0,
        duration: 1,
        delay: delay + i * 0.1,
        ease: 'power4.out',
      });
    });

    textRef.current.appendChild(container);
  }, [children, delay]);

  return <div ref={textRef} className={className} />;
};
