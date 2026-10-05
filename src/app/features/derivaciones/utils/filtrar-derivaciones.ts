import type { EstadoDerivacion } from "@/features/derivaciones/enums/estado-derivacion.enum";
import type { Derivacion } from "@/features/derivaciones/types/derivacion.types";

export function filtrarDerivaciones(derivaciones: readonly Derivacion[], estado: EstadoDerivacion): Derivacion[] {
  return derivaciones.filter((derivacion) => derivacion.estado === estado);
}
