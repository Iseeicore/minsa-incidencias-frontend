import { HttpErrorResponse } from "@angular/common/http";
import { HttpStatus } from "@/shared/enums/http-status.enum";
import { AuthErrorCode } from "./enums/auth-error-code.enum";

const STATUS_TO_CODE: Record<number, AuthErrorCode> = {
  [HttpStatus.UNAUTHORIZED]: AuthErrorCode.INVALID_CREDENTIALS,
  [HttpStatus.LOCKED]: AuthErrorCode.ACCOUNT_LOCKED,
  [HttpStatus.TOO_MANY_REQUESTS]: AuthErrorCode.TOO_MANY_ATTEMPTS,
};

export class AuthError extends Error {
  constructor(readonly code: AuthErrorCode) {
    super(code);
  }
}

export function toAuthError(error: unknown): AuthError {
  if (!(error instanceof HttpErrorResponse)) return new AuthError(AuthErrorCode.UNKNOWN);
  if (error.status === 0) return new AuthError(AuthErrorCode.NETWORK);
  return new AuthError(STATUS_TO_CODE[error.status] ?? AuthErrorCode.UNKNOWN);
}
