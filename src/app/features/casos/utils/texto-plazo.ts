import type { Plazos } from "@/core/config/plazos.config";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { Caso } from "@/features/casos/types/caso.types";
import { HORAS_POR_DIA, horasRestantesAtencion, horasRestantesVigencia } from "@/features/casos/utils/plazos-caso";

function dias(cantidad: number): string {
  return cantidad === 1 ? "1 día" : `${cantidad} días`;
}

export function duracionCorta(horas: number): string {
  return horas < HORAS_POR_DIA ? `${horas} h` : dias(Math.round(horas / HORAS_POR_DIA));
}

/** Texto corto del plazo para la tabla: cuánto falta para vencer, para archivarse, o que ya está archivado. */
export function textoPlazo(caso: Caso, plazos: Plazos): string {
  if (caso.estado === EstadoCaso.ARCHIVADO) return "Archivado";
  if (caso.estado === EstadoCaso.RESUELTO) {
    const vigencia = horasRestantesVigencia(caso, plazos) ?? 0;
    return `Se archiva en ${duracionCorta(Math.max(vigencia, 0))}`;
  }
  const restantes = horasRestantesAtencion(caso, plazos);
  return restantes < 0 ? "Vencido" : `Vence en ${duracionCorta(restantes)}`;
}
