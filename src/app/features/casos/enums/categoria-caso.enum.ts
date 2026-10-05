export const CategoriaCaso = {
  DENUNCIA_CORRUPCION: "denuncia-corrupcion",
  QUEJA: "queja",
  RECLAMO: "reclamo",
  OTRO: "otro",
} as const;
export type CategoriaCaso = (typeof CategoriaCaso)[keyof typeof CategoriaCaso];
