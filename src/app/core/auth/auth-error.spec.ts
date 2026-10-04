import { HttpErrorResponse } from "@angular/common/http";
import { toAuthError } from "./auth-error";
import { AuthErrorCode } from "./enums/auth-error-code.enum";

describe("toAuthError", () => {
  it.each([
    [401, AuthErrorCode.INVALID_CREDENTIALS],
    [423, AuthErrorCode.ACCOUNT_LOCKED],
    [429, AuthErrorCode.TOO_MANY_ATTEMPTS],
    [0, AuthErrorCode.NETWORK],
    [500, AuthErrorCode.UNKNOWN],
  ])("traduce el estado HTTP %i", (status, code) => {
    expect(toAuthError(new HttpErrorResponse({ status })).code).toBe(code);
  });

  it("trata un error que no es HTTP como desconocido", () => {
    expect(toAuthError(new Error("x")).code).toBe(AuthErrorCode.UNKNOWN);
  });
});
