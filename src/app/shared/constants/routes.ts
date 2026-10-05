export const ROUTE_PATH = {
  LOGIN: "login",
  INICIO: "inicio",
  CASOS: "casos",
} as const;

export const ROUTE = {
  LOGIN: `/${ROUTE_PATH.LOGIN}`,
  INICIO: `/${ROUTE_PATH.INICIO}`,
  CASOS: `/${ROUTE_PATH.CASOS}`,
} as const;
