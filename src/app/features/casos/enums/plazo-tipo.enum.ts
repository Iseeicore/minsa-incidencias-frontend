export const PlazoTipo = {
  ATENCION: "atencion",
  VIGENCIA: "vigencia",
} as const;
export type PlazoTipo = (typeof PlazoTipo)[keyof typeof PlazoTipo];
