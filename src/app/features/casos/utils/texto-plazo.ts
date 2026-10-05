import { HORAS_POR_DIA, SIN_DATO } from "@/features/casos/constants/casos-constants";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import type { Caso } from "@/features/casos/types/caso.types";

function dias(cantidad: number): string {
  return cantidad === 1 ? "1 día" : `${cantidad} días`;
}

export function duracionCorta(horas: number): string {
  return horas < HORAS_POR_DIA ? `${horas} h` : dias(Math.round(horas / HORAS_POR_DIA));
}

/** Texto corto del plazo según lo que calculó el servidor: cuánto falta para vencer o para archivarse. */
export function textoPlazo(caso: Caso): string {
  if (caso.estado === EstadoCaso.ARCHIVADO) return "Archivado";
  const { tipo, estado, horasRestantes } = caso.plazo;
  if (tipo === null || horasRestantes === null) return SIN_DATO;
  if (tipo === PlazoTipo.VIGENCIA) return `Se archiva en ${duracionCorta(Math.max(horasRestantes, 0))}`;
  return estado === PlazoEstado.VENCIDO || horasRestantes < 0 ? "Vencido" : `Vence en ${duracionCorta(horasRestantes)}`;
}
