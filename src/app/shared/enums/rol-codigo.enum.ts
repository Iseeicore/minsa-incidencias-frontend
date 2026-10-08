export const RolCodigo = {
  ADMINISTRADOR: "ADMINISTRADOR",
  GESTOR: "GESTOR",
  OTRANS: "OTRANS",
  ESTABLECIMIENTO: "ESTABLECIMIENTO",
} as const;
export type RolCodigo = (typeof RolCodigo)[keyof typeof RolCodigo];
