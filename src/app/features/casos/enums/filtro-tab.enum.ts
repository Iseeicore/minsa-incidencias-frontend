export const FiltroTab = {
  TODOS: "todos",
  RECLAMOS: "reclamos",
  QUEJAS: "quejas",
  CORRUPCION: "corrupcion",
  OTRO: "otro",
  SIN_CATEGORIA: "sin-categoria",
} as const;
export type FiltroTab = (typeof FiltroTab)[keyof typeof FiltroTab];
