export const UsuarioErrorCode = {
  LIMITE_USUARIOS_ESTABLECIMIENTO: "LIMITE_USUARIOS_ESTABLECIMIENTO",
  CORREO_REPETIDO: "CORREO_REPETIDO",
  AUTOEDICION_NO_PERMITIDA: "AUTOEDICION_NO_PERMITIDA",
} as const;
export type UsuarioErrorCode = (typeof UsuarioErrorCode)[keyof typeof UsuarioErrorCode];
