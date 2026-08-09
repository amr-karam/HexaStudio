'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odooApi, odooSyncApi } from '@/features/odoo/api';
import { useAuth } from '@/features/auth';
import type { OdooLead, OdooPipelineSummary, OdooKnowledgeArticle, SyncConflict } from '@hexastudio/types';
import { toast } from 'sonner';

type Tab = 'pipeline' | 'leads' | 'contacts' | 'projects' | 'documents' | 'sales' | 'invoices' | 'company' | 'sales-teams' | 'departments' | 'accounting' | 'knowledge' | 'email' | 'sync';

function StatCard({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5">
      <p className="text-xs uppercase tracking-wide text-white/40">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-white">{value}</p>
      {sub && <p className="mt-1 text-xs text-white/40">{sub}</p>}
    </div>
  );
}

function PipelineView({ data }: { data: OdooPipelineSummary }) {
  const max = Math.max(1, ...data.stages.map((s) => s.leadCount));
  return (
    <div className="space-y-3">
      {data.stages.map((stage) => (
        <div key={stage.id} className="flex items-center gap-4">
          <div className="w-40 shrink-0 truncate text-sm text-white/60">{stage.name}</div>
          <div className="h-3 flex-1 overflow-hidden rounded-full bg-white/5">
            <div className="h-full rounded-full bg-accent" style={{ width: `${(stage.leadCount / max) * 100}%` }} />
          </div>
          <div className="w-28 shrink-0 text-right text-sm text-white/50">
            {stage.leadCount} lead{stage.leadCount === 1 ? '' : 's'}
          </div>
          <div className="w-28 shrink-0 text-right text-sm text-white/40">
            ${Math.round(stage.expectedRevenue).toLocaleString()}
          </div>
        </div>
      ))}
    </div>
  );
}

function idName(v: [number, string] | false | undefined): string {
  if (!v) return '—';
  return Array.isArray(v) ? (v as [number, string])[1] : String(v);
}

// --- Lead Form Modal ---
function LeadFormModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: OdooLead }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({
    name: initial?.name ?? '',
    email_from: initial?.email_from ?? '',
    partner_name: initial?.partner_name ?? '',
    phone: '',
    x_hexa_service: '',
    x_hexa_budget: '',
    description: '',
  });

  const mutation = useMutation({
    mutationFn: async () => {
      if (initial?.id) {
        await odooApi.updateLead(initial.id, form);
      } else {
        await odooApi.createLead(form);
      }
    },
    onSuccess: () => {
      toast.success(initial?.id ? 'Lead updated' : 'Lead created');
      queryClient.invalidateQueries({ queryKey: ['odoo-leads'] });
      queryClient.invalidateQueries({ queryKey: ['odoo-pipeline'] });
      onClose();
    },
    onError: () => toast.error('Failed to save lead'),
  });

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 p-8 shadow-2xl">
        <h2 className="mb-6 text-xl font-semibold text-white">{initial?.id ? 'Edit Lead' : 'New Lead'}</h2>
        <div className="space-y-4">
          <input placeholder="Lead name *" aria-label="Lead name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
          <input placeholder="Email" aria-label="Email" value={form.email_from} onChange={(e) => setForm({ ...form, email_from: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
          <input placeholder="Company" aria-label="Company" value={form.partner_name} onChange={(e) => setForm({ ...form, partner_name: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
          <input placeholder="Phone" aria-label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
          <select aria-label="Service type" value={form.x_hexa_service} onChange={(e) => setForm({ ...form, x_hexa_service: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50">
            <option value="">Service type...</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="interior">Interior</option>
          </select>
          <select aria-label="Budget range" value={form.x_hexa_budget} onChange={(e) => setForm({ ...form, x_hexa_budget: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50">
            <option value="">Budget range...</option>
            <option value="under_50k">Under $50K</option>
            <option value="50k_100k">$50K - $100K</option>
            <option value="100k_500k">$100K - $500K</option>
            <option value="500k_plus">$500K+</option>
          </select>
          <textarea placeholder="Description" aria-label="Description" value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" rows={3} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-black hover:bg-accent-dark disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Contact Form Modal ---
function ContactFormModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', phone: '' });

  const mutation = useMutation({
    mutationFn: () => odooApi.createContact(form),
    onSuccess: () => {
      toast.success('Contact created');
      queryClient.invalidateQueries({ queryKey: ['odoo-contacts'] });
      onClose();
    },
    onError: () => toast.error('Failed to create contact'),
  });

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-2xl border border-white/10 bg-neutral-900 p-8 shadow-2xl">
        <h2 className="mb-6 text-xl font-semibold text-white">New Contact</h2>
        <div className="space-y-4">
          <input placeholder="Name *" aria-label="Name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
          <input placeholder="Email" type="email" aria-label="Email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
          <input placeholder="Phone" aria-label="Phone" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-black hover:bg-accent-dark disabled:opacity-50">
            {mutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Knowledge Article Form Modal ---
function KnowledgeFormModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: OdooKnowledgeArticle | null }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: initial?.name ?? '', body: initial?.body ?? '', category_id: '' });

  const mutation = useMutation({
    mutationFn: async () => {
      const payload: { name: string; body?: string; category_id?: number } = {
        name: form.name,
        ...(form.body ? { body: form.body } : {}),
        ...(form.category_id ? { category_id: parseInt(form.category_id, 10) } : {}),
      };
      if (initial?.id) {
        await odooApi.updateKnowledgeArticle(initial.id, payload);
      } else {
        await odooApi.createKnowledgeArticle(payload);
      }
    },
    onSuccess: () => {
      toast.success(initial?.id ? 'Article updated' : 'Article created');
      queryClient.invalidateQueries({ queryKey: ['odoo-knowledge'] });
      onClose();
    },
    onError: () => toast.error('Failed to save article'),
  });

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 p-8 shadow-2xl">
        <h2 className="mb-6 text-xl font-semibold text-white">{initial?.id ? 'Edit Article' : 'New Article'}</h2>
        <div className="space-y-4">
          <input placeholder="Article name *" aria-label="Article name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
          <input placeholder="Category ID (optional)" aria-label="Category ID" value={form.category_id} onChange={(e) => setForm({ ...form, category_id: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
          <textarea placeholder="Body" aria-label="Article body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" rows={6} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-black hover:bg-accent-dark disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Email Send Modal ---
function EmailSendModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ to: '', subject: '', body: '' });

  const mutation = useMutation({
    mutationFn: () => odooApi.sendEmail(form),
    onSuccess: () => {
      toast.success('Email sent');
      queryClient.invalidateQueries({ queryKey: ['odoo-emails'] });
      onClose();
    },
    onError: () => toast.error('Failed to send email'),
  });

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 p-8 shadow-2xl">
        <h2 className="mb-6 text-xl font-semibold text-white">Send Email</h2>
        <div className="space-y-4">
          <input placeholder="To (email) *" type="email" aria-label="Recipient email" value={form.to} onChange={(e) => setForm({ ...form, to: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
          <input placeholder="Subject *" aria-label="Subject" value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
          <textarea placeholder="Body" aria-label="Email body" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" rows={6} />
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.to || !form.subject} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-black hover:bg-accent-dark disabled:opacity-50">
            {mutation.isPending ? 'Sending...' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function OdooDashboardPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [tab, setTab] = useState<Tab>('pipeline');
  const [syncing, setSyncing] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  // New feature state
  const [knowledgeModalOpen, setKnowledgeModalOpen] = useState(false);
  const [editingArticle, setEditingArticle] = useState<OdooKnowledgeArticle | null>(null);
  const [emailModalOpen, setEmailModalOpen] = useState(false);
  const [emailFilter, setEmailFilter] = useState<'all' | 'inbox' | 'sent'>('all');
  const [accountingTab, setAccountingTab] = useState<'journal' | 'payments' | 'banks'>('journal');
  const [resolveStrategies, setResolveStrategies] = useState<Record<string, 'odoo-wins' | 'hexa-wins'>>({});

  const pipeline = useQuery({ queryKey: ['odoo-pipeline'], queryFn: odooApi.getPipeline });
  const syncStatus = useQuery({ queryKey: ['odoo-sync-status'], queryFn: odooSyncApi.getStatus, refetchInterval: 30000 });
  const leads = useQuery({ queryKey: ['odoo-leads'], queryFn: () => odooApi.getLeads(20) });
  const contacts = useQuery({ queryKey: ['odoo-contacts', contactSearch], queryFn: () => odooApi.getContacts(20, 0, contactSearch || undefined) });
  const projects = useQuery({ queryKey: ['odoo-projects'], queryFn: () => odooApi.getProjects(20) });
  const sales = useQuery({ queryKey: ['odoo-sales'], queryFn: () => odooApi.getSalesOrders(10) });
  const invoices = useQuery({ queryKey: ['odoo-invoices'], queryFn: () => odooApi.getInvoices(10) });
  const documents = useQuery({
    queryKey: ['odoo-documents', selectedProjectId],
    queryFn: () => odooApi.getProjectDocuments(selectedProjectId!),
    enabled: !!selectedProjectId,
  });
  const company = useQuery({ queryKey: ['odoo-company'], queryFn: () => odooApi.getCompanySettings() });

  // Sales teams, departments, accounting, knowledge, email (tab-scoped)
  const salesTeams = useQuery({ queryKey: ['odoo-sales-teams'], queryFn: () => odooApi.getSalesTeams(), enabled: tab === 'sales-teams' });
  const departments = useQuery({ queryKey: ['odoo-departments'], queryFn: odooApi.getDepartments, enabled: tab === 'departments' });
  const journalEntries = useQuery({ queryKey: ['odoo-journal-entries'], queryFn: () => odooApi.getJournalEntries(undefined, undefined, 20), enabled: tab === 'accounting' });
  const payments = useQuery({ queryKey: ['odoo-payments'], queryFn: () => odooApi.getPayments(undefined, undefined, 20), enabled: tab === 'accounting' });
  const banks = useQuery({ queryKey: ['odoo-banks'], queryFn: () => odooApi.getBanks(20), enabled: tab === 'accounting' });
  const knowledge = useQuery({ queryKey: ['odoo-knowledge'], queryFn: () => odooApi.getKnowledgeArticles(50), enabled: tab === 'knowledge' });
  const emails = useQuery({ queryKey: ['odoo-emails', emailFilter], queryFn: () => odooApi.getEmails(emailFilter, 20), enabled: tab === 'email' });

  // Sync engine (tab-scoped)
  const syncMetrics = useQuery({ queryKey: ['odoo-sync-metrics'], queryFn: () => odooSyncApi.getMetrics(20), enabled: tab === 'sync' });
  const syncConflicts = useQuery({ queryKey: ['odoo-sync-conflicts'], queryFn: odooSyncApi.getConflicts, enabled: tab === 'sync' });
  const syncCursors = useQuery({ queryKey: ['odoo-sync-cursors'], queryFn: odooSyncApi.getCursors, enabled: tab === 'sync' });

  const runSync = async (full: boolean) => {
    setSyncing(true);
    try {
      await odooSyncApi.triggerSync({ fullSync: full });
      toast.success(full ? 'Full Odoo sync triggered' : 'Odoo sync triggered');
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['odoo-sync-status'] }),
        queryClient.invalidateQueries({ queryKey: ['odoo-sync-metrics'] }),
        queryClient.invalidateQueries({ queryKey: ['odoo-sync-conflicts'] }),
        queryClient.invalidateQueries({ queryKey: ['odoo-sync-cursors'] }),
      ]);
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
    }
  };

  const resolveConflictMutation = useMutation({
    mutationFn: ({ id, strategy }: { id: string; strategy: 'odoo-wins' | 'hexa-wins' }) =>
      odooSyncApi.resolveConflict(id, { strategy, resolvedBy: user?.email ?? 'admin' }),
    onSuccess: () => {
      toast.success('Conflict resolved');
      queryClient.invalidateQueries({ queryKey: ['odoo-sync-conflicts'] });
      queryClient.invalidateQueries({ queryKey: ['odoo-sync-status'] });
    },
    onError: () => toast.error('Failed to resolve conflict'),
  });

  const handleResetCursor = async (entityType: string) => {
    if (!confirm(`Reset cursor for ${entityType}? The next sync will be a full sync.`)) return;
    try {
      await odooSyncApi.resetCursor(entityType);
      toast.success('Cursor reset');
      queryClient.invalidateQueries({ queryKey: ['odoo-sync-cursors'] });
    } catch {
      toast.error('Failed to reset cursor');
    }
  };

  const handleArchiveLead = async (id: number) => {
    if (!confirm('Archive this lead?')) return;
    await odooApi.archiveLead(id);
    toast.success('Lead archived');
    queryClient.invalidateQueries({ queryKey: ['odoo-leads'] });
    queryClient.invalidateQueries({ queryKey: ['odoo-pipeline'] });
  };

  const handleUpdateProjectStatus = async (id: number, status: string) => {
    await odooApi.updateProject(id, { x_hexa_status: status });
    toast.success('Project status updated');
    queryClient.invalidateQueries({ queryKey: ['odoo-projects'] });
  };

  const handleArchiveArticle = async (id: number) => {
    if (!confirm('Archive this article?')) return;
    try {
      await odooApi.archiveKnowledgeArticle(id);
      toast.success('Article archived');
      queryClient.invalidateQueries({ queryKey: ['odoo-knowledge'] });
    } catch {
      toast.error('Failed to archive article');
    }
  };

  const totalRevenue = pipeline.data ? Math.round(pipeline.data.totalExpectedRevenue).toLocaleString() : '0';

  const TABS: { key: Tab; label: string }[] = [
    { key: 'pipeline', label: 'Pipeline' },
    { key: 'leads', label: 'Leads' },
    { key: 'contacts', label: 'Contacts' },
    { key: 'projects', label: 'Projects' },
    { key: 'documents', label: 'Documents' },
    { key: 'sales', label: 'Sales' },
    { key: 'invoices', label: 'Invoices' },
    { key: 'company', label: 'Company' },
    { key: 'sales-teams', label: 'Sales Teams' },
    { key: 'departments', label: 'Departments' },
    { key: 'accounting', label: 'Accounting' },
    { key: 'knowledge', label: 'Knowledge' },
    { key: 'email', label: 'Email' },
    { key: 'sync', label: 'Sync' },
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Odoo ERP</h1>
          <p className="mt-1 text-sm text-white/40">Live business operations — CRM, sales, projects, and invoicing.</p>
        </div>
        <button onClick={() => runSync(false)} disabled={syncing} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-accent-dark disabled:opacity-50">
          {syncing ? 'Syncing...' : 'Trigger Sync'}
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Pipeline Value" value={`$${totalRevenue}`} />
        <StatCard label="Leads" value={String(pipeline.data?.totalLeads ?? 0)} />
        <StatCard label="Last Sync" value={syncStatus.data?.lastFullSyncAt ? new Date(syncStatus.data.lastFullSyncAt).toLocaleTimeString() : '—'} />
        <StatCard label="Status" value={syncStatus.data?.state ?? 'Unknown'} sub={`Circuit: ${syncStatus.data?.circuitBreaker ?? '—'} · Conflicts: ${syncStatus.data?.pendingConflicts ?? 0}`} />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] p-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'bg-accent text-black' : 'text-white/50 hover:text-white/80'}`}>
            {t.label}
          </button>
        ))}
      </div>

      {/* Pipeline Tab */}
      {tab === 'pipeline' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">CRM Pipeline</h2>
          {pipeline.isLoading && <p className="text-sm text-white/40">Loading...</p>}
          {pipeline.data && <PipelineView data={pipeline.data} />}
        </section>
      )}

      {/* Leads Tab */}
      {tab === 'leads' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">CRM Leads</h2>
            <button onClick={() => setLeadModalOpen(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-dark">+ New Lead</button>
          </div>
          {leads.isLoading && <p className="text-sm text-white/40">Loading...</p>}
          {leads.data && leads.data.length === 0 && <p className="text-sm text-white/30">No leads in Odoo.</p>}
          {leads.data && leads.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/40">
                  <tr><th className="pb-2 font-normal">Name</th><th className="pb-2 font-normal">Company</th><th className="pb-2 font-normal">Stage</th><th className="pb-2 font-normal">Created</th><th className="pb-2 font-normal">Actions</th></tr>
                </thead>
                <tbody className="text-white/70">
                  {leads.data.map((lead) => (
                    <tr key={lead.id} className="border-t border-white/5">
                      <td className="py-2">{lead.name}</td>
                      <td className="py-2 text-white/50">{lead.partner_name ?? '—'}</td>
                      <td className="py-2 text-white/50">{idName(lead.stage_id)}</td>
                      <td className="py-2 text-white/40">{lead.create_date?.slice(0, 10) ?? '—'}</td>
                      <td className="py-2"><button onClick={() => handleArchiveLead(lead.id)} className="text-xs text-red-400/70 hover:text-red-400">Archive</button></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <LeadFormModal open={leadModalOpen} onClose={() => setLeadModalOpen(false)} />
        </section>
      )}

      {/* Contacts Tab */}
      {tab === 'contacts' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between gap-4">
            <h2 className="text-lg font-medium text-white">Contacts</h2>
            <div className="flex gap-3">
              <input placeholder="Search..." aria-label="Search contacts" value={contactSearch} onChange={(e) => setContactSearch(e.target.value)} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
              <button onClick={() => setContactModalOpen(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-dark">+ New Contact</button>
            </div>
          </div>
          {contacts.isLoading && <p className="text-sm text-white/40">Loading...</p>}
          {contacts.data && contacts.data.length === 0 && <p className="text-sm text-white/30">No contacts found.</p>}
          {contacts.data && contacts.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/40">
                  <tr><th className="pb-2 font-normal">Name</th><th className="pb-2 font-normal">Email</th><th className="pb-2 font-normal">Phone</th><th className="pb-2 font-normal">Client</th></tr>
                </thead>
                <tbody className="text-white/70">
                  {contacts.data.map((c) => (
                    <tr key={c.id} className="border-t border-white/5">
                      <td className="py-2 font-medium text-white">{c.name}</td>
                      <td className="py-2 text-white/50">{c.email ?? '—'}</td>
                      <td className="py-2 text-white/50">{c.phone ?? '—'}</td>
                      <td className="py-2">{c.x_hexa_client ? <span className="rounded bg-accent/20 px-2 py-0.5 text-xs text-[#D4AF37]">Client</span> : <span className="text-white/30">—</span>}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          <ContactFormModal open={contactModalOpen} onClose={() => setContactModalOpen(false)} />
        </section>
      )}

      {/* Projects Tab */}
      {tab === 'projects' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Projects</h2>
          {projects.isLoading && <p className="text-sm text-white/40">Loading...</p>}
          {projects.data && projects.data.length === 0 && <p className="text-sm text-white/30">No projects in Odoo.</p>}
          {projects.data && projects.data.length > 0 && (
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {projects.data.map((p) => (
                <div key={p.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-4">
                  <p className="font-medium text-white">{p.name}</p>
                  <p className="mt-1 text-xs text-white/40">{p.x_hexa_type ?? '—'} · {p.x_hexa_status ?? idName(p.stage_id)}</p>
                  <div className="mt-3">
                    <select aria-label="Project status" value={p.x_hexa_status ?? ''} onChange={(e) => handleUpdateProjectStatus(p.id, e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-[#D4AF37]/50">
                      <option value="">Set status...</option>
                      <option value="inquiry">Inquiry</option>
                      <option value="consultation">Consultation</option>
                      <option value="proposal">Proposal</option>
                      <option value="active">Active</option>
                      <option value="on_hold">On Hold</option>
                      <option value="completed">Completed</option>
                      <option value="archived">Archived</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      {/* Documents Tab */}
      {tab === 'documents' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Project Documents</h2>
          {/* Project selector */}
          <div className="mb-4">
            <select
              aria-label="Select a project"
              value={selectedProjectId ?? ''}
              onChange={(e) => setSelectedProjectId(e.target.value ? parseInt(e.target.value, 10) : null)}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50"
            >
              <option value="">Select a project...</option>
              {projects.data?.map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
          </div>

          {selectedProjectId && (
            <>
              {/* Upload button */}
              <div className="mb-4">
                <label className="cursor-pointer rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-dark">
                  Upload File
                  <input
                    type="file"
                    className="hidden"
                    onChange={async (e) => {
                      const file = e.target.files?.[0];
                      if (!file || !selectedProjectId) return;
                      try {
                        await odooApi.uploadDocument(selectedProjectId, file);
                        toast.success('Document uploaded');
                        documents.refetch();
                      } catch {
                        toast.error('Upload failed');
                      }
                      e.target.value = '';
                    }}
                  />
                </label>
              </div>

              {documents.isLoading && <p className="text-sm text-white/40">Loading documents...</p>}
              {documents.data && documents.data.length === 0 && <p className="text-sm text-white/30">No documents for this project.</p>}
              {documents.data && documents.data.length > 0 && (
                <div className="space-y-2">
                  {documents.data.map((doc) => (
                    <div key={doc.id} className="flex items-center justify-between rounded-lg border border-white/5 bg-white/[0.02] p-3">
                      <div className="flex flex-col">
                        <span className="text-sm text-white">{doc.name}</span>
                        <span className="text-[10px] text-white/30 font-mono">
                          {doc.mimeType} · {(doc.fileSize / 1024).toFixed(1)} KB
                        </span>
                      </div>
                      <button
                        onClick={async () => {
                          try {
                            const { url } = await odooApi.getDocumentDownloadUrl(doc.id);
                            window.open(url, '_blank');
                          } catch {
                            toast.error('Failed to get download URL');
                          }
                        }}
                        className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5"
                      >
                        Download
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
          {!selectedProjectId && <p className="text-sm text-white/30">Select a project to view and upload documents.</p>}
        </section>
      )}

      {/* Sales Tab */}
      {tab === 'sales' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Sales Orders</h2>
          {sales.isLoading && <p className="text-sm text-white/40">Loading...</p>}
          {sales.data && sales.data.length === 0 && <p className="text-sm text-white/30">No sales orders.</p>}
          {sales.data && sales.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/40"><tr><th className="pb-2 font-normal">Order</th><th className="pb-2 font-normal">Customer</th><th className="pb-2 font-normal">Total</th><th className="pb-2 font-normal">State</th></tr></thead>
                <tbody className="text-white/70">
                  {sales.data.map((o) => (
                    <tr key={o.id} className="border-t border-white/5">
                      <td className="py-2">{o.name}</td>
                      <td className="py-2 text-white/50">{idName(o.partner_id)}</td>
                      <td className="py-2 text-white/50">${Math.round(o.amount_total).toLocaleString()}</td>
                      <td className="py-2 text-white/40">{o.state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Invoices Tab */}
      {tab === 'invoices' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Invoices</h2>
          {invoices.isLoading && <p className="text-sm text-white/40">Loading...</p>}
          {invoices.data && invoices.data.length === 0 && <p className="text-sm text-white/30">No invoices.</p>}
          {invoices.data && invoices.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/40"><tr><th className="pb-2 font-normal">Invoice</th><th className="pb-2 font-normal">Date</th><th className="pb-2 font-normal">Total</th><th className="pb-2 font-normal">Payment</th></tr></thead>
                <tbody className="text-white/70">
                  {invoices.data.map((inv) => (
                    <tr key={inv.id} className="border-t border-white/5">
                      <td className="py-2">{inv.name}</td>
                      <td className="py-2 text-white/50">{inv.invoice_date?.slice(0, 10) ?? '—'}</td>
                      <td className="py-2 text-white/50">${Math.round(inv.amount_total ?? 0).toLocaleString()}</td>
                      <td className="py-2 text-white/40">{inv.payment_state}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Company Settings Tab */}
      {tab === 'company' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Company Settings</h2>
          {company.isLoading && <p className="text-sm text-white/40">Loading...</p>}
          {company.data && (
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wide text-white/40">Name</p>
                <p className="mt-1 text-sm text-white">{company.data.name}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wide text-white/40">Address</p>
                <p className="mt-1 text-sm text-white">
                  {[company.data.street, company.data.street2, company.data.city, company.data.state_id ? idName(company.data.state_id) : undefined, company.data.zip, company.data.country_id ? idName(company.data.country_id) : undefined]
                    .filter(Boolean)
                    .join(', ') || '—'}
                </p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wide text-white/40">Phone</p>
                <p className="mt-1 text-sm text-white">{company.data.phone || '—'}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wide text-white/40">Email</p>
                <p className="mt-1 text-sm text-white">{company.data.email || '—'}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wide text-white/40">Website</p>
                <p className="mt-1 text-sm text-white">{company.data.website || '—'}</p>
              </div>
              <div className="rounded-xl border border-white/5 bg-white/[0.03] p-4">
                <p className="text-xs uppercase tracking-wide text-white/40">Currency</p>
                <p className="mt-1 text-sm text-white">{Array.isArray(company.data.currency_id) ? company.data.currency_id[1] : '—'}</p>
              </div>
            </div>
          )}
        </section>
      )}

      {/* Sales Teams Tab */}
      {tab === 'sales-teams' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Sales Teams</h2>
          {salesTeams.isLoading && <p className="text-sm text-white/40">Loading...</p>}
          {salesTeams.data && salesTeams.data.length === 0 && <p className="text-sm text-white/30">No sales teams in Odoo.</p>}
          {salesTeams.data && salesTeams.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/40">
                  <tr><th className="pb-2 font-normal">Team</th><th className="pb-2 font-normal">Members</th><th className="pb-2 font-normal">Leads</th><th className="pb-2 font-normal">Expected Revenue</th></tr>
                </thead>
                <tbody className="text-white/70">
                  {salesTeams.data.map((t) => (
                    <tr key={t.id} className="border-t border-white/5">
                      <td className="py-2 font-medium text-white">{t.name}</td>
                      <td className="py-2 text-white/50">{t.member_ids?.length ?? 0}</td>
                      <td className="py-2 text-white/50">{t.leadCount ?? 0}</td>
                      <td className="py-2 text-white/50">${Math.round(t.expectedRevenue ?? 0).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Departments Tab */}
      {tab === 'departments' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <h2 className="mb-4 text-lg font-medium text-white">Departments</h2>
          {departments.isLoading && <p className="text-sm text-white/40">Loading...</p>}
          {departments.data && departments.data.length === 0 && <p className="text-sm text-white/30">No departments in Odoo.</p>}
          {departments.data && departments.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/40">
                  <tr><th className="pb-2 font-normal">Name</th><th className="pb-2 font-normal">Full Path</th><th className="pb-2 font-normal">Manager</th><th className="pb-2 font-normal">Employees</th></tr>
                </thead>
                <tbody className="text-white/70">
                  {departments.data.map((d) => (
                    <tr key={d.id} className="border-t border-white/5">
                      <td className="py-2 font-medium text-white">{d.name}</td>
                      <td className="py-2 text-white/50">{d.complete_name ?? d.name}</td>
                      <td className="py-2 text-white/50">{idName(d.manager_id)}</td>
                      <td className="py-2 text-white/50">{d.employeeCount ?? 0}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {/* Accounting Tab */}
      {tab === 'accounting' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-white">Accounting</h2>
            <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
              {([
                { key: 'journal', label: 'Journal Entries' },
                { key: 'payments', label: 'Payments' },
                { key: 'banks', label: 'Banks' },
              ] as const).map((k) => (
                <button key={k.key} onClick={() => setAccountingTab(k.key)} className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${accountingTab === k.key ? 'bg-accent text-black' : 'text-white/50 hover:text-white/80'}`}>
                  {k.label}
                </button>
              ))}
            </div>
          </div>

          {accountingTab === 'journal' && (
            <>
              {journalEntries.isLoading && <p className="text-sm text-white/40">Loading journal entries...</p>}
              {journalEntries.data && journalEntries.data.length === 0 && <p className="text-sm text-white/30">No journal entries.</p>}
              {journalEntries.data && journalEntries.data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-white/40"><tr><th className="pb-2 font-normal">Entry</th><th className="pb-2 font-normal">Date</th><th className="pb-2 font-normal">Reference</th><th className="pb-2 font-normal">State</th><th className="pb-2 font-normal">Total</th></tr></thead>
                    <tbody className="text-white/70">
                      {journalEntries.data.map((e) => (
                        <tr key={e.id} className="border-t border-white/5">
                          <td className="py-2 font-medium text-white">{e.name}</td>
                          <td className="py-2 text-white/50">{e.date?.slice(0, 10) ?? '—'}</td>
                          <td className="py-2 text-white/50">{e.ref ?? '—'}</td>
                          <td className="py-2 text-white/40">{e.state}</td>
                          <td className="py-2 text-white/50">${Math.round(e.amount_total ?? 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {accountingTab === 'payments' && (
            <>
              {payments.isLoading && <p className="text-sm text-white/40">Loading payments...</p>}
              {payments.data && payments.data.length === 0 && <p className="text-sm text-white/30">No payments.</p>}
              {payments.data && payments.data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-white/40"><tr><th className="pb-2 font-normal">Payment</th><th className="pb-2 font-normal">Date</th><th className="pb-2 font-normal">Partner</th><th className="pb-2 font-normal">Amount</th><th className="pb-2 font-normal">State</th></tr></thead>
                    <tbody className="text-white/70">
                      {payments.data.map((p) => (
                        <tr key={p.id} className="border-t border-white/5">
                          <td className="py-2 font-medium text-white">{p.name}</td>
                          <td className="py-2 text-white/50">{p.date?.slice(0, 10) ?? '—'}</td>
                          <td className="py-2 text-white/50">{idName(p.partner_id)}</td>
                          <td className="py-2 text-white/50">${Math.round(p.amount ?? 0).toLocaleString()}</td>
                          <td className="py-2 text-white/40">{p.state}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}

          {accountingTab === 'banks' && (
            <>
              {banks.isLoading && <p className="text-sm text-white/40">Loading banks...</p>}
              {banks.data && banks.data.length === 0 && <p className="text-sm text-white/30">No bank accounts.</p>}
              {banks.data && banks.data.length > 0 && (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="text-white/40"><tr><th className="pb-2 font-normal">Bank</th><th className="pb-2 font-normal">Code</th><th className="pb-2 font-normal">Account</th><th className="pb-2 font-normal">Balance</th></tr></thead>
                    <tbody className="text-white/70">
                      {banks.data.map((b) => (
                        <tr key={b.id} className="border-t border-white/5">
                          <td className="py-2 font-medium text-white">{b.name}</td>
                          <td className="py-2 text-white/50">{b.code ?? '—'}</td>
                          <td className="py-2 text-white/50">{b.account_number ?? '—'}</td>
                          <td className="py-2 text-white/50">${Math.round(b.balance ?? 0).toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </section>
      )}

      {/* Knowledge Tab */}
      {tab === 'knowledge' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="text-lg font-medium text-white">Knowledge Base</h2>
            <button onClick={() => { setEditingArticle(null); setKnowledgeModalOpen(true); }} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-dark">+ New Article</button>
          </div>
          {knowledge.isLoading && <p className="text-sm text-white/40">Loading...</p>}
          {knowledge.data && knowledge.data.length === 0 && <p className="text-sm text-white/30">No articles in Odoo.</p>}
          {knowledge.data && knowledge.data.length > 0 && (
            <div className="space-y-2">
              {knowledge.data.map((a) => (
                <div key={a.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/5 bg-white/[0.02] p-3">
                  <div className="flex flex-col">
                    <span className="text-sm text-white">{a.name}</span>
                    <span className="font-mono text-[10px] text-white/30">#{a.id} · {a.create_date?.slice(0, 10) ?? '—'} · {idName(a.category_id)}</span>
                  </div>
                  <div className="flex shrink-0 gap-2">
                    <button onClick={() => { setEditingArticle(a); setKnowledgeModalOpen(true); }} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-white/60 hover:bg-white/5">Edit</button>
                    <button onClick={() => handleArchiveArticle(a.id)} className="rounded-lg border border-white/10 px-3 py-1.5 text-xs text-red-400/70 hover:bg-white/5">Archive</button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {knowledgeModalOpen && <KnowledgeFormModal open onClose={() => setKnowledgeModalOpen(false)} initial={editingArticle} />}
        </section>
      )}

      {/* Email Tab */}
      {tab === 'email' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-white">Emails</h2>
            <div className="flex gap-3">
              <select aria-label="Email filter" value={emailFilter} onChange={(e) => setEmailFilter(e.target.value as 'all' | 'inbox' | 'sent')} className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50">
                <option value="all">All</option>
                <option value="inbox">Inbox</option>
                <option value="sent">Sent</option>
              </select>
              <button onClick={() => setEmailModalOpen(true)} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-dark">+ Send Email</button>
            </div>
          </div>
          {emails.isLoading && <p className="text-sm text-white/40">Loading...</p>}
          {emails.data && emails.data.length === 0 && <p className="text-sm text-white/30">No emails.</p>}
          {emails.data && emails.data.length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/40"><tr><th className="pb-2 font-normal">Subject</th><th className="pb-2 font-normal">From</th><th className="pb-2 font-normal">Date</th></tr></thead>
                <tbody className="text-white/70">
                  {emails.data.map((m) => (
                    <tr key={m.id} className="border-t border-white/5">
                      <td className="py-2 font-medium text-white">{m.subject ?? '(no subject)'}</td>
                      <td className="py-2 text-white/50">{m.email_from ?? idName(m.author_id)}</td>
                      <td className="py-2 text-white/40">{m.date ? new Date(m.date).toLocaleString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {emailModalOpen && <EmailSendModal open onClose={() => setEmailModalOpen(false)} />}
        </section>
      )}

      {/* Sync Engine Tab */}
      {tab === 'sync' && (
        <section className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <h2 className="text-lg font-medium text-white">Sync Engine</h2>
            <div className="flex gap-3">
              <button onClick={() => runSync(false)} disabled={syncing} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black hover:bg-accent-dark disabled:opacity-50">
                {syncing ? 'Syncing...' : 'Run Delta Sync'}
              </button>
              <button onClick={() => runSync(true)} disabled={syncing} className="rounded-lg border border-[#D4AF37]/40 px-4 py-2 text-sm font-medium text-[#D4AF37] hover:bg-accent/10 disabled:opacity-50">
                {syncing ? 'Syncing...' : 'Run Full Sync'}
              </button>
            </div>
          </div>

          <div className="mb-6 grid grid-cols-2 gap-4 md:grid-cols-4">
            <StatCard label="State" value={syncStatus.data?.state ?? '—'} sub={syncStatus.data?.circuitBreaker ?? ''} />
            <StatCard label="Pending Conflicts" value={String(syncStatus.data?.pendingConflicts ?? 0)} />
            <StatCard label="Last Full Sync" value={syncStatus.data?.lastFullSyncAt ? new Date(syncStatus.data.lastFullSyncAt).toLocaleString() : '—'} />
            <StatCard label="Entities Tracked" value={String(syncStatus.data?.entities.length ?? 0)} />
          </div>

          <h3 className="mb-3 text-sm font-medium text-white/70">Entity Metrics</h3>
          {syncStatus.data && syncStatus.data.entities.length === 0 && <p className="mb-4 text-sm text-white/30">No sync activity yet.</p>}
          {syncStatus.data && syncStatus.data.entities.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/40"><tr><th className="pb-2 font-normal">Entity</th><th className="pb-2 font-normal">Synced</th><th className="pb-2 font-normal">Errors</th><th className="pb-2 font-normal">Avg Duration</th><th className="pb-2 font-normal">Conflicts</th></tr></thead>
                <tbody className="text-white/70">
                  {syncStatus.data.entities.map((e) => (
                    <tr key={e.entityType} className="border-t border-white/5">
                      <td className="py-2 font-medium text-white">{e.entityType}</td>
                      <td className="py-2 text-white/50">{e.totalSynced}</td>
                      <td className="py-2 text-white/50">{e.totalErrors}</td>
                      <td className="py-2 text-white/50">{Math.round(e.avgDurationMs)}ms</td>
                      <td className="py-2 text-white/50">{e.conflictsDetected} / {e.conflictsResolved} resolved</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="mb-3 text-sm font-medium text-white/70">Recent Operations</h3>
          {syncMetrics.data && syncMetrics.data.length === 0 && <p className="mb-4 text-sm text-white/30">No recent operations.</p>}
          {syncMetrics.data && syncMetrics.data.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/40"><tr><th className="pb-2 font-normal">Operation</th><th className="pb-2 font-normal">Result</th><th className="pb-2 font-normal">Duration</th><th className="pb-2 font-normal">Time</th></tr></thead>
                <tbody className="text-white/70">
                  {syncMetrics.data.map((m, i) => (
                    <tr key={`${m.operation}-${i}`} className="border-t border-white/5">
                      <td className="py-2 font-medium text-white">{m.operation}</td>
                      <td className="py-2">{m.success ? <span className="text-green-400/80">OK</span> : <span className="text-red-400/80">Failed</span>}</td>
                      <td className="py-2 text-white/50">{Math.round(m.durationMs)}ms</td>
                      <td className="py-2 text-white/40">{new Date(m.timestamp).toLocaleTimeString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="mb-3 text-sm font-medium text-white/70">Pending Conflicts</h3>
          {syncConflicts.data && syncConflicts.data.length === 0 && <p className="mb-4 text-sm text-white/30">No unresolved conflicts.</p>}
          {syncConflicts.data && syncConflicts.data.length > 0 && (
            <div className="mb-6 overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/40"><tr><th className="pb-2 font-normal">Entity</th><th className="pb-2 font-normal">Record</th><th className="pb-2 font-normal">Detected</th><th className="pb-2 font-normal">Fields</th><th className="pb-2 font-normal">Resolution</th></tr></thead>
                <tbody className="text-white/70">
                  {syncConflicts.data.map((c: SyncConflict) => (
                    <tr key={c.id} className="border-t border-white/5">
                      <td className="py-2 text-white/50">{c.entityType}</td>
                      <td className="py-2 text-white/50">#{c.entityId}</td>
                      <td className="py-2 text-white/40">{c.detectedAt ? new Date(c.detectedAt).toLocaleString() : '—'}</td>
                      <td className="py-2 text-white/40">{(c.conflictingFields ?? []).slice(0, 3).join(', ') || '—'}</td>
                      <td className="py-2">
                        <div className="flex items-center gap-2">
                          <select aria-label="Resolution strategy" value={resolveStrategies[c.id] ?? 'odoo-wins'} onChange={(e) => setResolveStrategies({ ...resolveStrategies, [c.id]: e.target.value as 'odoo-wins' | 'hexa-wins' })} className="rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-xs text-white outline-none focus:border-[#D4AF37]/50">
                            <option value="odoo-wins">Odoo wins</option>
                            <option value="hexa-wins">HEXA wins</option>
                          </select>
                          <button onClick={() => resolveConflictMutation.mutate({ id: c.id, strategy: resolveStrategies[c.id] ?? 'odoo-wins' })} disabled={resolveConflictMutation.isPending} className="rounded-lg bg-accent px-3 py-1 text-xs font-medium text-black hover:bg-accent-dark disabled:opacity-50">Resolve</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          <h3 className="mb-3 text-sm font-medium text-white/70">Delta Cursors</h3>
          {syncCursors.data && Object.keys(syncCursors.data).length === 0 && <p className="mb-4 text-sm text-white/30">No cursors yet.</p>}
          {syncCursors.data && Object.keys(syncCursors.data).length > 0 && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="text-white/40"><tr><th className="pb-2 font-normal">Entity</th><th className="pb-2 font-normal">Last Sync</th><th className="pb-2 font-normal">Last ID</th><th className="pb-2 font-normal">Synced</th><th className="pb-2 font-normal">Actions</th></tr></thead>
                <tbody className="text-white/70">
                  {Object.entries(syncCursors.data).map(([entityType, cursor]) => (
                    <tr key={entityType} className="border-t border-white/5">
                      <td className="py-2 font-medium text-white">{entityType}</td>
                      <td className="py-2 text-white/40">{new Date(cursor.lastSyncAt).toLocaleString()}</td>
                      <td className="py-2 text-white/50">#{cursor.lastSyncId}</td>
                      <td className="py-2 text-white/50">{cursor.recordsSynced}</td>
                      <td className="py-2">
                        <button onClick={() => handleResetCursor(entityType)} className="rounded-lg border border-white/10 px-3 py-1 text-xs text-white/60 hover:bg-white/5">Reset</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
