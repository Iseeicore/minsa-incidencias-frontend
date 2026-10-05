export const BandejaTab = {
  PARA_ACTUAR: "para-actuar",
  REVISION_IA: "revision-ia",
  POR_DERIVAR: "por-derivar",
  EN_GESTION: "en-gestion",
  POR_VENCER: "por-vencer",
  RESUELTOS: "resueltos",
  ARCHIVADOS: "archivados",
} as const;
export type BandejaTab = (typeof BandejaTab)[keyof typeof BandejaTab];
