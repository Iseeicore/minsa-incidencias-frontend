export const MENSAJE_ERROR = {
  SIN_CONEXION: "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
  DATOS_NO_VALIDOS: "Revisa los datos enviados e inténtalo de nuevo.",
  SIN_PERMISO: "No tienes permiso para esta acción sobre este caso.",
  NO_DISPONIBLE: "Este caso ya no está disponible para tu rol.",
  CONFLICTO:
    "El caso cambió mientras lo revisabas: otra persona pudo actuar antes. Recarga el caso e inténtalo de nuevo.",
  CATEGORIA_IGUAL: "Elige una categoría distinta de la actual; para dejarla igual, confírmala.",
  AREA_DESTINO_INVALIDA: "El área elegida no puede recibir el caso. Elige un establecimiento activo.",
  DEMASIADAS_PETICIONES: "Demasiadas peticiones seguidas. Espera un momento e inténtalo de nuevo.",
  RESPUESTA_INESPERADA: "El servidor envió una respuesta inesperada. Inténtalo de nuevo.",
  GENERICO: "No se pudo completar la operación. Inténtalo de nuevo.",
} as const;

export const MENSAJE_CARGA = {
  LISTA: "No se pudieron cargar los casos.",
  DETALLE: "No se pudo cargar el caso.",
  AVISOS: "No se pudieron cargar los avisos.",
  AREAS: "No se pudieron cargar las áreas.",
} as const;
