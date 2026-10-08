export interface PlazoDto {
  readonly tipo: string | null;
  readonly estado: string | null;
  readonly venceEn: string | null;
  readonly horasRestantes: number | null;
}

export interface AreaDto {
  readonly codigo: string;
  readonly nombre: string;
}

export interface EstablecimientoDto {
  readonly codigoRenipress: string;
  readonly nombre: string;
  /** El listado real aún no los trae; el contrato los prevé. */
  readonly nivelAtencion?: string | null;
  readonly categoria?: string | null;
}

export interface CasoResumenDto {
  readonly codigo: string;
  readonly categoria: string | null;
  readonly categoriaIa: string | null;
  readonly confianzaIa: number | null;
  readonly etiquetas: readonly string[];
  readonly prioridad: string | null;
  readonly organismo: string | null;
  readonly area: AreaDto | null;
  readonly establecimiento: EstablecimientoDto | null;
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

export interface ResolucionDto {
  readonly medidasTomadas: string;
  readonly fundamento: string;
  readonly resultado: string;
}

export interface ArchivoDto {
  readonly motivo: string;
  readonly detalle: string | null;
  readonly archivadoEn: string;
}

export interface ReaperturaDto {
  readonly reabiertoEn: string;
  readonly motivo: string;
}

export interface CasoDetalleDto extends CasoResumenDto {
  readonly resolucion: ResolucionDto | null;
  readonly archivo: ArchivoDto | null;
  readonly reapertura: ReaperturaDto | null;
  readonly descripcion: string;
  readonly reclamante: string;
  readonly evidencias: readonly EvidenciaDto[];
  readonly historial: readonly HistorialDto[];
}

export interface ListaCasosDto {
  readonly items: readonly CasoResumenDto[];
  readonly siguiente: string | null;
  readonly hayMas: boolean;
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
  readonly limite?: number;
  readonly cursor?: string;
  readonly estado?: string;
  /** Solo con `estado=archivado`: por qué se archivó. */
  readonly motivoArchivo?: string;
  readonly categoria?: string;
  readonly texto?: string;
  /** Código RENIPRESS; filtro para quien ve varios establecimientos. */
  readonly establecimiento?: string;
}
