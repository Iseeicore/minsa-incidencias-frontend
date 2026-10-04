export const ROUTE_PATH = {
  LOGIN: "login",
  INICIO: "inicio",
} as const;

export const ROUTE = {
  LOGIN: `/${ROUTE_PATH.LOGIN}`,
  INICIO: `/${ROUTE_PATH.INICIO}`,
} as const;
