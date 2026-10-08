export const ModoPanel = {
  NINGUNO: "ninguno",
  CORREGIR: "corregir",
  DERIVAR: "derivar",
  RESOLVER: "resolver",
  ARCHIVAR: "archivar",
  REABRIR: "reabrir",
} as const;
export type ModoPanel = (typeof ModoPanel)[keyof typeof ModoPanel];
