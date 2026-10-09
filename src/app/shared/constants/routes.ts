export const ROUTE_PATH = {
  LOGIN: "login",
  INICIO: "inicio",
  BANDEJA: "bandeja",
  CASOS_ANTIGUA: "casos",
  BANDEJAS_ANTIGUA: "bandejas",
  DERIVACIONES: "derivaciones",
  QR: "qr",
  USUARIOS: "usuarios",
  SIN_ACCESO: "sin-acceso",
} as const;

export const ROUTE = {
  LOGIN: `/${ROUTE_PATH.LOGIN}`,
  INICIO: `/${ROUTE_PATH.INICIO}`,
  BANDEJA: `/${ROUTE_PATH.BANDEJA}`,
  DERIVACIONES: `/${ROUTE_PATH.DERIVACIONES}`,
  QR: `/${ROUTE_PATH.QR}`,
  USUARIOS: `/${ROUTE_PATH.USUARIOS}`,
  SIN_ACCESO: `/${ROUTE_PATH.SIN_ACCESO}`,
} as const;
