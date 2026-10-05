const FORMATO = new Intl.DateTimeFormat("es-PE", { weekday: "short", day: "numeric", month: "short" });

export function formatToday(date: Date = new Date()): string {
  return FORMATO.format(date);
}
