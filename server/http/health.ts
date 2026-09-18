import { AppError } from "./errors";

export type HealthResponse = {
  data: { status: "ok" };
  meta: { requestId: string };
};

export async function getHealthResponse(
  checkDatabase: () => Promise<void>,
  requestId: string,
): Promise<HealthResponse> {
  try {
    await checkDatabase();
    return { data: { status: "ok" }, meta: { requestId } };
  } catch {
    throw new AppError("SERVICE_UNAVAILABLE", "Database is unavailable", 503);
  }
}
