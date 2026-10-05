import type { Prioridad } from "@/shared/enums/prioridad.enum";
import type { TimelineItem } from "@/shared/ui/timeline/timeline";
import type { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import type { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import type { TipoEvidencia } from "@/features/casos/enums/tipo-evidencia.enum";

export interface EvidenciaCaso {
  readonly nombre: string;
  readonly tipo: TipoEvidencia;
  readonly fecha: string;
  readonly sensible: boolean;
  readonly verificada: boolean;
}

export interface Caso {
  readonly codigo: string;
  readonly categoria: CategoriaCaso | null;
  readonly categoriaIa: CategoriaCaso | null;
  readonly confianzaIa: number | null;
  readonly etiquetas: readonly string[];
  readonly prioridad: Prioridad;
  readonly organismo: string;
  readonly responsable: string;
  readonly estado: EstadoCaso;
  readonly horasDesdeLlegada: number;
  readonly horasDesdeResolucion: number | null;
  readonly revisadoPorHumano: boolean;
  readonly corregida: boolean;
  readonly resolucion: string | null;
  readonly descripcion: string;
  readonly reclamante: string;
  readonly evidencias: readonly EvidenciaCaso[];
  readonly historial: readonly TimelineItem[];
}

export interface FiltrosCasos {
  readonly tab: FiltroTab;
  readonly texto: string;
  readonly prioridad: string;
  readonly estado: string;
}

export type ResultadoAccion = { readonly ok: true; readonly mensaje: string } | { readonly ok: false; readonly error: string };
