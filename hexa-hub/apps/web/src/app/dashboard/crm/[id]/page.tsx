'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import {
  Users, DollarSign, Calendar, Mail, Phone, MapPin,
  Target, TrendingUp, AlertCircle, ChevronLeft, Clock, User, Edit3, Trash2,
} from 'lucide-react';

interface Lead {
  id: number;
  name: string;
  contact_name?: string;
  email_from?: string;
  phone?: string;
  description?: string;
  partner_id?: [number, string];
  stage_id?: [number, string];
  user_id?: [number, string];
  expected_revenue?: number;
  probability?: number;
  x_hexa_source?: string;
  x_hexa_service?: string;
  x_hexa_budget?: string;
  create_date?: string;
}

export default function CrmDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [lead, setLead] = useState<Lead | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!token || !id) return;
    const api = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });
    api.get(`/odoo/crm/leads/${id}`)
      .then((res) => { setLead(Array.isArray(res.data) ? res.data[0] : res.data); setLoading(false); })
      .catch(() => { setError('Failed to load lead details.'); setLoading(false); });
  }, [token, id, API_URL]);

  if (loading) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-[#D4A843]/30 border-t-[#D4A843] rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-background flex items-center justify-center">
      <div className="text-center"><AlertCircle size={32} className="mx-auto text-red-400 mb-3" /><p className="text-red-400">{error}</p></div>
    </div>
  );

  if (!lead) return null;

  const probability = lead.probability || 0;
  const progressColor = probability >= 70 ? 'bg-emerald-500' : probability >= 40 ? 'bg-[#D4A843]' : 'bg-blue-500';

  return (
    <div className="p-8 md:p-12 min-h-screen">
      {/* Back button */}
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#666] hover:text-white mb-8 transition-colors">
        <ChevronLeft size={16} /> <span className="text-sm">Back to Pipeline</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <div className="flex items-start justify-between mb-8">
          <div>
            <h1 className="text-3xl font-serif font-light text-white mb-2">{lead.name}</h1>
            <div className="flex items-center gap-3 text-sm text-[#666]">
              <span className="flex items-center gap-1"><Target size={13} /> {lead.stage_id?.[1] || 'Unknown'}</span>
              <span>·</span>
              <span>{new Date(lead.create_date || '').toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex gap-2">
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-white/5 border border-[#1F1F1F] text-white rounded-lg text-sm flex items-center gap-2">
              <Edit3 size={14} /> Edit
            </motion.button>
            <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm flex items-center gap-2">
              <Trash2 size={14} /> Delete
            </motion.button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main info */}
          <div className="lg:col-span-2 space-y-6">
            <div className="p-6 bg-[#141414] border border-[#1F1F1F] rounded-xl">
              <h3 className="text-sm font-serif text-white mb-4">Details</h3>
              <div className="grid grid-cols-2 gap-4">
                {lead.contact_name && <DetailField icon={User} label="Contact" value={lead.contact_name} />}
                {lead.email_from && <DetailField icon={Mail} label="Email" value={lead.email_from} />}
                {lead.phone && <DetailField icon={Phone} label="Phone" value={lead.phone} />}
                {lead.x_hexa_source && <DetailField icon={MapPin} label="Source" value={lead.x_hexa_source} />}
                {lead.x_hexa_service && <DetailField icon={Target} label="Service" value={lead.x_hexa_service} />}
                {lead.x_hexa_budget && <DetailField icon={DollarSign} label="Budget" value={lead.x_hexa_budget} />}
                {lead.user_id && <DetailField icon={Users} label="Assigned To" value={lead.user_id[1] || ''} />}
              </div>
              {lead.description && (
                <div className="mt-4 pt-4 border-t border-[#1F1F1F]">
                  <p className="text-sm text-[#888] font-light whitespace-pre-wrap">{lead.description}</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            <div className="p-6 bg-[#141414] border border-[#1F1F1F] rounded-xl">
              <h3 className="text-sm font-serif text-white mb-4">Probability</h3>
              <div className="text-4xl font-serif font-light text-white mb-3">{probability}%</div>
              <div className="w-full h-2 bg-[#1F1F1F] rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${probability}%` }} transition={{ duration: 1, ease: 'easeOut' }} className={`h-full rounded-full ${progressColor}`} />
              </div>
            </div>

            <div className="p-6 bg-[#141414] border border-[#1F1F1F] rounded-xl">
              <h3 className="text-sm font-serif text-white mb-4">Revenue</h3>
              <div className="text-2xl font-serif font-light text-emerald-400">
                {lead.expected_revenue ? `€${(lead.expected_revenue).toLocaleString()}` : '—'}
              </div>
              <p className="text-xs text-[#666] mt-1">Expected Revenue</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function DetailField({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <div className="w-8 h-8 rounded-lg bg-[#1F1F1F]/50 flex items-center justify-center shrink-0 mt-0.5">
        <Icon size={14} className="text-[#555]" />
      </div>
      <div>
        <p className="text-[10px] uppercase tracking-wider text-[#666]">{label}</p>
        <p className="text-sm text-white font-light">{value}</p>
      </div>
    </div>
  );
}
