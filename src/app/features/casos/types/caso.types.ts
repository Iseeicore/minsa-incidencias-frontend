import type { Prioridad } from "@/shared/enums/prioridad.enum";
import type { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import type { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";

export interface Caso {
  readonly codigo: string;
  readonly categoria: CategoriaCaso | null;
  readonly etiquetas: readonly string[];
  readonly prioridad: Prioridad;
  readonly organismo: string;
  readonly area: string;
  readonly responsable: string;
  readonly estado: EstadoCaso;
  readonly confianzaIa: number | null;
  readonly horasParaVencer: number | null;
  readonly asignadoAMi: boolean;
  readonly revisadoPorHumano: boolean;
  readonly devuelto: boolean;
}

export interface FiltrosCasos {
  readonly tab: FiltroTab;
  readonly texto: string;
  readonly prioridad: string;
  readonly estado: string;
}
