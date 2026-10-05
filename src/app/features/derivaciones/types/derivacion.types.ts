import type { EstadoDerivacion } from "@/features/derivaciones/enums/estado-derivacion.enum";
import type { TimelineItem } from "@/shared/ui/timeline/timeline";

export interface Derivacion {
  readonly id: string;
  readonly codigoCaso: string;
  readonly origen: string;
  readonly destino: string;
  readonly regla: string;
  readonly usuario: string;
  readonly fecha: string;
  readonly estado: EstadoDerivacion;
  readonly pasos: readonly TimelineItem[];
}
