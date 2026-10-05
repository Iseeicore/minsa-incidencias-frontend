export const EstadoDerivacion = {
  PENDIENTE: "pendiente",
  REALIZADA: "realizada",
  REASIGNADA: "reasignada",
  FUERA_COMPETENCIA: "fuera-competencia",
} as const;
export type EstadoDerivacion = (typeof EstadoDerivacion)[keyof typeof EstadoDerivacion];
