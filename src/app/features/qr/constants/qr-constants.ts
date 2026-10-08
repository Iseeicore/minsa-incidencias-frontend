export const TAMANO_PAGINA_QR = 20;
/** Lado del PNG descargado, en píxeles. */
export const LADO_QR_PX = 1024;
/** Margen blanco alrededor del QR, en módulos (el estándar pide 4). */
export const MARGEN_QR_MODULOS = 4;
export const PREFIJO_ARCHIVO_QR = "qr-eess-";
export const SIN_DATO_QR = "—";

export const MENSAJE_QR = {
  CARGA_LISTA: "No se pudieron cargar los establecimientos.",
  CARGA_PROPIO: "No se pudo cargar tu establecimiento.",
  GENERAR: "No se pudo generar el código QR. Inténtalo de nuevo.",
  SIN_ESTABLECIMIENTO: "Tu usuario no tiene un establecimiento asignado.",
} as const;
