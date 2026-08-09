'use client';

import { useMemo, useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { workflowApi } from '@/features/odoo/api';
import type {
  WorkflowDefinition,
  WorkflowExecutionStatus,
  WorkflowTrigger,
  WorkflowEventName,
  CreateWorkflowDto,
} from '@hexastudio/types';
import { toast } from 'sonner';

const EVENT_OPTIONS: { value: WorkflowEventName; label: string }[] = [
  { value: 'lead.created', label: 'Lead created' },
  { value: 'lead.updated', label: 'Lead updated' },
  { value: 'lead.stage_changed', label: 'Lead stage changed' },
  { value: 'lead.won', label: 'Lead won' },
  { value: 'lead.lost', label: 'Lead lost' },
  { value: 'task.created', label: 'Task created' },
  { value: 'task.updated', label: 'Task updated' },
  { value: 'task.completed', label: 'Task completed' },
  { value: 'task.overdue', label: 'Task overdue' },
  { value: 'project.created', label: 'Project created' },
  { value: 'project.updated', label: 'Project updated' },
  { value: 'project.completed', label: 'Project completed' },
  { value: 'ticket.created', label: 'Ticket created' },
  { value: 'ticket.updated', label: 'Ticket updated' },
  { value: 'ticket.resolved', label: 'Ticket resolved' },
  { value: 'invoice.created', label: 'Invoice created' },
  { value: 'invoice.paid', label: 'Invoice paid' },
  { value: 'invoice.overdue', label: 'Invoice overdue' },
  { value: 'employee.hired', label: 'Employee hired' },
  { value: 'timesheet.submitted', label: 'Timesheet submitted' },
  { value: 'manual', label: 'Manual trigger' },
];

function triggerLabel(t: WorkflowTrigger): string {
  if (t.type === 'event') return `On ${t.event ?? 'any event'}`;
  if (t.type === 'schedule') return `Cron ${t.schedule ?? '—'}`;
  return 'Manual';
}

function StatusBadge({ status }: { status: WorkflowExecutionStatus }) {
  const classes =
    status === 'completed'
      ? 'bg-green-500/20 text-green-400'
      : status === 'failed'
        ? 'bg-red-500/20 text-red-400'
        : status === 'running'
          ? 'bg-accent/20 text-[#D4AF37]'
          : 'bg-white/10 text-white/50';
  return <span className={`rounded-full px-2 py-0.5 text-[10px] ${classes}`}>{status}</span>;
}

// --- Workflow Form Modal ---
function WorkflowFormModal({ open, onClose, initial }: { open: boolean; onClose: () => void; initial?: WorkflowDefinition | null }) {
  const queryClient = useQueryClient();
  const [name, setName] = useState(initial?.name ?? '');
  const [description, setDescription] = useState(initial?.description ?? '');
  const [triggerType, setTriggerType] = useState<'event' | 'schedule' | 'manual'>(initial?.trigger.type ?? 'manual');
  const [event, setEvent] = useState<WorkflowEventName>(initial?.trigger.event ?? 'lead.created');
  const [schedule, setSchedule] = useState(initial?.trigger.schedule ?? '');
  const [strategy, setStrategy] = useState<'sequential' | 'parallel'>(initial?.strategy ?? 'sequential');
  const [enabled, setEnabled] = useState(initial?.enabled ?? true);

  const mutation = useMutation({
    mutationFn: async () => {
      let trigger: WorkflowTrigger;
      if (triggerType === 'event') {
        trigger = { type: 'event', event };
      } else if (triggerType === 'schedule') {
        trigger = { type: 'schedule', schedule };
      } else {
        trigger = { type: 'manual' };
      }
      const payload: CreateWorkflowDto = {
        name,
        description: description || undefined,
        trigger,
        steps: initial?.steps ?? [],
        strategy,
        enabled,
      };
      if (initial?.id) {
        await workflowApi.update(initial.id, payload);
      } else {
        await workflowApi.create(payload);
      }
    },
    onSuccess: () => {
      toast.success(initial?.id ? 'Workflow updated' : 'Workflow created');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
      onClose();
    },
    onError: () => toast.error('Failed to save workflow'),
  });

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/80 backdrop-blur-xl" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-white/10 bg-neutral-900 p-8 shadow-2xl">
        <h2 className="mb-6 text-xl font-semibold text-white">{initial?.id ? 'Edit Workflow' : 'New Workflow'}</h2>
        <div className="space-y-4">
          <input placeholder="Workflow name *" aria-label="Workflow name" value={name} onChange={(e) => setName(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
          <input placeholder="Description" aria-label="Description" value={description} onChange={(e) => setDescription(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />

          <div>
            <label className="mb-1.5 block text-sm text-white/60">Trigger</label>
            <div className="flex gap-1 rounded-lg border border-white/10 bg-white/[0.02] p-1">
              {([
                { key: 'event', label: 'Event' },
                { key: 'schedule', label: 'Schedule' },
                { key: 'manual', label: 'Manual' },
              ] as const).map((t) => (
                <button key={t.key} onClick={() => setTriggerType(t.key)} className={`flex-1 rounded-md px-3 py-1.5 text-xs font-medium transition-colors ${triggerType === t.key ? 'bg-accent text-black' : 'text-white/50 hover:text-white/80'}`}>
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          {triggerType === 'event' && (
            <select aria-label="Trigger event" value={event} onChange={(e) => setEvent(e.target.value as WorkflowEventName)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50">
              {EVENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          )}

          {triggerType === 'schedule' && (
            <input placeholder="Cron expression (e.g. 0 8 * * *)" aria-label="Cron schedule" value={schedule} onChange={(e) => setSchedule(e.target.value)} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50" />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-sm text-white/60">Strategy</label>
              <select aria-label="Execution strategy" value={strategy} onChange={(e) => setStrategy(e.target.value as 'sequential' | 'parallel')} className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white outline-none focus:border-[#D4AF37]/50">
                <option value="sequential">Sequential</option>
                <option value="parallel">Parallel</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-sm text-white/60">Enabled</label>
              <button onClick={() => setEnabled(!enabled)} className={`relative h-5 w-9 rounded-full transition-colors ${enabled ? 'bg-accent' : 'bg-white/20'}`} aria-label="Toggle enabled">
                <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${enabled ? 'translate-x-4' : ''}`} />
              </button>
            </div>
          </div>
        </div>
        <div className="mt-6 flex justify-end gap-3">
          <button onClick={onClose} className="rounded-lg border border-white/10 px-4 py-2 text-sm text-white/60 hover:bg-white/5">Cancel</button>
          <button onClick={() => mutation.mutate()} disabled={mutation.isPending || !name} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-black hover:bg-accent-dark disabled:opacity-50">
            {mutation.isPending ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>
    </div>
  );
}

// --- Main Page ---
export default function WorkflowsPage() {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<WorkflowDefinition | null>(null);

  const workflows = useQuery({ queryKey: ['workflows'], queryFn: workflowApi.list });
  const executions = useQuery({ queryKey: ['workflow-executions'], queryFn: () => workflowApi.listExecutions(undefined, 1000) });

  const executionCounts = useMemo(() => {
    const counts = new Map<string, number>();
    for (const ex of executions.data ?? []) {
      counts.set(ex.workflowId, (counts.get(ex.workflowId) ?? 0) + 1);
    }
    return counts;
  }, [executions.data]);

  const runMutation = useMutation({
    mutationFn: (id: string) => workflowApi.execute(id),
    onSuccess: () => {
      toast.success('Workflow executed');
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
    },
    onError: () => toast.error('Failed to execute workflow'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => workflowApi.remove(id),
    onSuccess: () => {
      toast.success('Workflow deleted');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
      queryClient.invalidateQueries({ queryKey: ['workflow-executions'] });
    },
    onError: () => toast.error('Failed to delete workflow'),
  });

  const toggleMutation = useMutation({
    mutationFn: (wf: WorkflowDefinition) => workflowApi.update(wf.id, { enabled: !wf.enabled }),
    onSuccess: () => {
      toast.success('Workflow updated');
      queryClient.invalidateQueries({ queryKey: ['workflows'] });
    },
    onError: () => toast.error('Failed to toggle workflow'),
  });

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-white">Workflows</h1>
          <p className="mt-1 text-sm text-white/40">Automate Odoo operations — triggers, steps, and execution history.</p>
        </div>
        <button onClick={() => { setEditing(null); setModalOpen(true); }} className="rounded-lg bg-accent px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-accent-dark">+ New Workflow</button>
      </div>

      {workflows.isLoading && <p className="text-sm text-white/40">Loading...</p>}

      {workflows.data && workflows.data.length === 0 && (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-white/10 py-16">
          <div className="mb-4 text-4xl">⚙️</div>
          <h3 className="mb-2 text-lg font-medium text-white/80">No workflows yet</h3>
          <p className="mb-6 max-w-sm text-center text-sm text-white/40">
            Create an automation to react to Odoo events, run on a schedule, or trigger manually.
          </p>
          <button onClick={() => { setEditing(null); setModalOpen(true); }} className="rounded-lg bg-accent px-5 py-2 text-sm font-medium text-black transition-colors hover:bg-accent-dark">Add Workflow</button>
        </div>
      )}

      {workflows.data && workflows.data.length > 0 && (
        <div className="space-y-3">
          {workflows.data.map((wf) => (
            <div key={wf.id} className="rounded-xl border border-white/10 bg-white/[0.03] p-5 transition-colors hover:border-white/20">
              <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="font-medium text-white">{wf.name}</h3>
                  <p className="mt-0.5 text-sm text-white/40">{wf.description || 'No description'}</p>
                </div>
                <button
                  onClick={() => toggleMutation.mutate(wf)}
                  className={`relative h-5 w-9 rounded-full transition-colors ${wf.enabled ? 'bg-accent' : 'bg-white/20'}`}
                  aria-label={wf.enabled ? 'Disable workflow' : 'Enable workflow'}
                >
                  <span className={`absolute left-0.5 top-0.5 h-4 w-4 rounded-full bg-black transition-transform ${wf.enabled ? 'translate-x-4' : ''}`} />
                </button>
              </div>

              <div className="mb-3 flex flex-wrap gap-1.5">
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/50">{triggerLabel(wf.trigger)}</span>
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/50">{wf.steps.length} steps</span>
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/50">v{wf.version} · {wf.strategy}</span>
                <span className="rounded-md bg-white/5 px-2 py-0.5 text-xs text-white/50">{executionCounts.get(wf.id) ?? 0} runs</span>
              </div>

              <div className="flex gap-3 text-xs">
                <button onClick={() => runMutation.mutate(wf.id)} disabled={runMutation.isPending} className="rounded-lg bg-accent px-3 py-1.5 font-medium text-black transition-colors hover:bg-accent-dark disabled:opacity-50">Run now</button>
                <button onClick={() => { setEditing(wf); setModalOpen(true); }} className="text-white/40 transition-colors hover:text-white/70">Edit</button>
                <button onClick={() => { if (confirm(`Delete workflow "${wf.name}"?`)) deleteMutation.mutate(wf.id); }} className="text-red-400/60 transition-colors hover:text-red-400">Delete</button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Recent executions */}
      <h2 className="mt-12 mb-4 text-lg font-medium text-white">Recent Executions</h2>
      {executions.isLoading && <p className="text-sm text-white/40">Loading...</p>}
      {executions.data && executions.data.length === 0 && <p className="text-sm text-white/30">No executions yet.</p>}
      {executions.data && executions.data.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-white/40"><tr><th className="pb-2 font-normal">Execution</th><th className="pb-2 font-normal">Workflow</th><th className="pb-2 font-normal">Status</th><th className="pb-2 font-normal">Started</th><th className="pb-2 font-normal">Error</th></tr></thead>
            <tbody className="text-white/70">
              {executions.data.slice(0, 20).map((ex) => (
                <tr key={ex.id} className="border-t border-white/5">
                  <td className="py-2 font-mono text-white/50">{ex.id.slice(0, 8)}</td>
                  <td className="py-2 font-mono text-white/50">{ex.workflowId.slice(0, 8)}</td>
                  <td className="py-2"><StatusBadge status={ex.status} /></td>
                  <td className="py-2 text-white/40">{new Date(ex.startedAt).toLocaleString()}</td>
                  <td className="py-2 text-red-400/70">{ex.error ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {modalOpen && <WorkflowFormModal open onClose={() => setModalOpen(false)} initial={editing} />}
    </div>
  );
}
