export const Periodo = {
  SIETE_DIAS: "7d",
  TREINTA_DIAS: "30d",
  NOVENTA_DIAS: "90d",
} as const;
export type Periodo = (typeof Periodo)[keyof typeof Periodo];
