'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { odooApi } from '@/features/odoo/api';
import type { OdooLead, OdooPipelineSummary } from '@hexastudio/types';
import { toast } from 'sonner';

type Tab = 'pipeline' | 'leads' | 'contacts' | 'projects' | 'documents' | 'sales' | 'invoices' | 'company';

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
            <div className="h-full rounded-full bg-[#D4AF37]" style={{ width: `${(stage.leadCount / max) * 100}%` }} />
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
  return Array.isArray(v) ? v[1] : String(v);
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
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name} className="rounded-lg bg-[#D4AF37] px-5 py-2 text-sm font-medium text-black hover:bg-[#C49A2F] disabled:opacity-50">
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
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !form.name} className="rounded-lg bg-[#D4AF37] px-5 py-2 text-sm font-medium text-black hover:bg-[#C49A2F] disabled:opacity-50">
            {mutation.isPending ? 'Creating...' : 'Create'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function OdooDashboardPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('pipeline');
  const [syncing, setSyncing] = useState(false);
  const [leadModalOpen, setLeadModalOpen] = useState(false);
  const [contactModalOpen, setContactModalOpen] = useState(false);
  const [contactSearch, setContactSearch] = useState('');
  const [selectedProjectId, setSelectedProjectId] = useState<number | null>(null);

  const pipeline = useQuery({ queryKey: ['odoo-pipeline'], queryFn: odooApi.getPipeline });
  const syncState = useQuery({ queryKey: ['odoo-sync'], queryFn: odooApi.getSyncState, refetchInterval: 30000 });
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

  const handleSync = async () => {
    setSyncing(true);
    try {
      await odooApi.triggerSync();
      toast.success('Odoo sync triggered');
      syncState.refetch();
    } catch {
      toast.error('Sync failed');
    } finally {
      setSyncing(false);
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
  ];

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Odoo ERP</h1>
          <p className="mt-1 text-sm text-white/40">Live business operations — CRM, sales, projects, and invoicing.</p>
        </div>
        <button onClick={handleSync} disabled={syncing} className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#C49A2F] disabled:opacity-50">
          {syncing ? 'Syncing...' : 'Trigger Sync'}
        </button>
      </div>

      <div className="mb-8 grid grid-cols-2 gap-4 md:grid-cols-4">
        <StatCard label="Pipeline Value" value={`$${totalRevenue}`} />
        <StatCard label="Leads" value={String(pipeline.data?.totalLeads ?? 0)} />
        <StatCard label="Last Sync" value={syncState.data?.lastSync ? new Date(syncState.data.lastSync).toLocaleTimeString() : '—'} />
        <StatCard label="Status" value={syncState.data?.lastError ? 'Error' : 'Healthy'} sub={syncState.data?.lastError ?? 'Odoo connected'} />
      </div>

      {/* Tabs */}
      <div className="mb-6 flex gap-1 overflow-x-auto rounded-xl border border-white/10 bg-white/[0.02] p-1">
        {TABS.map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`rounded-lg px-4 py-2 text-sm font-medium transition-colors ${tab === t.key ? 'bg-[#D4AF37] text-black' : 'text-white/50 hover:text-white/80'}`}>
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
            <button onClick={() => setLeadModalOpen(true)} className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black hover:bg-[#C49A2F]">+ New Lead</button>
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
              <button onClick={() => setContactModalOpen(true)} className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black hover:bg-[#C49A2F]">+ New Contact</button>
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
                      <td className="py-2">{c.x_hexa_client ? <span className="rounded bg-[#D4AF37]/20 px-2 py-0.5 text-xs text-[#D4AF37]">Client</span> : <span className="text-white/30">—</span>}</td>
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
                <label className="cursor-pointer rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black hover:bg-[#C49A2F]">
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
                  {[company.data.street, company.data.street2, company.data.city, company.data.state, company.data.zip, company.data.country]
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
                <p className="mt-1 text-sm text-white">{company.data.currency || '—'}</p>
              </div>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
