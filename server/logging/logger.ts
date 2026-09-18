type LogContext = {
  requestId: string;
  endpoint: string;
  status: number;
  latencyMs: number;
  userId?: string;
  childId?: string;
  errorCode?: string;
};

export function logRequest(context: LogContext): void {
  console.info(JSON.stringify({ level: "info", event: "request_completed", ...context }));
}

export function logError(context: LogContext): void {
  console.error(JSON.stringify({ level: "error", event: "request_failed", ...context }));
}
