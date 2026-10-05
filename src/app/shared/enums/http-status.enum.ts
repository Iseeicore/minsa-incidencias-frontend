export const HttpStatus = {
  NETWORK: 0,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  UNPROCESSABLE: 422,
  LOCKED: 423,
  TOO_MANY_REQUESTS: 429,
  BAD_GATEWAY: 502,
} as const;
export type HttpStatus = (typeof HttpStatus)[keyof typeof HttpStatus];
