export type ErrorBody = {
  error: {
    code: string;
    message: string;
    requestId: string;
  };
};

export class AppError extends Error {
  public constructor(
    public readonly code: string,
    message: string,
    public readonly status: number,
  ) {
    super(message);
  }
}

export function toErrorBody(error: unknown, requestId: string): ErrorBody {
  if (error instanceof AppError) {
    return { error: { code: error.code, message: error.message, requestId } };
  }

  return {
    error: {
      code: "INTERNAL_ERROR",
      message: "An unexpected error occurred",
      requestId,
    },
  };
}
