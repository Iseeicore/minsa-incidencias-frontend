export const BandejaTab = {
  POR_REVISAR: "por-revisar",
  EN_GESTION: "en-gestion",
  DERIVADOS: "derivados",
  RESUELTOS: "resueltos",
  ARCHIVADOS: "archivados",
  TODOS: "todos",
} as const;
export type BandejaTab = (typeof BandejaTab)[keyof typeof BandejaTab];
