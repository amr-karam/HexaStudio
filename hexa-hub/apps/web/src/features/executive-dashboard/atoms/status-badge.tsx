/**
 * Executive Dashboard Status Badge Atom
 * Premium status indicator with color coding
 */

import { motion } from "framer-motion";
import { getStatusColor, formatStatus } from "../utils/formatters";

interface StatusBadgeProps {
  status: string;
  type?: "user" | "project" | "revenue" | "copilot";
  size?: "sm" | "md" | "lg";
  showIcon?: boolean;
  className?: string;
}

export const StatusBadge = ({
  status,
  type = "user",
  size = "md",
  showIcon = true,
  className = "",
}: StatusBadgeProps) => {
  const formattedStatus = formatStatus(status, type);
  const statusColor = getStatusColor(status, type);

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1.5 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.2 }}
      className={`inline-flex items-center gap-1.5 rounded-full font-medium ${sizeClasses[size]} ${className}`}
      style={{ backgroundColor: statusColor + "20", color: statusColor }}
    >
      {showIcon && (
        <span
          className="w-2 h-2 rounded-full"
          style={{ backgroundColor: statusColor }}
        />
      )}
      <span>{formattedStatus}</span>
    </motion.span>
  );
};
