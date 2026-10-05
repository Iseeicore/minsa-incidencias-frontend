import type { DireccionOrden, OrdenCaso } from "@/features/casos/enums/orden-caso.enum";

export interface PlazoDto {
  readonly tipo: string | null;
  readonly estado: string | null;
  readonly venceEn: string | null;
  readonly horasRestantes: number | null;
}

export interface CasoResumenDto {
  readonly codigo: string;
  readonly categoria: string | null;
  readonly categoriaIa: string | null;
  readonly confianzaIa: number | null;
  readonly etiquetas: readonly string[];
  readonly prioridad: string | null;
  readonly organismo: string | null;
  readonly area: string | null;
  readonly responsable: string | null;
  readonly estado: string;
  readonly horasDesdeLlegada: number;
  readonly horasDesdeResolucion: number | null;
  readonly revisadoPorHumano: boolean;
  readonly corregida: boolean;
  readonly plazo: PlazoDto;
  readonly acciones: readonly string[];
}

export interface EvidenciaDto {
  readonly nombre: string;
  readonly tipo: string;
  readonly fecha: string;
  readonly sensible: boolean;
  readonly verificada: boolean;
}

export interface HistorialDto {
  readonly titulo: string;
  readonly detalle: string;
  readonly hora: string;
  readonly fecha: string;
}

export interface CasoDetalleDto extends CasoResumenDto {
  readonly resolucion: string | null;
  readonly descripcion: string;
  readonly reclamante: string;
  readonly evidencias: readonly EvidenciaDto[];
  readonly historial: readonly HistorialDto[];
}

export interface ListaCasosDto {
  readonly casos: readonly CasoResumenDto[];
  readonly pagina: number;
  readonly tamano: number;
  readonly total: number;
}

export interface PorVencerDto {
  readonly total: number;
  readonly porVencer: number;
  readonly vencidos: number;
  readonly casos: readonly CasoResumenDto[];
}

export interface ResultadoAccionDto {
  readonly mensaje: string;
  readonly caso: CasoDetalleDto | null;
}

export interface ConsultaCasos {
  readonly pagina?: number;
  readonly tamano?: number;
  readonly estado?: string;
  readonly categoria?: string;
  readonly texto?: string;
  readonly orden?: OrdenCaso;
  readonly direccion?: DireccionOrden;
}
