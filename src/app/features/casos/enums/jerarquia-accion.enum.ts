export const JerarquiaAccion = {
  PRINCIPAL: "principal",
  SECUNDARIA: "secundaria",
  DESTRUCTIVA: "destructiva",
} as const;
export type JerarquiaAccion = (typeof JerarquiaAccion)[keyof typeof JerarquiaAccion];
