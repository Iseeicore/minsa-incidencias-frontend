export const RolDemo = {
  ADMINISTRADOR: "ADMINISTRADOR",
  GESTOR: "GESTOR",
  AREA_RECLAMO: "AREA_RECLAMO",
  AREA_QUEJA: "AREA_QUEJA",
  AREA_DENUNCIA_CORRUPCION: "AREA_DENUNCIA_CORRUPCION",
} as const;
export type RolDemo = (typeof RolDemo)[keyof typeof RolDemo];
