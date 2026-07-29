'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { useAuth } from '@/providers/AuthProvider';
import axios from 'axios';
import {
  User, Mail, Phone, MapPin, Building2, Globe,
  AlertCircle, ChevronLeft, Edit3, FileText, FolderKanban, Clock,
} from 'lucide-react';

interface Contact {
  id: number;
  name: string;
  email?: string;
  phone?: string;
  mobile?: string;
  street?: string;
  city?: string;
  zip?: string;
  country_id?: [number, string];
  company_id?: [number, string];
  website?: string;
  comment?: string;
  create_date?: string;
}

export default function ContactDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { token } = useAuth();
  const [contact, setContact] = useState<Contact | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api';

  useEffect(() => {
    if (!token || !id) return;
    const api = axios.create({ baseURL: API_URL, headers: { Authorization: `Bearer ${token}` } });
    api.get(`/odoo/contacts/${id}`)
      .then((res) => { setContact(Array.isArray(res.data) ? res.data[0] : res.data); setLoading(false); })
      .catch(() => { setError('Failed to load contact.'); setLoading(false); });
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

  if (!contact) return null;

  const initials = contact.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2);

  return (
    <div className="p-8 md:p-12 min-h-screen">
      <button onClick={() => router.back()} className="flex items-center gap-2 text-[#666] hover:text-white mb-8 transition-colors">
        <ChevronLeft size={16} /> <span className="text-sm">Back to Contacts</span>
      </button>

      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        {/* Header */}
        <div className="flex items-start gap-6 mb-8">
          <div className="w-20 h-20 rounded-2xl bg-[#1F1F1F] flex items-center justify-center text-2xl text-[#888] font-light shrink-0">
            {initials}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-serif font-light text-white mb-1">{contact.name}</h1>
            <div className="flex items-center gap-3 text-sm text-[#666]">
              {contact.company_id && <><Building2 size={13} />{contact.company_id[1]}</>}
              {contact.create_date && <><Clock size={13} /> Since {new Date(contact.create_date).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</>}
            </div>
          </div>
          <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="px-4 py-2 bg-white/5 border border-[#1F1F1F] text-white rounded-lg text-sm flex items-center gap-2">
            <Edit3 size={14} /> Edit
          </motion.button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Contact Details */}
          <div className="p-6 bg-[#141414] border border-[#1F1F1F] rounded-xl">
            <h3 className="text-sm font-serif text-white mb-4">Contact Info</h3>
            <div className="space-y-4">
              {contact.email && <InfoRow icon={Mail} label="Email" value={contact.email} />}
              {contact.phone && <InfoRow icon={Phone} label="Phone" value={contact.phone} />}
              {contact.mobile && <InfoRow icon={Phone} label="Mobile" value={contact.mobile} />}
              {contact.website && <InfoRow icon={Globe} label="Website" value={contact.website} />}
            </div>
          </div>

          {/* Address */}
          <div className="p-6 bg-[#141414] border border-[#1F1F1F] rounded-xl">
            <h3 className="text-sm font-serif text-white mb-4">Address</h3>
            {(contact.street || contact.city) ? (
              <div className="space-y-1">
                <InfoRow icon={MapPin} label="" value={[contact.street, contact.city, contact.zip, contact.country_id?.[1]].filter(Boolean).join(', ')} />
              </div>
            ) : (
              <p className="text-sm text-[#555] italic">No address on file</p>
            )}
          </div>

          {/* Related */}
          <div className="p-6 bg-[#141414] border border-[#1F1F1F] rounded-xl">
            <h3 className="text-sm font-serif text-white mb-4">Related</h3>
            <div className="space-y-3">
              <QuickLink icon={FolderKanban} label="Projects" count="—" />
              <QuickLink icon={FileText} label="Invoices" count="—" />
            </div>
          </div>
        </div>

        {contact.comment && (
          <div className="mt-6 p-6 bg-[#141414] border border-[#1F1F1F] rounded-xl">
            <h3 className="text-sm font-serif text-white mb-3">Notes</h3>
            <p className="text-sm text-[#888] font-light whitespace-pre-wrap">{contact.comment}</p>
          </div>
        )}
      </motion.div>
    </div>
  );
}

function InfoRow({ icon: Icon, label, value }: { icon: React.ElementType; label: string; value: string }) {
  return (
    <div className="flex items-start gap-3">
      <Icon size={15} className="text-[#555] mt-0.5 shrink-0" />
      <div className="min-w-0">
        {label && <p className="text-[10px] uppercase tracking-wider text-[#666]">{label}</p>}
        <p className="text-sm text-white font-light truncate">{value}</p>
      </div>
    </div>
  );
}

function QuickLink({ icon: Icon, label, count }: { icon: React.ElementType; label: string; count: string }) {
  return (
    <div className="flex items-center justify-between py-2 px-3 rounded-lg hover:bg-white/[0.02] transition-colors cursor-pointer">
      <div className="flex items-center gap-2">
        <Icon size={14} className="text-[#555]" />
        <span className="text-sm text-[#888] font-light">{label}</span>
      </div>
      <span className="text-xs text-[#555]">{count}</span>
    </div>
  );
}
