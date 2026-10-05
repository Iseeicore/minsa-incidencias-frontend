export const ModoPanel = {
  NINGUNO: "ninguno",
  CORREGIR: "corregir",
  RESOLVER: "resolver",
} as const;
export type ModoPanel = (typeof ModoPanel)[keyof typeof ModoPanel];
