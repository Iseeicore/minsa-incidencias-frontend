import type { BadgeTone } from "@/shared/enums/badge.enum";
import type { Prioridad } from "@/shared/enums/prioridad.enum";

export interface Kpi {
  readonly id: string;
  readonly label: string;
  readonly value: string;
  readonly delta: string;
  readonly tone: BadgeTone;
}

export interface CategoriaCasos {
  readonly label: string;
  readonly casos: number;
  readonly porcentaje: number;
}

export interface CasoAtencion {
  readonly codigo: string;
  readonly categoria: string;
  readonly prioridad: Prioridad;
  readonly responsable: string;
  readonly vencimiento: string;
}

export interface ResumenFila {
  readonly label: string;
  readonly valor: number;
}

export interface AlertaResumen {
  readonly id: string;
  readonly titulo: string;
  readonly detalle: string;
  readonly tone: BadgeTone;
  readonly etiqueta: string;
}
