type LogFn = (msg: string, ...args: unknown[]) => void;

export const logger: Record<string, LogFn> = {
  info: (msg, ...args) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  error: (msg, ...args) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  warn: (msg, ...args) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  debug: (msg, ...args) => {
    if (process.env.NODE_ENV === 'development' || process.env.DEBUG) {
      console.debug(`[DEBUG] ${new Date().toISOString()} - ${msg}`, ...args);
    }
  },
};
