export const FiltroActivoId = {
  ESTADO: "estado",
  CATEGORIA: "categoria",
  MOTIVO: "motivo",
  ESTABLECIMIENTO: "establecimiento",
  FECHAS: "fechas",
  TEXTO: "texto",
} as const;
export type FiltroActivoId = (typeof FiltroActivoId)[keyof typeof FiltroActivoId];
