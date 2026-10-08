export const ModoPanel = {
  NINGUNO: "ninguno",
  CORREGIR: "corregir",
  DERIVAR: "derivar",
  RESOLVER: "resolver",
} as const;
export type ModoPanel = (typeof ModoPanel)[keyof typeof ModoPanel];
