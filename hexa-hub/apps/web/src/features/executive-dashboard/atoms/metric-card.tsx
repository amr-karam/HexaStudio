/**
 * Executive Dashboard Metric Card Atom
 * Premium glass morphism metric display card
 */

import { motion } from "framer-motion";
import { glassMorphism } from "../config/dashboard-config";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  variant?: "primary" | "success" | "warning" | "danger" | "info";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
  isLoading?: boolean;
  className?: string;
}

export const MetricCard = ({
  title,
  value,
  subtitle,
  icon,
  variant = "primary",
  size = "md",
  onClick,
  isLoading = false,
  className = "",
}: MetricCardProps) => {
  return (
    <motion.div
      initial={false}
      whileHover={onClick ? { y: -4 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      transition={{ type: "spring", damping: 25, stiffness: 400 }}
      className={glassMorphism({
        size,
        className: `flex flex-col ${className}`,
      })}
      style={{
        background: variant
          ? "linear-gradient(135deg, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0.05) 100%)"
          : undefined,
      }}
    >
      <div className="flex items-center justify-between w-full">
        <div className="flex items-center gap-2">
          {icon && <div className="text-2xl opacity-80">{icon}</div>}
          <h3 className="text-sm font-medium text-white/90 truncate">{title}</h3>
        </div>
        {onClick && (
          <button
            onClick={onClick}
            className="p-1 rounded-lg hover:bg-white/20 transition-colors"
            aria-label={`View details for ${title}`}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M9 18l6-6-6-6" />
            </svg>
          </button>
        )}
      </div>

      <div className="flex items-end gap-2 mt-2">
        {isLoading ? (
          <div className="h-8 w-20 bg-white/20 rounded animate-pulse" />
        ) : (
          <span className="text-2xl font-bold text-white">{value}</span>
        )}
      </div>

      {subtitle && (
        <p className="text-xs text-white/60 mt-1 truncate">{subtitle}</p>
      )}
    </motion.div>
  );
};
