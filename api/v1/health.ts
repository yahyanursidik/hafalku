import type { VercelRequest, VercelResponse } from "@vercel/node";
import { randomUUID } from "node:crypto";
import { checkDatabaseConnection } from "../../server/db/client";
import { AppError, toErrorBody } from "../../server/http/errors";
import { getHealthResponse } from "../../server/http/health";
import { logError, logRequest } from "../../server/logging/logger";

export default async function handler(request: VercelRequest, response: VercelResponse) {
  const requestId = randomUUID();
  const startedAt = performance.now();
  const endpoint = "/api/v1/health";

  if (request.method !== "GET") {
    const error = new AppError("METHOD_NOT_ALLOWED", "Method not allowed", 405);
    response.setHeader("Allow", "GET");
    response.status(error.status).json(toErrorBody(error, requestId));
    logRequest({ requestId, endpoint, status: error.status, latencyMs: performance.now() - startedAt });
    return;
  }

  try {
    const health = await getHealthResponse(checkDatabaseConnection, requestId);
    response.status(200).json(health);
    logRequest({ requestId, endpoint, status: 200, latencyMs: performance.now() - startedAt });
  } catch (error) {
    const status = error instanceof AppError ? error.status : 500;
    const body = toErrorBody(error, requestId);
    response.status(status).json(body);
    logError({ requestId, endpoint, status, latencyMs: performance.now() - startedAt, errorCode: body.error.code });
  }
}
