export const BandejaTab = {
  ASIGNADOS: "asignados",
  PENDIENTES: "pendientes",
  PROXIMOS: "proximos",
  VENCIDOS: "vencidos",
  DEVUELTOS: "devueltos",
  REVISION_IA: "revision-ia",
} as const;
export type BandejaTab = (typeof BandejaTab)[keyof typeof BandejaTab];
