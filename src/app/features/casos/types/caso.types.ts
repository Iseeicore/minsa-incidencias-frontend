import type { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import type { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import type { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import type { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import type { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import type { TipoEvidencia } from "@/features/casos/enums/tipo-evidencia.enum";
import type { Prioridad } from "@/shared/enums/prioridad.enum";
import type { TimelineItem } from "@/shared/ui/timeline/timeline";

export interface EvidenciaCaso {
  readonly nombre: string;
  readonly tipo: TipoEvidencia;
  readonly fecha: string;
  readonly sensible: boolean;
  readonly verificada: boolean;
}

export interface PlazoCaso {
  readonly tipo: PlazoTipo | null;
  readonly estado: PlazoEstado | null;
  readonly venceEn: string | null;
  readonly horasRestantes: number | null;
}

export interface Caso {
  readonly codigo: string;
  readonly categoria: CategoriaCaso | null;
  readonly categoriaIa: CategoriaCaso | null;
  readonly confianzaIa: number | null;
  readonly etiquetas: readonly string[];
  readonly prioridad: Prioridad | null;
  readonly organismo: string | null;
  readonly area: string | null;
  readonly responsable: string | null;
  readonly estado: EstadoCaso;
  readonly horasDesdeLlegada: number;
  readonly horasDesdeResolucion: number | null;
  readonly revisadoPorHumano: boolean;
  readonly corregida: boolean;
  readonly plazo: PlazoCaso;
  readonly acciones: readonly AccionCaso[];
}

export interface CasoDetalle extends Caso {
  readonly resolucion: string | null;
  readonly descripcion: string;
  readonly reclamante: string;
  readonly evidencias: readonly EvidenciaCaso[];
  readonly historial: readonly TimelineItem[];
}

export interface ListaCasos {
  readonly casos: readonly Caso[];
  readonly pagina: number;
  readonly tamano: number;
  readonly total: number;
}

export interface CasosPorVencer {
  readonly total: number;
  readonly porVencer: number;
  readonly vencidos: number;
  readonly casos: readonly Caso[];
}

export interface RespuestaAccion {
  readonly mensaje: string;
  readonly caso: CasoDetalle | null;
}

export interface FiltrosCasos {
  readonly tab: FiltroTab;
  readonly texto: string;
  readonly estado: string;
}

export type ResultadoAccion = { readonly ok: true; readonly mensaje: string } | { readonly ok: false; readonly error: string };
