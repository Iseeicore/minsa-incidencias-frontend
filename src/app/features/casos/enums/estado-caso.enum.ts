export const EstadoCaso = {
  REGISTRADO: "registrado",
  CLASIFICADO: "clasificado",
  DERIVADO: "derivado",
  EN_GESTION: "en-gestion",
  RESUELTO: "resuelto",
  ARCHIVADO: "archivado",
} as const;
export type EstadoCaso = (typeof EstadoCaso)[keyof typeof EstadoCaso];
