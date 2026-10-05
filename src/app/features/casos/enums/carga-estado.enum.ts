export const CargaEstado = {
  INICIAL: "inicial",
  CARGANDO: "cargando",
  LISTO: "listo",
  ERROR: "error",
} as const;
export type CargaEstado = (typeof CargaEstado)[keyof typeof CargaEstado];
