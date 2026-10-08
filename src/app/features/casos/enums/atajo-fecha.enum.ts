export const AtajoFecha = {
  HOY: "hoy",
  SIETE_DIAS: "7-dias",
  TREINTA_DIAS: "30-dias",
  ESTE_MES: "este-mes",
} as const;
export type AtajoFecha = (typeof AtajoFecha)[keyof typeof AtajoFecha];
