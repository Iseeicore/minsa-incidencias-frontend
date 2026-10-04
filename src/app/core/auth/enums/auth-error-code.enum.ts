export const AuthErrorCode = {
  INVALID_CREDENTIALS: "INVALID_CREDENTIALS",
  ACCOUNT_LOCKED: "ACCOUNT_LOCKED",
  TOO_MANY_ATTEMPTS: "TOO_MANY_ATTEMPTS",
  NETWORK: "NETWORK",
  UNKNOWN: "UNKNOWN",
} as const;
export type AuthErrorCode = (typeof AuthErrorCode)[keyof typeof AuthErrorCode];
