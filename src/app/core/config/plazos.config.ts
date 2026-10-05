import { InjectionToken } from "@angular/core";
import { environment } from "@env/environment";
import type { PlazosEnvironment } from "@env/environment.types";

export interface Plazos {
  readonly atencionDias: number;
  readonly vigenciaResolucionDias: number;
  readonly avisoHoras: number;
}

export const PLAZOS_POR_DEFECTO: Plazos = { atencionDias: 3, vigenciaResolucionDias: 3, avisoHoras: 24 };

function positivo(valor: unknown, porDefecto: number): number {
  return typeof valor === "number" && Number.isFinite(valor) && valor > 0 ? valor : porDefecto;
}

/** Un valor inválido (cero, negativo o texto) no rompe la pantalla: se usa el valor por defecto. */
export function plazosDesde(origen: Partial<PlazosEnvironment> | undefined): Plazos {
  return {
    atencionDias: positivo(origen?.atencionDias, PLAZOS_POR_DEFECTO.atencionDias),
    vigenciaResolucionDias: positivo(origen?.vigenciaResolucionDias, PLAZOS_POR_DEFECTO.vigenciaResolucionDias),
    avisoHoras: positivo(origen?.avisoHoras, PLAZOS_POR_DEFECTO.avisoHoras),
  };
}

export const PLAZOS_TOKEN = new InjectionToken<Plazos>("PLAZOS", {
  providedIn: "root",
  factory: () => plazosDesde(environment.plazos),
});
