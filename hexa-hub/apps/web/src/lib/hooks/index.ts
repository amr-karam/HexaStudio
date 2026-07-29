// ─── HEXA Hub — Hooks Barrel Export ────────────────────────────────────────
// Central export point for all React Query hooks.
// ───────────────────────────────────────────────────────────────────────────

export {
  useOdooList,
  useOdooItem,
  useOdooMutation,
} from './use-odoo-query';
export type {
  PaginatedResponse,
  SingleResponse,
  ListParams,
  OdooListResult,
  OdooItemResult,
  OdooMutationResult,
} from './use-odoo-query';

export {
  useCrmPipeline,
  useCrmLeads,
  useCrmLead,
  useCrmStats,
  useCreateLead,
  useUpdateLead,
  useDeleteLead,
} from './use-crm';

export {
  useContacts,
  useContact,
  useClients,
  useCompanies,
  useCreateContact,
  useUpdateContact,
  useDeleteContact,
} from './use-contacts';

export {
  useQuotations,
  useQuotation,
  useInvoices,
  useInvoice,
  useSalesOrders,
  useSalesStats,
} from './use-sales';

export {
  useProjects,
  useProject,
  useProjectMilestones,
  useProjectStats,
  useCreateProject,
  useUpdateProject,
  useCreateMilestone,
  useUpdateMilestone,
} from './use-projects';

export {
  useTasks,
  useTask,
  useCreateTask,
  useUpdateTask,
  useCompleteTask,
  useDeleteTask,
} from './use-tasks';

export {
  useActivities,
  useCreateActivity,
  useUpdateActivity,
  useCompleteActivity,
} from './use-activities';

export {
  useNotifications,
  useMarkNotificationRead,
  useMarkAllRead,
  useDeleteNotification,
  useUnreadCount,
} from './use-notifications';

export { useSearch } from './use-search';
export type { SearchResponse, SearchResultState } from './use-search';

export {
  usePortalProjects,
  usePortalProject,
  usePortalInvoices,
  usePortalInvoice,
  usePortalSummary,
} from './use-portal';

export { useHelpdeskTickets, useHelpdeskTicket, useCreateTicket, useUpdateTicket } from './use-helpdesk';
export { useCalendarEvents, useCalendarEvent, useCreateEvent, useUpdateEvent, useDeleteEvent } from './use-calendar';
export { useEmployees, useEmployee } from './use-employees';
export { useTimesheets, useCreateTimesheet, useTimesheetStats } from './use-timesheets';
export { useKnowledgeArticles, useKnowledgeArticle } from './use-knowledge';
export { useChartOfAccounts, useJournalEntries, useTrialBalance, useProfitAndLoss, useBalanceSheet } from './use-accounting';

export { usePresence } from './use-presence';
export type { UsePresenceReturn } from './use-presence';

export { useTypingIndicator, useTypingUsers } from './use-typing';
export { useThread, useSendThreadReply } from './use-threads';

export {
  useChannels,
  useChannel,
  useChannelMembers,
  useChannelMessages,
  useCreateChannel,
  useUpdateChannel,
  useDeleteChannel,
  useAddChannelMember,
  useSendChannelMessage,
  useReplyToMessage,
  CHANNELS_KEYS,
} from './use-channels';
export type {
  Channel,
  ChannelMember,
  ChannelMessage,
} from './use-channels';

export {
  useAiSummary,
  useAiAssistant,
} from './use-ai';
export type {
  AiSummaryRequest,
  AiSummaryResponse,
  AssistantMessage,
  AiAssistRequest,
  AiAssistResponse,
  UseAiSummaryReturn,
  UseAiAssistantReturn,
} from './use-ai';
