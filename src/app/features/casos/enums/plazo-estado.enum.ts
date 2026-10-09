export const PlazoEstado = {
  EN_PLAZO: "en-plazo",
  POR_VENCER: "por-vencer",
  VENCIDO: "vencido",
} as const;
export type PlazoEstado = (typeof PlazoEstado)[keyof typeof PlazoEstado];
