import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";

export interface JerarquiaAcciones {
  /** La acción que el flujo espera ahora; a lo más una. */
  readonly principal: AccionCaso | null;
  readonly secundarias: readonly AccionCaso[];
  /** Irreversibles o que sacan el caso del flujo; se muestran separadas. */
  readonly destructivas: readonly AccionCaso[];
}

const DESTRUCTIVAS: readonly AccionCaso[] = [AccionCaso.ARCHIVAR];
const ORDEN_SECUNDARIAS: readonly AccionCaso[] = [
  AccionCaso.CORREGIR,
  AccionCaso.DERIVAR,
  AccionCaso.TOMAR,
  AccionCaso.RESOLVER,
  AccionCaso.CONFIRMAR,
  AccionCaso.REABRIR,
];

/** Qué acciones puede promover cada estado a principal, de la más esperada a la menos. */
function candidatasAPrincipal(estado: EstadoCaso, revisadoPorHumano: boolean): readonly AccionCaso[] {
  switch (estado) {
    case EstadoCaso.CLASIFICADO:
      return revisadoPorHumano ? [AccionCaso.TOMAR, AccionCaso.DERIVAR] : [AccionCaso.CONFIRMAR];
    case EstadoCaso.DERIVADO:
      return [AccionCaso.TOMAR];
    case EstadoCaso.EN_GESTION:
      return [AccionCaso.RESOLVER];
    case EstadoCaso.RESUELTO:
    case EstadoCaso.ARCHIVADO:
      return [AccionCaso.REABRIR];
    default:
      return [];
  }
}

/**
 * Ordena las acciones que el servidor permite: una principal según el estado del caso, las demás como secundarias y
 * las destructivas aparte. No decide qué se puede hacer (eso lo manda el servidor), solo cómo se presenta.
 */
export function jerarquiaDeAcciones(
  caso: { readonly estado: EstadoCaso; readonly revisadoPorHumano: boolean },
  permitidas: readonly AccionCaso[],
): JerarquiaAcciones {
  const destructivas = DESTRUCTIVAS.filter((accion) => permitidas.includes(accion));
  const principal =
    candidatasAPrincipal(caso.estado, caso.revisadoPorHumano).find((accion) => permitidas.includes(accion)) ?? null;
  const secundarias = ORDEN_SECUNDARIAS.filter((accion) => accion !== principal && permitidas.includes(accion));
  return { principal, secundarias, destructivas };
}
