import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { z } from "zod";
import { AppError, toErrorBody } from "../http/errors";
import { logError, logRequest } from "../logging/logger";

type QuranResponse = { data: unknown; meta: Record<string, unknown> };

export function getQueryValue(request: VercelRequest, name: string): string | undefined {
  const value = request.query[name];
  if (Array.isArray(value)) throw new AppError("VALIDATION_ERROR", `Query parameter ${name} must not be repeated`, 400);
  return value;
}

export function requireRouteValue(request: VercelRequest, name: string): string {
  const value = getQueryValue(request, name);
  if (!value) throw new AppError("VALIDATION_ERROR", `Missing route parameter ${name}`, 400);
  return value;
}

function asAppError(error: unknown): AppError | undefined {
  if (error instanceof AppError) return error;
  if (error instanceof z.ZodError) return new AppError("VALIDATION_ERROR", "Invalid request", 400);
  return undefined;
}

export async function respondToQuranGet(
  request: VercelRequest,
  response: VercelResponse,
  endpoint: string,
  getData: () => Promise<QuranResponse>,
): Promise<void> {
  const requestId = randomUUID();
  const startedAt = performance.now();

  if (request.method !== "GET") {
    const error = new AppError("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    response.setHeader("Allow", "GET");
    response.status(error.status).json(toErrorBody(error, requestId));
    logRequest({ requestId, endpoint, status: error.status, latencyMs: performance.now() - startedAt });
    return;
  }

  try {
    const result = await getData();
    response.status(200).json({ data: result.data, meta: { ...result.meta, requestId } });
    logRequest({ requestId, endpoint, status: 200, latencyMs: performance.now() - startedAt });
  } catch (error) {
    const appError = asAppError(error);
    const status = appError?.status ?? 500;
    const body = toErrorBody(appError ?? error, requestId);
    response.status(status).json(body);
    logError({ requestId, endpoint, status, latencyMs: performance.now() - startedAt, errorCode: body.error.code });
  }
}
