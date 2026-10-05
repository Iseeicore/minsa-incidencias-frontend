import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { PRIORIDAD_BADGE } from "@/features/inicio/constants/prioridad-badge";
import type { CasoAtencion } from "@/features/inicio/types/dashboard.types";
import { Badge } from "@/shared/ui/badge/badge";
import { TableScroll } from "@/shared/ui/table-scroll/table-scroll";

const ENCABEZADO = "sticky top-0 z-10 bg-white pb-3 pr-6 text-xs font-medium text-gray-500";

const COLUMNAS = [
  { key: "caso", label: "Caso" },
  { key: "categoria", label: "Categoría" },
  { key: "prioridad", label: "Prioridad" },
  { key: "responsable", label: "Responsable" },
  { key: "vencimiento", label: "Vencimiento" },
] as const;

@Component({
  selector: "app-casos-atencion-tabla",
  imports: [Badge, TableScroll],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <app-table-scroll label="Casos que requieren atención">
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
              <td class="py-3 pr-6 text-gray-700">{{ caso.categoria }}</td>
              <td class="py-3 pr-6">
                <app-badge [tone]="prioridad[caso.prioridad].tone">{{ prioridad[caso.prioridad].label }}</app-badge>
              </td>
              <td class="py-3 pr-6 text-gray-700">{{ caso.responsable }}</td>
              <td class="py-3 text-gray-700">{{ caso.vencimiento }}</td>
            </tr>
          }
        </tbody>
      </table>
    </app-table-scroll>
  `,
})
export class CasosAtencionTabla {
  readonly casos = input.required<readonly CasoAtencion[]>();

  protected readonly columnas = COLUMNAS;
  protected readonly encabezado = ENCABEZADO;
  protected readonly prioridad = PRIORIDAD_BADGE;
}
