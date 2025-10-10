type Level = "debug" | "info" | "warn" | "error";

function log(level: Level, message: string, meta?: unknown) {
  const ts = new Date().toISOString();
  const payload = meta !== undefined ? { message, meta } : { message };
  console[level](`[${ts}] ${level.toUpperCase()}:`, payload);
}

export const logger = {
  debug: (m: string, meta?: unknown) => log("debug", m, meta),
  info: (m: string, meta?: unknown) => log("info", m, meta),
  warn: (m: string, meta?: unknown) => log("warn", m, meta),
  error: (m: string, meta?: unknown) => log("error", m, meta),
};
