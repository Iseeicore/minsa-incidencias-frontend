export const FiltroTab = {
  TODOS: "todos",
  RECLAMOS: "reclamos",
  QUEJAS: "quejas",
  CORRUPCION: "corrupcion",
  CRITICOS: "criticos",
} as const;
export type FiltroTab = (typeof FiltroTab)[keyof typeof FiltroTab];
