export type DataAccessErrorCode =
  | "CONFIG_ERROR"
  | "QUERY_ERROR"
  | "NOT_FOUND"
  | "VALIDATION_ERROR";

export class DataAccessError extends Error {
  readonly code: DataAccessErrorCode;
  readonly cause?: unknown;

  constructor(
    message: string,
    options: { code: DataAccessErrorCode; cause?: unknown } = { code: "QUERY_ERROR" },
  ) {
    super(message);
    this.name = "DataAccessError";
    this.code = options.code;
    this.cause = options.cause;
  }
}

export function wrapDataAccessError(
  message: string,
  cause: unknown,
  code: DataAccessErrorCode = "QUERY_ERROR",
): DataAccessError {
  return new DataAccessError(message, { code, cause });
}
