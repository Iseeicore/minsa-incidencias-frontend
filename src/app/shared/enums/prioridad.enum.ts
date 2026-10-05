export const Prioridad = {
  ALTA: "alta",
  MEDIA: "media",
  BAJA: "baja",
} as const;
export type Prioridad = (typeof Prioridad)[keyof typeof Prioridad];
