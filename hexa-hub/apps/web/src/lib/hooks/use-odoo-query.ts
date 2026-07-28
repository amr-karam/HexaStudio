// ─── HEXA Hub — Generic Odoo Query Hooks ───────────────────────────────────
// React Query hook factory for Odoo data. Provides list, item, and mutation
// hooks with proper loading, error, and empty-state handling.
// ───────────────────────────────────────────────────────────────────────────

'use client';

import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
  type UseMutationOptions,
  type QueryKey,
} from '@tanstack/react-query';
import { get, post, put, patch, del } from '@/lib/api';

// ─── Types ─────────────────────────────────────────────────────────────────

/** Standard paginated API response envelope. */
export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

/** Standard single-item API response envelope. */
export interface SingleResponse<T> {
  data: T;
}

/** Parameters for list queries. */
export interface ListParams {
  page?: number;
  limit?: number;
  search?: string;
  sort?: string;
  order?: 'asc' | 'desc';
  [key: string]: unknown;
}

/** Return type for the useOdooList hook. */
export interface OdooListResult<T> {
  data: T[] | undefined;
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isEmpty: boolean;
  refetch: () => void;
}

/** Return type for the useOdooItem hook. */
export interface OdooItemResult<T> {
  data: T | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isEmpty: boolean;
  refetch: () => void;
}

/** Return type for the useOdooMutation hook. */
export interface OdooMutationResult<TData, TVariables> {
  mutate: (variables: TVariables) => void;
  mutateAsync: (variables: TVariables) => Promise<TData>;
  isLoading: boolean;
  isError: boolean;
  error: Error | null;
  isSuccess: boolean;
  reset: () => void;
}

// ─── Stale Time Constants ──────────────────────────────────────────────────

const LIST_STALE_TIME = 60_000; // 1 minute
const ITEM_STALE_TIME = 30_000; // 30 seconds

// ─── useOdooList ────────────────────────────────────────────────────────────

/**
 * Generic hook for fetching paginated Odoo list endpoints.
 *
 * @param key — Unique query key segment (e.g., 'crm-leads').
 * @param endpoint — API endpoint path (e.g., '/odoo/crm/leads').
 * @param params — Query parameters (page, limit, search, filters, etc.).
 * @param options — Additional React Query options.
 */
export function useOdooList<T>(
  key: string,
  endpoint: string,
  params?: ListParams,
  options?: Omit<
    UseQueryOptions<PaginatedResponse<T>, Error>,
    'queryKey' | 'queryFn'
  >,
): OdooListResult<T> {
  const queryKey: QueryKey = [key, endpoint, params];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<PaginatedResponse<T>, Error>({
    queryKey,
    queryFn: () =>
      get<PaginatedResponse<T>>(endpoint, { params }),
    staleTime: LIST_STALE_TIME,
    retry: 1,
    ...options,
  });

  return {
    data: data?.data,
    total: data?.total ?? 0,
    page: data?.page ?? 1,
    limit: data?.limit ?? 20,
    totalPages: data?.totalPages ?? 0,
    isLoading,
    isError,
    error: error ?? null,
    isEmpty: !isLoading && !isError && (data?.data?.length ?? 0) === 0,
    refetch,
  };
}

// ─── useOdooItem ────────────────────────────────────────────────────────────

/**
 * Generic hook for fetching a single Odoo item by ID.
 * If `id` is undefined or null, the query is disabled.
 *
 * @param key — Unique query key segment (e.g., 'crm-lead').
 * @param endpoint — API endpoint path (e.g., '/odoo/crm/leads').
 * @param id — The item ID. Query is disabled when falsy.
 * @param options — Additional React Query options.
 */
export function useOdooItem<T>(
  key: string,
  endpoint: string,
  id?: string | number,
  options?: Omit<
    UseQueryOptions<SingleResponse<T>, Error>,
    'queryKey' | 'queryFn'
  >,
): OdooItemResult<T> {
  const queryKey: QueryKey = [key, endpoint, id];

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery<SingleResponse<T>, Error>({
    queryKey,
    queryFn: () =>
      get<SingleResponse<T>>(`${endpoint}/${id}`),
    staleTime: ITEM_STALE_TIME,
    retry: 1,
    enabled: id !== undefined && id !== null && id !== '',
    ...options,
  });

  return {
    data: data?.data,
    isLoading,
    isError,
    error: error ?? null,
    isEmpty: !isLoading && !isError && data?.data === undefined,
    refetch,
  };
}

// ─── useOdooMutation ────────────────────────────────────────────────────────

/**
 * Generic hook for Odoo mutations (create, update, delete).
 * Supports optimistic updates and automatic query invalidation.
 *
 * @param endpoint — API endpoint path (e.g., '/odoo/crm/leads').
 * @param method — HTTP method to use.
 * @param options — Additional React Query mutation options.
 */
export function useOdooMutation<TData, TVariables = unknown>(
  endpoint: string,
  method: 'POST' | 'PUT' | 'PATCH' | 'DELETE',
  options?: {
    /** Query keys to invalidate on success. */
    invalidateKeys?: string[];
    /** Optimistic update handler. */
    onOptimistic?: (variables: TVariables) => void;
    /** Additional mutation options. */
    mutationOptions?: Omit<
      UseMutationOptions<TData, Error, TVariables>,
      'mutationFn'
    >;
  },
): OdooMutationResult<TData, TVariables> {
  const queryClient = useQueryClient();

  const mutationFn = async (variables: TVariables): Promise<TData> => {
    switch (method) {
      case 'POST':
        return post<TData>(endpoint, variables);
      case 'PUT':
        return put<TData>(endpoint, variables);
      case 'PATCH':
        return patch<TData>(endpoint, variables);
      case 'DELETE':
        return del<TData>(endpoint);
      default:
        throw new Error(`Unsupported method: ${method}`);
    }
  };

  const {
    mutate,
    mutateAsync,
    isPending: isLoading,
    isError,
    error,
    isSuccess,
    reset,
  } = useMutation<TData, Error, TVariables>({
    mutationFn,
    onMutate: async (variables) => {
      // Cancel in-flight queries for the specified keys
      if (options?.invalidateKeys) {
        await Promise.all(
          options.invalidateKeys.map((key) =>
            queryClient.cancelQueries({ queryKey: [key] }),
          ),
        );
      }
      // Run optimistic update if provided
      options?.onOptimistic?.(variables);
    },
    onSuccess: () => {
      // Invalidate related queries to refetch fresh data
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    },
    onError: () => {
      // Rollback optimistic updates by invalidating
      if (options?.invalidateKeys) {
        options.invalidateKeys.forEach((key) => {
          queryClient.invalidateQueries({ queryKey: [key] });
        });
      }
    },
    ...options?.mutationOptions,
  });

  return {
    mutate,
    mutateAsync,
    isLoading,
    isError,
    error: error ?? null,
    isSuccess,
    reset,
  };
}
