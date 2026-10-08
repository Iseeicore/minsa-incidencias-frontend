import { IncidenciaError, RespuestaInvalidaError } from "@/features/casos/services/incidencia-error";
import { MENSAJE_USUARIOS } from "@/features/usuarios/constants/usuarios-constants";
import { UsuarioErrorCode } from "@/features/usuarios/enums/usuario-error-code.enum";
import { HttpStatus } from "@/shared/enums/http-status.enum";

const MENSAJE_DE_CONFLICTO: Readonly<Record<string, string>> = {
  [UsuarioErrorCode.LIMITE_USUARIOS_ESTABLECIMIENTO]: MENSAJE_USUARIOS.LIMITE_USUARIOS,
  [UsuarioErrorCode.CORREO_REPETIDO]: MENSAJE_USUARIOS.CORREO_REPETIDO,
  [UsuarioErrorCode.AUTOEDICION_NO_PERMITIDA]: MENSAJE_USUARIOS.AUTOEDICION,
};

/** Mensaje para la persona según el estado y el código del error; nunca repite el texto que mande el servidor. */
export function mensajeDeErrorUsuario(error: unknown): string {
  if (error instanceof RespuestaInvalidaError) return MENSAJE_USUARIOS.RESPUESTA_INESPERADA;
  if (!(error instanceof IncidenciaError)) return MENSAJE_USUARIOS.GENERICO;
  switch (error.estado) {
    case HttpStatus.NETWORK:
      return MENSAJE_USUARIOS.SIN_CONEXION;
    case HttpStatus.BAD_REQUEST:
      return MENSAJE_USUARIOS.DATOS_NO_VALIDOS;
    case HttpStatus.FORBIDDEN:
      return MENSAJE_USUARIOS.SIN_PERMISO;
    case HttpStatus.NOT_FOUND:
      return MENSAJE_USUARIOS.NO_DISPONIBLE;
    case HttpStatus.CONFLICT:
      return (error.codigo && MENSAJE_DE_CONFLICTO[error.codigo]) || MENSAJE_USUARIOS.CONFLICTO;
    case HttpStatus.UNPROCESSABLE:
      return MENSAJE_USUARIOS.AREA_O_ROL_NO_VALIDOS;
    case HttpStatus.TOO_MANY_REQUESTS:
      return MENSAJE_USUARIOS.DEMASIADAS_PETICIONES;
    default:
      return MENSAJE_USUARIOS.GENERICO;
  }
}
