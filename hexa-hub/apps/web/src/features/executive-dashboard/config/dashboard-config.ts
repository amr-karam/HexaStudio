/**
 * Executive Dashboard Configuration
 * Premium styling and behavior configuration
 */

import { cva, type VariantProps } from "class-variance-authority";

// ========== Color Palette ==========
export const COLORS = {
  // Premium glass morphism colors
  glass: {
    background: "rgba(255, 255, 255, 0.1)",
    border: "rgba(255, 255, 255, 0.2)",
    hover: "rgba(255, 255, 255, 0.3)",
    active: "rgba(255, 255, 255, 0.4)",
  },
  
  // Premium gradient backgrounds
  gradients: {
    primary: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
    secondary: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
    success: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
    warning: "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
    danger: "linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)",
    info: "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
  },
  
  // Premium shadows
  shadows: {
    sm: "0 1px 2px 0 rgba(0, 0, 0, 0.05)",
    md: "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
    lg: "0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)",
    xl: "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)",
    "2xl": "0 25px 50px -12px rgba(0, 0, 0, 0.25)",
    glass: "0 8px 32px 0 rgba(31, 41, 55, 0.3)",
    inner: "inset 0 2px 4px 0 rgba(0, 0, 0, 0.06)",
  },
  
  // Premium text colors
  text: {
    primary: "#1f2937",
    secondary: "#6b7280",
    muted: "#9ca3af",
    light: "#d1d5db",
    dark: "#374151",
    white: "#ffffff",
  },
  
  // Premium background colors
  background: {
    primary: "#111827",
    secondary: "#1f2937",
    tertiary: "#374151",
    surface: "#1f2937",
    surfaceHover: "#2563eb",
    surfaceActive: "#1d4ed8",
    glass: "rgba(31, 41, 55, 0.5)",
    glassLight: "rgba(255, 255, 255, 0.05)",
  },
  
  // Premium accent colors
  accent: {
    primary: "#3b82f6",
    secondary: "#8b5cf6",
    success: "#10b981",
    warning: "#f59e0b",
    danger: "#ef4444",
    info: "#06b6d4",
  },
};

// ========== Glass Morphism Styles ==========
export const glassMorphism = cva(
  [
    "backdrop-blur-md",
    "border border-white/20",
    "bg-white/10",
    "shadow-glass",
    "transition-all duration-300",
    "hover:bg-white/20",
    "active:bg-white/30",
  ],
  {
    variants: {
      size: {
        sm: "p-2 rounded-lg",
        md: "p-4 rounded-xl",
        lg: "p-6 rounded-2xl",
        xl: "p-8 rounded-3xl",
      },
      interactive: {
        true: "hover:scale-[1.02] hover:shadow-glass-lg",
        false: "",
      },
    },
    defaultVariants: {
      size: "md",
      interactive: true,
    },
  }
);

// ========== Metric Card Styles ==========
export const metricCard = cva(
  [
    "relative overflow-hidden",
    "transition-all duration-500",
    "group",
  ],
  {
    variants: {
      variant: {
        primary: [
          "bg-gradient-to-br from-blue-600/20 to-purple-600/20",
          "border border-blue-500/30",
        ],
        success: [
          "bg-gradient-to-br from-emerald-600/20 to-teal-600/20",
          "border border-emerald-500/30",
        ],
        warning: [
          "bg-gradient-to-br from-amber-600/20 to-orange-600/20",
          "border border-amber-500/30",
        ],
        danger: [
          "bg-gradient-to-br from-rose-600/20 to-red-600/20",
          "border border-rose-500/30",
        ],
        info: [
          "bg-gradient-to-br from-cyan-600/20 to-sky-600/20",
          "border border-cyan-500/30",
        ],
      },
      size: {
        sm: "p-3 rounded-lg",
        md: "p-4 rounded-xl",
        lg: "p-6 rounded-2xl",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "md",
    },
  }
);

// ========== Chart Configuration ==========
export const chartConfig = {
  revenue: {
    line: {
      stroke: "#3b82f6",
      strokeWidth: 3,
      fill: "rgba(59, 130, 246, 0.1)",
    },
    bar: {
      fill: "#3b82f6",
    },
  },
  projects: {
    completed: {
      stroke: "#10b981",
      fill: "rgba(16, 185, 129, 0.1)",
    },
    inProgress: {
      stroke: "#f59e0b",
      fill: "rgba(245, 158, 11, 0.1)",
    },
  },
  copilot: {
    sessions: {
      stroke: "#8b5cf6",
      fill: "rgba(139, 92, 246, 0.1)",
    },
  },
};

// ========== Animation Configuration ==========
export const animations = {
  fadeIn: "animate-fade-in",
  slideUp: "animate-slide-up",
  slideDown: "animate-slide-down",
  scaleIn: "animate-scale-in",
  pulse: "animate-pulse",
  shimmer: "animate-shimmer",
};

// ========== Real-time Update Configuration ==========
export const REALTIME_UPDATE_INTERVAL = 5000; // 5 seconds

export const POLLING_INTERVALS = {
  metrics: 5000,
  projects: 30000,
  revenue: 60000,
  copilot: 60000,
  heatmap: 3600000, // 1 hour
};

// ========== Performance Configuration ==========
export const PERFORMANCE = {
  maxMetricsToRender: 50,
  chartPointLimit: 100,
  debounceTime: 300,
  throttleTime: 1000,
};

// ========== Responsive Breakpoints ==========
export const BREAKPOINTS = {
  xs: "320px",
  sm: "640px",
  md: "768px",
  lg: "1024px",
  xl: "1280px",
  "2xl": "1536px",
};

// ========== Dashboard Layout Configuration ==========
export const LAYOUT = {
  sidebarWidth: "280px",
  headerHeight: "80px",
  contentPadding: "24px",
  gap: "24px",
  cardGap: "16px",
  chartHeight: "300px",
  metricCardHeight: "120px",
};

// ========== Premium Typography ==========
export const typography = {
  fontFamily: {
    primary: "Inter, sans-serif",
    secondary: "Manrope, sans-serif",
    mono: "Fira Code, monospace",
  },
  fontWeights: {
    thin: 300,
    normal: 400,
    medium: 500,
    semibold: 600,
    bold: 700,
    extrabold: 800,
  },
  letterSpacing: {
    tighter: "-0.05em",
    tight: "-0.025em",
    normal: "0",
    wide: "0.025em",
    wider: "0.05em",
  },
};

// ========== Export Configuration ==========
export const EXPORT_CONFIG = {
  csv: {
    delimiter: ",",
    includeHeaders: true,
    decimalPlaces: 2,
  },
  json: {
    prettyPrint: true,
    indent: 2,
  },
  pdf: {
    pageSize: "A4",
    orientation: "portrait",
    includeCharts: true,
  },
};

// ========== Role-based Permissions ==========
export const ROLE_PERMISSIONS = {
  admin: {
    canViewMetrics: true,
    canViewProjects: true,
    canViewRevenue: true,
    canViewCopilot: true,
    canExportData: true,
    canManageUsers: true,
  },
  manager: {
    canViewMetrics: true,
    canViewProjects: true,
    canViewRevenue: true,
    canViewCopilot: true,
    canExportData: true,
    canManageUsers: false,
  },
  developer: {
    canViewMetrics: true,
    canViewProjects: true,
    canViewRevenue: false,
    canViewCopilot: true,
    canExportData: false,
    canManageUsers: false,
  },
  viewer: {
    canViewMetrics: true,
    canViewProjects: true,
    canViewRevenue: false,
    canViewCopilot: false,
    canExportData: false,
    canManageUsers: false,
  },
};

// ========== Time Range Options ==========
export const TIME_RANGES = [
  { value: "today", label: "Today" },
  { value: "week", label: "Last 7 Days" },
  { value: "month", label: "Last 30 Days" },
  { value: "quarter", label: "Last 3 Months" },
  { value: "year", label: "Last 12 Months" },
];

// ========== Project Status Colors ==========
export const PROJECT_STATUS_COLORS = {
  not_started: "text-gray-400",
  in_progress: "text-blue-400",
  on_hold: "text-amber-400",
  completed: "text-emerald-400",
  cancelled: "text-rose-400",
};

// ========== Revenue Status Colors ==========
export const REVENUE_STATUS_COLORS = {
  paid: "text-emerald-400",
  pending: "text-amber-400",
  overdue: "text-rose-400",
};

export type GlassMorphismProps = VariantProps<typeof glassMorphism>;
export type MetricCardProps = VariantProps<typeof metricCard>;
