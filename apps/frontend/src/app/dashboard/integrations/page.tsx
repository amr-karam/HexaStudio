'use client';

import { useState, useEffect, useCallback } from 'react';
import { webhookApi, type WebhookConfig, type CreateWebhookDto } from '@/features/integrations/api';
import { notionApi, jiraApi } from '@/features/integrations/api-integrations';
import { toast } from 'sonner';

const EVENT_OPTIONS = [
  { value: 'approval:action', label: 'Approval Actions (submit/approve/reject)' },
  { value: 'annotation:add', label: 'Annotation Added' },
  { value: 'project:update', label: 'Project Updated' },
  { value: 'project:create', label: 'Project Created' },
  { value: 'phase:submit', label: 'Phase Submitted' },
  { value: 'phase:approve', label: 'Phase Approved' },
  { value: 'phase:reject', label: 'Phase Rejected' },
  { value: 'figma:update', label: 'Figma File Updated' },
  { value: 'figma:comment', label: 'Figma Comment Added' },
];

function EmptyState({ onAdd }: { onAdd: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
      <div className="mb-4 text-4xl">🔗</div>
      <h3 className="mb-2 text-lg font-medium text-white/80">No webhooks configured</h3>
      <p className="mb-6 max-w-sm text-center text-sm text-white/40">
        Connect your tools — Slack, Notion, Jira, or any custom endpoint.
        Webhooks fire on project approvals, annotations, and more.
      </p>
      <button
        onClick={onAdd}
        className="rounded-lg bg-[#D4AF37] px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-[#C49A2F]"
      >
        Add Webhook
      </button>
    </div>
  );
}

function WebhookCard({
  webhook,
  onToggle,
  onEdit,
  onDelete,
}: {
  webhook: WebhookConfig;
  onToggle: () => void;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const eventLabels = EVENT_OPTIONS.filter((o) => webhook.events.includes(o.value)).map((o) => o.label.split(' ')[0]);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20">
      <div className="mb-3 flex items-start justify-between">
        <div>
          <h3 className="font-medium text-white">{webhook.name}</h3>
          <p className="mt-0.5 truncate text-sm text-white/40">{webhook.url}</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={onToggle}
            className={`relative h-5 w-9 rounded-full transition-colors ${webhook.active ? 'bg-[#D4AF37]' : 'bg-white/20'}`}
          >
            <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${webhook.active ? 'translate-x-4' : ''}`} />
          </button>
        </div>
      </div>

      <div className="mb-3 flex flex-wrap gap-1.5">
        {eventLabels.map((label) => (
          <span key={label} className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/50">
            {label}
          </span>
        ))}
      </div>

      <div className="flex gap-3 text-xs">
        <button onClick={onEdit} className="text-white/40 transition-colors hover:text-white/70">
          Edit
        </button>
        <button onClick={onDelete} className="text-red-400/60 transition-colors hover:text-red-400">
          Delete
        </button>
      </div>
    </div>
  );
}

function WebhookForm({
  initial,
  onSave,
  onCancel,
}: {
  initial?: WebhookConfig;
  onSave: (dto: CreateWebhookDto) => Promise<void>;
  onCancel: () => void;
}) {
  const [name, setName] = useState(initial?.name || '');
  const [url, setUrl] = useState(initial?.url || '');
  const [events, setEvents] = useState<string[]>(initial?.events || []);
  const [saving, setSaving] = useState(false);

  const toggleEvent = (ev: string) => {
    setEvents((prev) => (prev.includes(ev) ? prev.filter((e) => e !== ev) : [...prev, ev]));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !url.trim() || events.length === 0) return;
    setSaving(true);
    try {
      const dto: CreateWebhookDto = { name: name.trim(), url: url.trim(), events };
      await onSave(dto);
    } finally {
      setSaving(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5 rounded-xl border border-white/10 bg-white/[0.03] p-6">
      <div>
        <label className="mb-1.5 block text-sm text-white/60">Name</label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. Slack Notifications"
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#D4AF37]/50"
        />
      </div>

      <div>
        <label className="mb-1.5 block text-sm text-white/60">Webhook URL</label>
        <input
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://hooks.slack.com/..."
          className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none transition-colors focus:border-[#D4AF37]/50"
        />
      </div>

      <div>
        <label className="mb-2 block text-sm text-white/60">Events</label>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          {EVENT_OPTIONS.map((opt) => (
            <label key={opt.value} className="flex cursor-pointer items-center gap-2 rounded-lg border border-white/5 px-3 py-2 transition-colors hover:border-white/20">
              <input
                type="checkbox"
                checked={events.includes(opt.value)}
                onChange={() => toggleEvent(opt.value)}
                className="accent-[#D4AF37]"
              />
              <span className="text-sm text-white/60">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 transition-colors hover:bg-white/5"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={saving || !name.trim() || !url.trim() || events.length === 0}
          className="rounded-lg bg-[#D4AF37] px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-[#C49A2F] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {saving ? 'Saving...' : initial ? 'Update' : 'Create'}
        </button>
      </div>
    </form>
  );
}

function NotionPanel() {
  const [status, setStatus] = useState<{ configured: boolean } | null>(null);
  const [databases, setDatabases] = useState<Array<{ id: string; title: string }>>([]);

  useEffect(() => {
    notionApi.status().then(setStatus).catch(() => {});
    notionApi.databases().then(setDatabases).catch(() => {});
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-xl">📋</span>
        <div>
          <h3 className="font-medium text-white">Notion</h3>
          <p className="text-xs text-white/40">Sync project milestones & task status</p>
        </div>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${status?.configured ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
          {status?.configured ? 'Connected' : 'Not configured'}
        </span>
      </div>
      {status?.configured && databases.length > 0 && (
        <div className="space-y-1">
          {databases.slice(0, 3).map((db) => (
            <div key={db.id} className="rounded-md bg-white/5 px-3 py-1.5 text-xs text-white/60">
              {db.title}
            </div>
          ))}
        </div>
      )}
      {!status?.configured && (
        <p className="text-xs text-white/30">Set NOTION_API_KEY in environment variables</p>
      )}
    </div>
  );
}

function JiraPanel() {
  const [status, setStatus] = useState<{ configured: boolean } | null>(null);
  const [projects, setProjects] = useState<Array<{ key: string; name: string }>>([]);

  useEffect(() => {
    jiraApi.status().then(setStatus).catch(() => {});
    jiraApi.projects().then(setProjects).catch(() => {});
  }, []);

  return (
    <div className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20">
      <div className="mb-3 flex items-center gap-3">
        <span className="text-xl">🔧</span>
        <div>
          <h3 className="font-medium text-white">Jira / Linear</h3>
          <p className="text-xs text-white/40">Bidirectional issue sync</p>
        </div>
        <span className={`ml-auto rounded-full px-2 py-0.5 text-[10px] ${status?.configured ? 'bg-green-500/20 text-green-400' : 'bg-white/10 text-white/40'}`}>
          {status?.configured ? 'Connected' : 'Not configured'}
        </span>
      </div>
      {status?.configured && projects.length > 0 && (
        <div className="space-y-1">
          {projects.slice(0, 3).map((p) => (
            <div key={p.key} className="rounded-md bg-white/5 px-3 py-1.5 text-xs text-white/60">
              {p.name} <span className="text-white/30">({p.key})</span>
            </div>
          ))}
        </div>
      )}
      {!status?.configured && (
        <p className="text-xs text-white/30">Set JIRA_* environment variables</p>
      )}
    </div>
  );
}

export default function IntegrationsPage() {
  const [webhooks, setWebhooks] = useState<WebhookConfig[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<WebhookConfig | null>(null);

  const load = useCallback(async () => {
    try {
      const data = await webhookApi.findAll();
      setWebhooks(data);
    } catch {
      toast.error('Failed to load webhooks');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleCreate = async (dto: CreateWebhookDto) => {
    try {
      await webhookApi.create(dto);
      toast.success('Webhook created');
      setShowForm(false);
      load();
    } catch {
      toast.error('Failed to create webhook');
    }
  };

  const handleUpdate = async (dto: CreateWebhookDto) => {
    if (!editing) return;
    try {
      await webhookApi.update(editing.id, dto);
      toast.success('Webhook updated');
      setEditing(null);
      load();
    } catch {
      toast.error('Failed to update webhook');
    }
  };

  const handleToggle = async (id: string) => {
    try {
      await webhookApi.toggle(id);
      load();
    } catch {
      toast.error('Failed to toggle webhook');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await webhookApi.delete(id);
      toast.success('Webhook deleted');
      load();
    } catch {
      toast.error('Failed to delete webhook');
    }
  };

  const activeCount = webhooks.filter((w) => w.active).length;

  return (
    <div className="mx-auto max-w-3xl px-4 py-12">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-white">Integrations</h1>
          <p className="mt-1 text-sm text-white/40">
            {webhooks.length === 0
              ? 'Connect your tools to HEXA Studio'
              : `${activeCount} of ${webhooks.length} webhooks active`}
          </p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); }}
          className="rounded-lg bg-[#D4AF37] px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-[#C49A2F]"
        >
          Add Webhook
        </button>
      </div>

      {loading && (
        <div className="flex items-center justify-center py-16">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-white/10 border-t-[#D4AF37]" />
        </div>
      )}

      {!loading && webhooks.length === 0 && !showForm && (
        <EmptyState onAdd={() => setShowForm(true)} />
      )}

      {showForm && (
        <div className="mb-6">
          <WebhookForm onSave={handleCreate} onCancel={() => setShowForm(false)} />
        </div>
      )}

      {editing && (
        <div className="mb-6">
          <WebhookForm
            initial={editing}
            onSave={handleUpdate}
            onCancel={() => setEditing(null)}
          />
        </div>
      )}

      <div className="space-y-3">
        {webhooks.map((w) => (
          <WebhookCard
            key={w.id}
            webhook={w}
            onToggle={() => handleToggle(w.id)}
            onEdit={() => setEditing(w)}
            onDelete={() => handleDelete(w.id)}
          />
        ))}
      </div>

      <h2 className="mt-12 mb-4 text-lg font-medium text-white">External Tools</h2>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <NotionPanel />
        <JiraPanel />
      </div>
    </div>
  );
}
