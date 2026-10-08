import type { EstablecimientoCaso } from "@/features/casos/types/caso.types";

interface DatosRenipress {
  readonly codigoRenipress: string;
  readonly nivelAtencion: string | null;
  readonly categoria: string | null;
}

/** «RENIPRESS 6206 · Nivel III · III-1»: solo lo que el servidor envió. */
export function textoRenipress(establecimiento: DatosRenipress): string {
  const partes = [`RENIPRESS ${establecimiento.codigoRenipress}`];
  if (establecimiento.nivelAtencion) partes.push(`Nivel ${establecimiento.nivelAtencion}`);
  if (establecimiento.categoria) partes.push(`Cat. ${establecimiento.categoria}`);
  return partes.join(" · ");
}

export function textoEstablecimiento(establecimiento: EstablecimientoCaso): string {
  return `${establecimiento.nombre} (${textoRenipress(establecimiento)})`;
}
