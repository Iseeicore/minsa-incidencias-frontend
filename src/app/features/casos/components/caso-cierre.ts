import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { ARCHIVADO_POR_SISTEMA, MOTIVO_ARCHIVO_LABEL, RESULTADO_LABEL } from "@/features/casos/constants/casos-constants";
import { ResultadoResolucion } from "@/features/casos/enums/resultado-resolucion.enum";
import type { CasoDetalle } from "@/features/casos/types/caso.types";
import { formatearFecha } from "@/features/casos/utils/formatear-fecha";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { Badge } from "@/shared/ui/badge/badge";

/** Cómo terminó el caso: la resolución en tres campos, por qué está archivado y la última reapertura. */
@Component({
  selector: "app-caso-cierre",
  imports: [Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block space-y-4" },
  template: `
    @if (caso().resolucion; as resolucion) {
      <div role="group" aria-labelledby="cierre-resolucion">
        <h4 id="cierre-resolucion" class="mb-2 text-xs font-bold text-gray-500">Resolución</h4>
        <dl class="space-y-2 text-sm">
          <div>
            <dt class="font-medium text-gray-500">Resultado</dt>
            <dd class="mt-1">
              <app-badge [tone]="resolucion.resultado === ResultadoResolucion.ATENDIDO ? BadgeTone.SUCCESS : BadgeTone.NEUTRAL">
                {{ resultadoLabel[resolucion.resultado] }}
              </app-badge>
            </dd>
          </div>
          <div>
            <dt class="font-medium text-gray-500">Medidas tomadas</dt>
            <dd class="mt-1 whitespace-pre-line text-gray-900">{{ resolucion.medidasTomadas }}</dd>
          </div>
          <div>
            <dt class="font-medium text-gray-500">Fundamento</dt>
            <dd class="mt-1 whitespace-pre-line text-gray-900">{{ resolucion.fundamento }}</dd>
          </div>
        </dl>
      </div>
    }
    @if (caso().archivo; as archivo) {
      <div role="group" aria-labelledby="cierre-archivo">
        <h4 id="cierre-archivo" class="mb-2 text-xs font-bold text-gray-500">Archivo</h4>
        <dl class="space-y-2 text-sm">
          <div>
            <dt class="font-medium text-gray-500">Motivo</dt>
            <dd class="mt-1 text-gray-900">{{ motivoLabel[archivo.motivo] }} · {{ fecha(archivo.archivadoEn) }}</dd>
          </div>
          <div>
            <dt class="font-medium text-gray-500">Justificación</dt>
            <dd class="mt-1 whitespace-pre-line text-gray-900">{{ archivo.detalle ?? archivadoPorSistema }}</dd>
          </div>
        </dl>
      </div>
    }
    @if (caso().reapertura; as reapertura) {
      <div role="group" aria-labelledby="cierre-reapertura">
        <h4 id="cierre-reapertura" class="mb-2 text-xs font-bold text-gray-500">Última reapertura</h4>
        <p class="text-sm text-gray-500">{{ fecha(reapertura.reabiertoEn) }}</p>
        <p class="mt-1 whitespace-pre-line text-sm text-gray-900">{{ reapertura.motivo }}</p>
      </div>
    }
  `,
})
export class CasoCierre {
  readonly caso = input.required<CasoDetalle>();

  protected readonly BadgeTone = BadgeTone;
  protected readonly ResultadoResolucion = ResultadoResolucion;
  protected readonly resultadoLabel = RESULTADO_LABEL;
  protected readonly motivoLabel = MOTIVO_ARCHIVO_LABEL;
  protected readonly archivadoPorSistema = ARCHIVADO_POR_SISTEMA;
  protected readonly fecha = formatearFecha;
}
