'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import {
  FileText, TrendingUp, DollarSign, Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
// Components KpiCard and BarChart are defined locally below

// ─── Types ──────────────────────────────────────────────────────────────────

interface SalesStats {
  revenue: number;
  orders: number;
  customers: number;
  averageOrderValue: number;
}

interface RecentOrder {
  id: string;
  customer: string;
  amount: number;
  date: string;
}

interface PipelineStage {
  name: string;
  value: number;
  color: string;
}

// ─── Components ────────────────────────────────────────────────────────────

function KpiCard({ icon: Icon, label, value, prefix, suffix, trend, trendLabel, color = '#D4A843' }: {
  icon: LucideIcon;
  label: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend?: 'up' | 'down';
  trendLabel?: string;
  color?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5 hover:border-[#D4A843]/20 transition-colors"
    >
      <div className="flex items-center justify-between mb-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <Icon size={17} style={{ color }} />
        </div>
        {trend && (
          <span className={`flex items-center gap-0.5 text-[11px] font-medium ${trend === 'up' ? 'text-emerald-400' : 'text-red-400'}`}>
            {trend === 'up' ? <TrendingUp size={12} /> : <TrendingUp size={12} className="rotate-180" />}
            {trendLabel}
          </span>
        )}
      </div>
      <p className="text-[10px] uppercase tracking-[0.2em] text-[#555] mb-1">{label}</p>
      <p className="text-2xl font-serif font-light text-white">
        <AnimatedCounter value={value} prefix={prefix} suffix={suffix} />
      </p>
    </motion.div>
  );
};

function AnimatedCounter({ value, prefix = '', suffix = '', duration = 1.5 }: {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const started = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el || started.current) return;
    const obs = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        started.current = true;
        const start = performance.now();
        const animate = (now: number) => {
          const elapsed = now - start;
          const progress = Math.min(elapsed / (duration * 1000), 1);
          const eased = 1 - Math.pow(1 - progress, 3);
          setCount(Math.round(eased * value));
          if (progress < 1) requestAnimationFrame(animate);
        };
        requestAnimationFrame(animate);
        obs.disconnect();
      }
    }, { threshold: 0.3 });
    obs.observe(el);
    return () => obs.disconnect();
  }, [value, duration]);

  const formatted = value >= 1000
    ? `${prefix}${(count / 1000).toFixed(count === value ? 1 : 0)}k${suffix}`
    : `${prefix}${count.toLocaleString()}${suffix}`;

  return <span ref={ref}>{formatted}</span>;
}

function BarChart({ data, title, color = '#D4A843' }: {
  data: { name: string; value: number; color: string; label?: string }[];
  title: string;
  color?: string;
}) {
  const max = Math.max(...data.map(d => d.value));
  const chartH = 200;
  const barWidth = 40;
  const spacing = 20;

  return (
    <div className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5">
      <h3 className="text-sm font-medium text-white mb-4">{title}</h3>
      <div className="flex items-end justify-between" style={{ height: chartH }}>
        {data.map((item, index) => (
          <motion.div
            key={index}
            initial={{ height: 0 }}
            animate={{ height: (item.value / max) * chartH }}
            transition={{ duration: 0.8, delay: index * 0.1 }}
            className="flex flex-col items-center gap-2"
            style={{ width: barWidth }}
          >
            <div
              className="w-full rounded-t-lg transition-all duration-300 hover:opacity-80"
              style={{ height: `${(item.value / max) * chartH}%`, backgroundColor: item.color }}
            />
            <span className="text-[11px] text-[#555]">{item.label}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

// ─── Page ────────────────────────────────────────────────────────────────

export default function SalesLandingPage() {
  const { token } = useAuth();
  const [stats, setStats] = useState<SalesStats>({ revenue: 0, orders: 0, customers: 0, averageOrderValue: 0 });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [pipelineStages, setPipelineStages] = useState<PipelineStage[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const api = useCallback(() => axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api',
    headers: { Authorization: `Bearer ${token}` },
  }), [token]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [statsRes, ordersRes, pipelineRes] = await Promise.all([
          api().get('/sales/stats'),
          api().get('/sales/recent-orders'),
          api().get('/sales/pipeline'),
        ]);
        setStats(statsRes.data);
        setRecentOrders(ordersRes.data);
        setPipelineStages(pipelineRes.data);
      } catch {}
      finally {
        setIsLoading(false);
      }
    };

    if (token) fetchData();
  }, [token]);

  return (
    <div className="p-8 md:p-10 lg:p-12 min-h-screen">
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-10">
        <h1 className="text-3xl font-serif font-light text-white mb-1">Sales</h1>
        <p className="text-[13px] text-[#666] font-light">Manage quotations, invoices, and revenue</p>
      </motion.div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <div className="w-6 h-6 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
        </div>
      ) : (
        <>
          <motion.div
            initial="hidden"
            animate="visible"
            variants={{ visible: { transition: { staggerChildren: 0.08 } } }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8"
          >
            <KpiCard icon={DollarSign} label="Revenue" value={stats.revenue} prefix="$" trend="up" trendLabel="12.4%" color="#D4A843" />
            <KpiCard icon={FileText} label="Quotations" value={stats.orders} trend="up" trendLabel="5.2%" color="#60A5FA" />
            <KpiCard icon={Users} label="Customers" value={stats.customers} trend="up" trendLabel="3.1%" color="#34D399" />
            <KpiCard icon={TrendingUp} label="Avg Order Value" value={stats.averageOrderValue} prefix="$" trend="up" trendLabel="2.3%" color="#A78BFA" />
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {recentOrders.length > 0 && (
              <motion.div
                initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="bg-[#141414] border border-[#1F1F1F] rounded-2xl p-5"
              >
                <h3 className="text-sm font-medium text-white mb-4">Recent Orders</h3>
                <div className="space-y-3">
                  {recentOrders.map((order, i) => (
                    <motion.div
                      key={order.id}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + i * 0.05 }}
                      className="flex items-center justify-between py-2 border-b border-[#1F1F1F] last:border-0"
                    >
                      <div>
                        <p className="text-sm text-white font-light">{order.customer}</p>
                        <p className="text-[11px] text-[#555]">{order.date}</p>
                      </div>
                      <p className={`text-sm font-medium ${order.amount >= 100 ? 'text-emerald-400' : 'text-[#888]'}`}>
                      ${order.amount.toLocaleString()}</p>
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            )}

            {pipelineStages.length > 0 && (
              <BarChart title="Sales Pipeline" data={pipelineStages} />
            )}
          </div>
        </>
      )}
    </div>
  );
}