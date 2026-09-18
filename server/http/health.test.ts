// @vitest-environment node
import { describe, expect, it } from "vitest";
import { AppError, toErrorBody } from "./errors";
import { getHealthResponse } from "./health";

describe("health response", () => {
  it("returns a versioned success payload when the database is reachable", async () => {
    await expect(getHealthResponse(async () => undefined, "request-1")).resolves.toEqual({
      data: { status: "ok" },
      meta: { requestId: "request-1" },
    });
  });

  it("returns a sanitized service error when the database is unavailable", async () => {
    await expect(getHealthResponse(async () => Promise.reject(new Error("secret connection detail")), "request-2"))
      .rejects.toEqual(new AppError("SERVICE_UNAVAILABLE", "Database is unavailable", 503));
  });

  it("formats application errors using the shared API error contract", () => {
    expect(toErrorBody(new AppError("VALIDATION_ERROR", "Invalid request", 400), "request-3")).toEqual({
      error: { code: "VALIDATION_ERROR", message: "Invalid request", requestId: "request-3" },
    });
  });
});
