export const AccionCaso = {
  CONFIRMAR: "confirmar",
  CORREGIR: "corregir",
  DERIVAR: "derivar",
  TOMAR: "tomar",
  RESOLVER: "resolver",
} as const;
export type AccionCaso = (typeof AccionCaso)[keyof typeof AccionCaso];
