export const ROUTE_PATH = {
  LOGIN: "login",
  INICIO: "inicio",
  CASOS: "casos",
  BANDEJAS: "bandejas",
  DERIVACIONES: "derivaciones",
  SIN_ACCESO: "sin-acceso",
} as const;

export const ROUTE = {
  LOGIN: `/${ROUTE_PATH.LOGIN}`,
  INICIO: `/${ROUTE_PATH.INICIO}`,
  CASOS: `/${ROUTE_PATH.CASOS}`,
  BANDEJAS: `/${ROUTE_PATH.BANDEJAS}`,
  DERIVACIONES: `/${ROUTE_PATH.DERIVACIONES}`,
  SIN_ACCESO: `/${ROUTE_PATH.SIN_ACCESO}`,
} as const;
