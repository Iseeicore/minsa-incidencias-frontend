import type { FiltroActivoId } from "@/features/casos/enums/filtro-activo.enum";

export interface FiltroActivo {
  readonly id: FiltroActivoId;
  readonly label: string;
}
