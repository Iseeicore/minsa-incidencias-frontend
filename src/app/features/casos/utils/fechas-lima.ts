import { MAX_RANGO_DIAS } from "@/features/casos/constants/casos-constants";
import { MENSAJE_FECHAS } from "@/features/casos/constants/casos-messages";
import { AtajoFecha } from "@/features/casos/enums/atajo-fecha.enum";

export interface RangoFechas {
  readonly desde: string;
  readonly hasta: string;
}

/** Lima es UTC−5 todo el año (no tiene horario de verano). */
const DESFASE_LIMA_MS = -5 * 60 * 60 * 1000;
const MS_POR_DIA = 24 * 60 * 60 * 1000;
const FECHA_ISO = /^(\d{4})-(\d{2})-(\d{2})$/;

function enMilisegundos(fecha: string): number {
  const [anio, mes, dia] = fecha.split("-").map(Number);
  return Date.UTC(anio, mes - 1, dia);
}

/** `YYYY-MM-DD` que existe en el calendario (rechaza 2026-02-30). */
export function esFechaValida(valor: string): boolean {
  const partes = FECHA_ISO.exec(valor);
  if (!partes) return false;
  return new Date(enMilisegundos(valor)).toISOString().slice(0, 10) === valor;
}

/** Día de calendario en Lima para un instante: a las 21:00 de Lima ya es «mañana» en UTC, pero «hoy» para la persona. */
export function fechaDeLima(instante: Date): string {
  return new Date(instante.getTime() + DESFASE_LIMA_MS).toISOString().slice(0, 10);
}

/** `2026-10-08` como `08/10/2026`. */
export function fechaCorta(fecha: string): string {
  const [anio, mes, dia] = fecha.split("-");
  return `${dia}/${mes}/${anio}`;
}

export function sumarDias(fecha: string, dias: number): string {
  return new Date(enMilisegundos(fecha) + dias * MS_POR_DIA).toISOString().slice(0, 10);
}

/** Cuántos días abarca el rango contando ambos extremos. */
export function diasDelRango(desde: string, hasta: string): number {
  return Math.round((enMilisegundos(hasta) - enMilisegundos(desde)) / MS_POR_DIA) + 1;
}

export function rangoDeAtajo(atajo: AtajoFecha, ahora: Date): RangoFechas {
  const hoy = fechaDeLima(ahora);
  switch (atajo) {
    case AtajoFecha.HOY:
      return { desde: hoy, hasta: hoy };
    case AtajoFecha.SIETE_DIAS:
      return { desde: sumarDias(hoy, -6), hasta: hoy };
    case AtajoFecha.TREINTA_DIAS:
      return { desde: sumarDias(hoy, -29), hasta: hoy };
    case AtajoFecha.ESTE_MES:
      return { desde: `${hoy.slice(0, 8)}01`, hasta: hoy };
  }
}

/** Mensaje en español si el rango no es válido; `null` si lo es. Un extremo vacío queda abierto. */
export function errorDeRango(desde: string, hasta: string): string | null {
  if ((desde !== "" && !esFechaValida(desde)) || (hasta !== "" && !esFechaValida(hasta))) {
    return MENSAJE_FECHAS.INVALIDA;
  }
  if (desde === "" || hasta === "") return null;
  if (desde > hasta) return MENSAJE_FECHAS.DESDE_POSTERIOR;
  if (diasDelRango(desde, hasta) > MAX_RANGO_DIAS) return MENSAJE_FECHAS.RANGO_LARGO;
  return null;
}
