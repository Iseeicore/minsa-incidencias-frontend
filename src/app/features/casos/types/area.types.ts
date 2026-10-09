import type { NivelAtencion } from "@/features/casos/enums/nivel-atencion.enum";
import type { TipoArea } from "@/shared/enums/tipo-area.enum";

export interface DatosEstablecimiento {
  readonly codigoRenipress: string;
  readonly nivelAtencion: NivelAtencion | null;
  readonly categoria: string | null;
}

/** Un área que se puede elegir como destino de una derivación o como filtro. */
export interface AreaOpcion {
  readonly id: string;
  /** Es el valor que acepta `areaDestino` al derivar. */
  readonly codigo: string;
  readonly nombre: string;
  readonly tipoArea: TipoArea;
  readonly establecimiento: DatosEstablecimiento | null;
}

export interface ListaAreas {
  readonly areas: readonly AreaOpcion[];
  readonly siguiente: string | null;
  readonly hayMas: boolean;
}

export interface ConsultaAreas {
  readonly tipo?: TipoArea;
  readonly q?: string;
  readonly limite?: number;
  readonly cursor?: string;
}

export interface AreaDtoLista {
  readonly id: string | number;
  readonly codigo: string;
  readonly nombre: string;
  readonly tipoArea: string;
  readonly establecimiento: {
    readonly codigoRenipress: string;
    readonly nivelAtencion: string | null;
    readonly categoria: string | null;
  } | null;
}

export interface ListaAreasDto {
  readonly items: readonly AreaDtoLista[];
  readonly siguiente: string | null;
  readonly hayMas: boolean;
}
