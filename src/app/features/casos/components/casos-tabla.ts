import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { CATEGORIA_LABEL, ESTADO_BADGE, PRIORIDAD_CASO_BADGE } from "@/features/casos/constants/casos-constants";
import type { Caso } from "@/features/casos/types/caso.types";
import { tonoConfianza } from "@/features/casos/utils/confianza-tone";
import { Badge } from "@/shared/ui/badge/badge";
import { TableScroll } from "@/shared/ui/table-scroll/table-scroll";

const ENCABEZADO = "sticky top-0 z-10 bg-white pb-3 pr-6 text-xs font-medium text-gray-500";

const COLUMNAS = [
  { key: "codigo", label: "Código" },
  { key: "categoria", label: "Categoría" },
  { key: "etiquetas", label: "Etiquetas" },
  { key: "prioridad", label: "Prioridad" },
  { key: "area", label: "Área" },
  { key: "responsable", label: "Responsable" },
  { key: "estado", label: "Estado" },
  { key: "confianza", label: "Confianza IA" },
  { key: "vencimiento", label: "Vencimiento" },
] as const;

@Component({
  selector: "app-casos-tabla",
  imports: [Badge, TableScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <app-table-scroll label="Listado de casos">
      <table class="w-full whitespace-nowrap text-left text-sm">
        <thead>
          <tr>
            @for (columna of columnas; track columna.key) {
              <th scope="col" [class]="encabezado">{{ columna.label }}</th>
            }
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100">
          @for (caso of casos(); track caso.codigo) {
            <tr>
              <td class="py-3 pr-6 font-medium text-gray-900">{{ caso.codigo }}</td>
              <td class="py-3 pr-6 text-gray-700">{{ categoria[caso.categoria] }}</td>
              <td class="py-3 pr-6">
                <div class="flex items-center gap-1.5">
                  <app-badge>{{ caso.etiquetas[0] }}</app-badge>
                  @if (caso.etiquetas.length > 1) {
                    <span class="text-xs font-medium text-gray-500">+{{ caso.etiquetas.length - 1 }}</span>
                  }
                </div>
              </td>
              <td class="py-3 pr-6">
                <app-badge [tone]="prioridad[caso.prioridad].tone">{{ prioridad[caso.prioridad].label }}</app-badge>
              </td>
              <td class="py-3 pr-6">
                <p class="text-gray-900">{{ caso.area }}</p>
                <p class="text-xs text-gray-500">{{ caso.organismo }}</p>
              </td>
              <td class="py-3 pr-6 text-gray-700">{{ caso.responsable }}</td>
              <td class="py-3 pr-6">
                <app-badge [tone]="estado[caso.estado].tone">{{ estado[caso.estado].label }}</app-badge>
              </td>
              <td class="py-3 pr-6">
                <app-badge [tone]="tonoConfianza(caso.confianzaIa)">{{ caso.confianzaIa }} %</app-badge>
              </td>
              <td class="py-3 text-gray-700">{{ caso.vencimiento }}</td>
            </tr>
          }
        </tbody>
      </table>
    </app-table-scroll>
  `,
})
export class CasosTabla {
  readonly casos = input.required<readonly Caso[]>();

  protected readonly columnas = COLUMNAS;
  protected readonly encabezado = ENCABEZADO;
  protected readonly categoria = CATEGORIA_LABEL;
  protected readonly prioridad = PRIORIDAD_CASO_BADGE;
  protected readonly estado = ESTADO_BADGE;
  protected readonly tonoConfianza = tonoConfianza;
}
