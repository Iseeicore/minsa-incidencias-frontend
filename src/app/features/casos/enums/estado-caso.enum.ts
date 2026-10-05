export const EstadoCaso = {
  NUEVO: "nuevo",
  EN_ATENCION: "en-atencion",
  DERIVADO: "derivado",
  VENCIDO: "vencido",
  CERRADO: "cerrado",
} as const;
export type EstadoCaso = (typeof EstadoCaso)[keyof typeof EstadoCaso];
