"use client";

import { useState } from 'react';

export interface BentoGridItem {
  id: string;
  x?: number;
  y?: number;
  w?: number;
  h?: number;
  content: React.ReactNode;
}

export function useBentoGrid() {
  const [items, setItems] = useState<BentoGridItem[]>([]);
  const [isEditMode, setIsEditMode] = useState(false);

  const addItem = (item: BentoGridItem) => {
    setItems(prev => [...prev, item]);
  };

  const removeItem = (id: string) => {
    setItems(prev => prev.filter(item => item.id !== id));
  };

  const updateItem = (id: string, updates: Partial<BentoGridItem>) => {
    setItems(prev => prev.map(item =>
      item.id === id ? { ...item, ...updates } : item
    ));
  };

  const clearItems = () => {
    setItems([]);
  };

  return {
    items,
    isEditMode,
    setIsEditMode,
    addItem,
    removeItem,
    updateItem,
    clearItems,
  };
}
