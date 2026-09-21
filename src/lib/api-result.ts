export type ApiError = { code: string; message: string };
export type ApiResult<T> = { success: true; data: T } | { success: false; error: ApiError };

export function ok<T>(data: T): ApiResult<T> {
  return { success: true, data };
}

export function fail(code: string, message: string): ApiResult<never> {
  return { success: false, error: { code, message } };
}

export class AppError extends Error {
  code: string;
  status: number;

  constructor(code: string, message: string, status = 400) {
    super(message);
    this.code = code;
    this.status = status;
  }
}
