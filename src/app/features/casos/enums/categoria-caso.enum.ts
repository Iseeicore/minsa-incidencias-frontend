export const CategoriaCaso = {
  RECLAMO: "reclamo",
  QUEJA: "queja",
  CORRUPCION: "corrupcion",
} as const;
export type CategoriaCaso = (typeof CategoriaCaso)[keyof typeof CategoriaCaso];
