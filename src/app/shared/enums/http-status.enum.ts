export const HttpStatus = {
  UNAUTHORIZED: 401,
  LOCKED: 423,
  TOO_MANY_REQUESTS: 429,
} as const;
export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus];
