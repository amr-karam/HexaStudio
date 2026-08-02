/**
 * Executive Dashboard Formatters
 * Premium formatting utilities for dashboard data
 */

import { COLORS } from "../config/dashboard-config";

// ========== Currency Formatting ==========
export const formatCurrency = (
  value: number,
  currency: string = "USD",
  options: Intl.NumberFormatOptions = {}
): string => {
  const defaultOptions: Intl.NumberFormatOptions = {
    style: "currency",
    currency: currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
    currencyDisplay: "symbol",
    ...options,
  };

  try {
    return new Intl.NumberFormat("en-US", defaultOptions).format(value);
  } catch (error) {
    console.error("Currency formatting error:", error);
    return `$${value.toFixed(2)}`;
  }
};

// ========== Percentage Formatting ==========
export const formatPercentage = (
  value: number,
  options: { decimals?: number; showSign?: boolean } = {}
): string => {
  const { decimals = 2, showSign = false } = options;
  
  const formatted = value.toFixed(decimals);
  const sign = showSign && value > 0 ? "+" : "";
  
  return `${sign}${formatted}%`;
};

// ========== Date Formatting ==========
export const formatDate = (
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string => {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    ...options,
  };

  try {
    const dateObj = date instanceof Date ? date : new Date(date);
    return new Intl.DateTimeFormat("en-US", defaultOptions).format(dateObj);
  } catch (error) {
    console.error("Date formatting error:", error);
    return date.toString();
  }
};

// ========== Time Ago Formatting ==========
export const formatTimeAgo = (date: string | Date): string => {
  const now = new Date();
  const inputDate = date instanceof Date ? date : new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - inputDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return `${diffInSeconds}s ago`;
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}m ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}h ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}d ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}mo ago`;
  }

  const diffInYears = Math.floor(diffInDays / 365);
  return `${diffInYears}y ago`;
};

// ========== Number Formatting ==========
export const formatNumber = (
  value: number,
  options: { compact?: boolean; decimals?: number } = {}
): string => {
  const { compact = true, decimals = 1 } = options;

  try {
    if (compact) {
      return new Intl.NumberFormat("en-US", {
        notation: "compact",
        maximumFractionDigits: decimals,
      }).format(value);
    }

    return new Intl.NumberFormat("en-US", {
      maximumFractionDigits: decimals,
    }).format(value);
  } catch (error) {
    console.error("Number formatting error:", error);
    return value.toString();
  }
};

// ========== Duration Formatting ==========
export const formatDuration = (seconds: number): string => {
  if (seconds < 60) {
    return `${Math.round(seconds)}s`;
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = Math.round(seconds % 60);

  if (minutes < 60) {
    return `${minutes}m ${remainingSeconds}s`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours < 24) {
    return `${hours}h ${remainingMinutes}m`;
  }

  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  return `${days}d ${remainingHours}h`;
};

// ========== Status Formatting ==========
export const formatStatus = (
  status: string,
  type: "user" | "project" | "revenue" | "copilot" = "user"
): string => {
  const statusMap: Record<string, Record<string, string>> = {
    user: {
      online: "Online",
      idle: "Idle",
      offline: "Offline",
    },
    project: {
      not_started: "Not Started",
      in_progress: "In Progress",
      on_hold: "On Hold",
      completed: "Completed",
      cancelled: "Cancelled",
    },
    revenue: {
      paid: "Paid",
      pending: "Pending",
      overdue: "Overdue",
    },
    copilot: {
      active: "Active",
      inactive: "Inactive",
    },
  };

  return statusMap[type]?.[status] || status;
};

// ========== Color Formatting ==========
export const getStatusColor = (
  status: string,
  type: "user" | "project" | "revenue" = "user"
): string => {
  const colorMap: Record<string, Record<string, string>> = {
    user: {
      online: COLORS.accent.success,
      idle: COLORS.accent.warning,
      offline: COLORS.text.muted,
    },
    project: {
      not_started: COLORS.text.muted,
      in_progress: COLORS.accent.primary,
      on_hold: COLORS.accent.warning,
      completed: COLORS.accent.success,
      cancelled: COLORS.accent.danger,
    },
    revenue: {
      paid: COLORS.accent.success,
      pending: COLORS.accent.warning,
      overdue: COLORS.accent.danger,
    },
  };

  return colorMap[type]?.[status] || COLORS.text.primary;
};

// ========== Chart Data Formatting ==========
export const formatChartData = <T extends Record<string, unknown>>(
  data: T[],
  key: keyof T,
  dateKey: keyof T
): { date: string; value: number }[] => {
  return data.map((item) => ({
    date: formatDate(item[dateKey] as string),
    value: Number(item[key]),
  }));
};

// ========== Progress Formatting ==========
export const formatProgress = (
  value: number,
  options: { showPercentage?: boolean; decimals?: number } = {}
): string => {
  const { showPercentage = true, decimals = 0 } = options;
  const formattedValue = value.toFixed(decimals);

  if (showPercentage) {
    return `${formattedValue}%`;
  }

  return formattedValue;
};

// ========== Truncate Text ==========
export const truncateText = (
  text: string,
  maxLength: number = 50,
  options: { ellipsis?: string } = {}
): string => {
  const { ellipsis = "..." } = options;

  if (text.length <= maxLength) {
    return text;
  }

  return `${text.substring(0, maxLength)}${ellipsis}`;
};

// ========== Sorting Helpers ==========
export const sortByDate = <T extends Record<string, unknown>>(
  data: T[],
  dateKey: keyof T,
  direction: "asc" | "desc" = "desc"
): T[] => {
  return [...data].sort((a, b) => {
    const dateA = new Date(a[dateKey] as string).getTime();
    const dateB = new Date(b[dateKey] as string).getTime();

    return direction === "asc" ? dateA - dateB : dateB - dateA;
  });
};

export const sortByNumber = <T extends Record<string, unknown>>(
  data: T[],
  numberKey: keyof T,
  direction: "asc" | "desc" = "desc"
): T[] => {
  return [...data].sort((a, b) => {
    const numA = Number(a[numberKey]);
    const numB = Number(b[numberKey]);

    return direction === "asc" ? numA - numB : numB - numA;
  });
};

// ========== Filter Helpers ==========
export const filterByStatus = <T extends Record<string, unknown>>(
  data: T[],
  statusKey: keyof T,
  status: string
): T[] => {
  if (status === "all") {
    return data;
  }

  return data.filter((item) => item[statusKey] === status);
};

// ========== Memoization Helper ==========
export const memoize = <T extends (...args: unknown[]) => unknown>(
  fn: T
): T => {
  const cache = new Map<string, unknown>();

  return ((...args: unknown[]) => {
    const key = JSON.stringify(args);

    if (cache.has(key)) {
      return cache.get(key);
    }

    const result = fn(...args);
    cache.set(key, result);
    return result;
  }) as T;
};

// ========== Error Handling ==========
export const safeFormat = <T, R>(
  value: T,
  formatter: (value: T) => R,
  fallback: R
): R => {
  try {
    return formatter(value);
  } catch (error) {
    console.error("Formatting error:", error);
    return fallback;
  }
};
