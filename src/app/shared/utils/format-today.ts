const FORMATO_LARGO = new Intl.DateTimeFormat("es-PE", { dateStyle: "full" });

export function formatLongDate(date: Date = new Date()): string {
  return FORMATO_LARGO.format(date);
}
