import dotenv from "dotenv";

dotenv.config();

if (!process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is required");
}

// Parse CORS_ORIGIN as a comma-separated list of allowed origins.
// A wildcard ("*") is NOT permitted together with credentials: true.
const parseCorsOrigins = (raw: string | undefined): string[] => {
  const value = (raw ?? "http://localhost:3000,http://localhost:3001")
    .split(",")
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
  if (value.includes("*")) {
    throw new Error("CORS_ORIGIN must not contain '*' — credentials are enabled");
  }
  return value;
};

export const config = {
  port: Number(process.env.PORT) || 3001,
  redis: {
    url: process.env.REDIS_URL || "redis://localhost:6379",
  },
  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: process.env.JWT_EXPIRES_IN || "1h",
  },
  heartbeat: {
    interval: Number(process.env.HEARTBEAT_INTERVAL) || 25_000,
    timeout: Number(process.env.HEARTBEAT_TIMEOUT) || 60_000,
  },
  cors: {
    origin: parseCorsOrigins(process.env.CORS_ORIGIN),
    credentials: true,
  },
  rateLimit: {
    maxMessagesPerSecond: Number(process.env.RATE_LIMIT_MAX_MSGS_PER_SEC) || 50,
    windowMs: Number(process.env.RATE_LIMIT_WINDOW_MS) || 1_000,
    maxConnectionsPerIp: Number(process.env.RATE_LIMIT_MAX_CONNS_PER_IP) || 10,
  },
  sentry: {
    dsn: process.env.SENTRY_DSN || "",
    tracesSampleRate: Number(process.env.SENTRY_TRACES_SAMPLE_RATE) || 0.1,
    profilesSampleRate: Number(process.env.SENTRY_PROFILES_SAMPLE_RATE) || 0.1,
  },
  nodeEnv: process.env.NODE_ENV || "development",
} as const;
