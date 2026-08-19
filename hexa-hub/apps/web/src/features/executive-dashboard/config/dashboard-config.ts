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
    primary: "linear-gradient(135deg, var(--color-info) 0%, var(--color-metric-violet) 100%)",
    secondary: "linear-gradient(135deg, var(--color-metric-violet) 0%, var(--color-error) 100%)",
    success: "linear-gradient(135deg, var(--color-info) 0%, var(--color-metric-teal) 100%)",
    warning: "linear-gradient(135deg, var(--color-error) 0%, var(--color-metric-amber) 100%)",
    danger: "linear-gradient(135deg, var(--color-error) 0%, var(--color-gold) 100%)",
    info: "linear-gradient(135deg, var(--color-metric-teal) 0%, var(--color-gold) 100%)",
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
    primary: 'var(--color-obsidian-raised)',
    secondary: 'var(--color-tertiary)',
    muted: 'var(--color-tertiary)',
    light: 'var(--color-secondary)',
    dark: 'var(--color-border)',
    white: '#ffffff', // Used for PDF/HTML export — CSS var not available in print context
  },
  
  // Premium background colors
  background: {
    primary: 'var(--color-void-deep)',
    secondary: 'var(--color-obsidian-raised)',
    tertiary: 'var(--color-border)',
    surface: 'var(--color-obsidian-raised)',
    surfaceHover: 'var(--color-info)',
    surfaceActive: 'var(--color-info-dark)',
    glass: "rgba(31, 41, 55, 0.5)",
    glassLight: "rgba(255, 255, 255, 0.05)",
  },
  
  // Premium accent colors
  accent: {
    primary: 'var(--color-info)',
    secondary: 'var(--color-metric-violet)',
    success: 'var(--color-success)',
    warning: 'var(--color-warning)',
    danger: 'var(--color-error)',
    info: 'var(--color-info)',
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
      stroke: 'var(--color-info)',
      strokeWidth: 3,
      fill: "rgba(59, 130, 246, 0.1)",
    },
    bar: {
      fill: 'var(--color-info)',
    },
  },
  projects: {
    completed: {
      stroke: 'var(--color-success)',
      fill: "rgba(16, 185, 129, 0.1)",
    },
    inProgress: {
      stroke: 'var(--color-warning)',
      fill: "rgba(245, 158, 11, 0.1)",
    },
  },
  copilot: {
    sessions: {
      stroke: 'var(--color-metric-violet)',
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
  in_progress: "text-info",
  on_hold: "text-amber-400",
  completed: "text-success",
  cancelled: "text-rose-400",
};

// ========== Revenue Status Colors ==========
export const REVENUE_STATUS_COLORS = {
  paid: "text-success",
  pending: "text-amber-400",
  overdue: "text-rose-400",
};

export type GlassMorphismProps = VariantProps<typeof glassMorphism>;
export type MetricCardProps = VariantProps<typeof metricCard>;
