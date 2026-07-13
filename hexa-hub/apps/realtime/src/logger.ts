export const logger = {
  info: (msg: string, ...args: any[]) => {
    console.log(`[INFO] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  error: (msg: string, ...args: any[]) => {
    console.error(`[ERROR] ${new Date().toISOString()} - ${msg}`, ...args);
  },
  warn: (msg: string, ...args: any[]) => {
    console.warn(`[WARN] ${new Date().toISOString()} - ${msg}`, ...args);
  },
};
