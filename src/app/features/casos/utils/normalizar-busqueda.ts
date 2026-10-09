import { LARGO_NUMERO_CODIGO } from "@/features/casos/constants/casos-constants";

const CODIGO_INCOMPLETO = /^MINSA-(\d{4})-(\d{1,6})$/i;

/** Un código pegado sin los ceros del número (MINSA-2026-17) se completa; cualquier otro texto se envía tal cual. */
export function normalizarBusqueda(texto: string): string {
  const limpio = texto.trim();
  const partes = CODIGO_INCOMPLETO.exec(limpio);
  if (!partes) return limpio;
  return `MINSA-${partes[1]}-${partes[2].padStart(LARGO_NUMERO_CODIGO, "0")}`;
}
