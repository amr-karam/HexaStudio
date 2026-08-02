/**
 * Executive Dashboard Error Message Atom
 * Premium error display with retry functionality
 */

import { motion } from "framer-motion";

interface ErrorMessageProps {
  message: string;
  onRetry?: () => void;
  className?: string;
}

export const ErrorMessage = ({ message, onRetry, className = "" }: ErrorMessageProps) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`p-4 rounded-xl bg-rose-500/20 border border-rose-500/40 text-rose-200 ${className}`}
    >
      <div className="flex items-start gap-3">
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
          className="text-rose-400 mt-0.5 flex-shrink-0"
        >
          <circle cx="12" cy="12" r="10" />
          <path d="M12 8v4M12 16h.01" />
        </svg>
        <div className="flex-1">
          <h3 className="font-medium text-sm">Error Loading Data</h3>
          <p className="text-xs mt-1 opacity-80">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className="mt-2 px-3 py-1 text-xs bg-rose-500/30 rounded hover:bg-rose-500/40 transition-colors"
            >
              Retry
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
};
