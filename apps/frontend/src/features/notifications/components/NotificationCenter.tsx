'use client';

/**
 * HEXA Studio Real-Time Notification Center
 *
 * Provides real-time activity alerts for client approvals, Odoo invoice updates,
 * 3D render deliveries, and support ticket SLA notifications.
 */

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'approval' | 'invoice' | 'render' | 'support';
  read: boolean;
  link: string;
}

const INITIAL_NOTIFICATIONS: NotificationItem[] = [
  {
    id: '1',
    title: '3D Render Ready for Review',
    message: 'Villa Horizon — 4K Exterior Twilight Render has been uploaded for approval.',
    timestamp: '10 mins ago',
    type: 'render',
    read: false,
    link: '/portal/approvals',
  },
  {
    id: '2',
    title: 'Odoo Invoice #INV-2026-089',
    message: 'Milestone 2 (Spatial Design & Modeling) invoice issued.',
    timestamp: '1 hour ago',
    type: 'invoice',
    read: false,
    link: '/portal/finance',
  },
  {
    id: '3',
    title: 'Milestone Sign-Off Requested',
    message: 'Schematic Design phase complete. Sign-off required to start Phase 2.',
    timestamp: '3 hours ago',
    type: 'approval',
    read: false,
    link: '/portal/approvals',
  },
  {
    id: '4',
    title: 'Support SLA Response',
    message: 'Ticket #SUP-402 (Material Texture Spec Update) resolved by Lead Architect.',
    timestamp: 'Yesterday',
    type: 'support',
    read: true,
    link: '/portal/support',
  },
];

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<NotificationItem[]>(INITIAL_NOTIFICATIONS);
  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread'>('all');

  const unreadCount = notifications.filter((n) => !n.read).length;

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  const markAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  };

  const filteredNotifications = notifications.filter((n) => (filter === 'unread' ? !n.read : true));

  return (
    <div className="relative">
      {/* Bell Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="Toggle notifications"
        className="relative p-2.5 rounded-full text-neutral-300 hover:text-white hover:bg-neutral-800/60 transition-colors focus:outline-none"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.75}
            d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
          />
        </svg>

        {unreadCount > 0 && (
          <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-neutral-950 shadow-lg">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notifications Popover */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            className="absolute right-0 mt-3 w-80 sm:w-96 rounded-2xl border border-neutral-800 bg-neutral-950/95 p-4 shadow-2xl backdrop-blur-2xl z-50 text-neutral-100"
          >
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-neutral-200">Notifications</h4>
                {unreadCount > 0 && (
                  <span className="px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-[10px] font-bold text-amber-400">
                    {unreadCount} new
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={markAllAsRead}
                  className="text-[11px] text-neutral-400 hover:text-amber-400 transition-colors"
                >
                  Mark all read
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="text-neutral-400 hover:text-neutral-200 p-1 rounded"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Filter Pills */}
            <div className="flex space-x-2 my-3">
              <button
                onClick={() => setFilter('all')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'all' ? 'bg-neutral-800 text-amber-400 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                All ({notifications.length})
              </button>
              <button
                onClick={() => setFilter('unread')}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  filter === 'unread' ? 'bg-neutral-800 text-amber-400 border border-neutral-700' : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                Unread ({unreadCount})
              </button>
            </div>

            {/* Notification List */}
            <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
              {filteredNotifications.length === 0 ? (
                <p className="text-xs text-neutral-500 text-center py-6">No notifications</p>
              ) : (
                filteredNotifications.map((item) => (
                  <Link
                    key={item.id}
                    href={item.link}
                    onClick={() => {
                      markAsRead(item.id);
                      setIsOpen(false);
                    }}
                    className={`block p-3 rounded-xl border transition-all ${
                      item.read
                        ? 'bg-neutral-900/30 border-neutral-800/60 opacity-70'
                        : 'bg-neutral-900 border-amber-500/30 shadow-md shadow-amber-500/5'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <span className="text-xs font-bold text-neutral-100">{item.title}</span>
                      <span className="text-[10px] text-neutral-500">{item.timestamp}</span>
                    </div>
                    <p className="text-[11px] text-neutral-300 mt-1 leading-snug">{item.message}</p>
                  </Link>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="pt-3 mt-3 border-t border-neutral-800 text-center">
              <Link
                href="/portal"
                onClick={() => setIsOpen(false)}
                className="text-xs text-amber-400 hover:text-amber-300 font-semibold"
              >
                View Client Portal HQ →
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
