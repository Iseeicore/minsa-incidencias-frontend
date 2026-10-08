const FORMATO = new Intl.DateTimeFormat("es-PE", { dateStyle: "medium", timeStyle: "short" });

/** Fecha y hora legibles de un instante ISO; si no se puede leer, devuelve el texto tal cual. */
export function formatearFecha(iso: string): string {
  const fecha = new Date(iso);
  return Number.isNaN(fecha.getTime()) ? iso : FORMATO.format(fecha);
}
