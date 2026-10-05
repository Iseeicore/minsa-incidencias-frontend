import type { Plazos } from "@/core/config/plazos.config";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { Caso } from "@/features/casos/types/caso.types";

export const HORAS_POR_DIA = 24;

const ESTADOS_CERRADOS: readonly EstadoCaso[] = [EstadoCaso.RESUELTO, EstadoCaso.ARCHIVADO];

export function estaAbierto(caso: Caso): boolean {
  return !ESTADOS_CERRADOS.includes(caso.estado);
}

/** Horas que le quedan al caso para ser atendido, contadas desde que llegó (negativo si ya pasó). */
export function horasRestantesAtencion(caso: Caso, plazos: Plazos): number {
  return plazos.atencionDias * HORAS_POR_DIA - caso.horasDesdeLlegada;
}

/** Horas que le quedan a una resolución antes de archivarse sola; null si el caso aún no se resolvió. */
export function horasRestantesVigencia(caso: Caso, plazos: Plazos): number | null {
  if (caso.horasDesdeResolucion === null) return null;
  return plazos.vigenciaResolucionDias * HORAS_POR_DIA - caso.horasDesdeResolucion;
}

export function estaPorVencer(caso: Caso, plazos: Plazos): boolean {
  if (!estaAbierto(caso)) return false;
  const restantes = horasRestantesAtencion(caso, plazos);
  return restantes >= 0 && restantes <= plazos.avisoHoras;
}

function archivado(caso: Caso, motivo: string): Caso {
  return {
    ...caso,
    estado: EstadoCaso.ARCHIVADO,
    historial: [...caso.historial, { titulo: "Archivado automáticamente", detalle: motivo }],
  };
}

/** Reproduce el trabajo programado de la base: lo resuelto y lo vencido pasa solo a ARCHIVADO. */
export function aplicarArchivadoAutomatico(casos: readonly Caso[], plazos: Plazos): Caso[] {
  return casos.map((caso) => {
    if (caso.estado === EstadoCaso.ARCHIVADO) return caso;
    if (caso.estado === EstadoCaso.RESUELTO) {
      const vigencia = horasRestantesVigencia(caso, plazos);
      return vigencia !== null && vigencia < 0
        ? archivado(caso, `Pasaron los ${plazos.vigenciaResolucionDias} días de vigencia de la resolución.`)
        : caso;
    }
    return horasRestantesAtencion(caso, plazos) < 0
      ? archivado(caso, `Venció el plazo de atención de ${plazos.atencionDias} días.`)
      : caso;
  });
}
