import { HttpErrorResponse } from "@angular/common/http";
import { MENSAJE_ERROR } from "@/features/casos/constants/casos-messages";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { HttpStatus } from "@/shared/enums/http-status.enum";

export class IncidenciaError extends Error {
  constructor(
    readonly estado: number,
    readonly codigo: string | null,
  ) {
    super(`El servicio de incidencias respondió ${estado}`);
    this.name = "IncidenciaError";
  }
}

export class RespuestaInvalidaError extends IncidenciaError {
  constructor(readonly campo: string) {
    super(HttpStatus.BAD_GATEWAY, null);
    this.name = "RespuestaInvalidaError";
  }
}

function codigoDe(cuerpo: unknown): string | null {
  if (typeof cuerpo !== "object" || cuerpo === null) return null;
  const codigo = (cuerpo as { errorCode?: unknown }).errorCode;
  return typeof codigo === "string" ? codigo : null;
}

export function toIncidenciaError(error: unknown): IncidenciaError {
  if (error instanceof IncidenciaError) return error;
  if (error instanceof HttpErrorResponse) return new IncidenciaError(error.status, codigoDe(error.error));
  return new IncidenciaError(HttpStatus.NETWORK, null);
}

const MENSAJE_NO_PROCESABLE: Partial<Record<AccionCaso, string>> = {
  [AccionCaso.CORREGIR]: MENSAJE_ERROR.CATEGORIA_IGUAL,
  [AccionCaso.DERIVAR]: MENSAJE_ERROR.AREA_DESTINO_INVALIDA,
  [AccionCaso.ARCHIVAR]: MENSAJE_ERROR.ARCHIVO_NO_VALIDO,
  [AccionCaso.REABRIR]: MENSAJE_ERROR.REAPERTURA_NO_VALIDA,
  [AccionCaso.RESOLVER]: MENSAJE_ERROR.RESOLUCION_NO_VALIDA,
};

function mensajeDeNoProcesable(accion?: AccionCaso): string {
  return (accion && MENSAJE_NO_PROCESABLE[accion]) ?? MENSAJE_ERROR.DATOS_NO_VALIDOS;
}

/** Mensaje para la persona según el estado HTTP; nunca repite el texto que mande el servidor. */
export function mensajeDeError(error: unknown, accion?: AccionCaso): string {
  if (error instanceof RespuestaInvalidaError) return MENSAJE_ERROR.RESPUESTA_INESPERADA;
  if (!(error instanceof IncidenciaError)) return MENSAJE_ERROR.GENERICO;
  switch (error.estado) {
    case HttpStatus.NETWORK:
      return MENSAJE_ERROR.SIN_CONEXION;
    case HttpStatus.BAD_REQUEST:
      return MENSAJE_ERROR.DATOS_NO_VALIDOS;
    case HttpStatus.FORBIDDEN:
      return MENSAJE_ERROR.SIN_PERMISO;
    case HttpStatus.NOT_FOUND:
      return MENSAJE_ERROR.NO_DISPONIBLE;
    case HttpStatus.CONFLICT:
      return MENSAJE_ERROR.CONFLICTO;
    case HttpStatus.UNPROCESSABLE:
      return mensajeDeNoProcesable(accion);
    case HttpStatus.TOO_MANY_REQUESTS:
      return MENSAJE_ERROR.DEMASIADAS_PETICIONES;
    default:
      return MENSAJE_ERROR.GENERICO;
  }
}
