export const AccionCaso = {
  CONFIRMAR: "confirmar",
  CORREGIR: "corregir",
  DERIVAR: "derivar",
  TOMAR: "tomar",
  RESOLVER: "resolver",
  ARCHIVAR: "archivar",
  REABRIR: "reabrir",
} as const;
export type AccionCaso = (typeof AccionCaso)[keyof typeof AccionCaso];
