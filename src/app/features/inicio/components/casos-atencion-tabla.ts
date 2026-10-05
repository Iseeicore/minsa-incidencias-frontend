import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { Badge } from "@/shared/ui/badge/badge";
import { PRIORIDAD_BADGE } from "@/features/inicio/constants/prioridad-badge";
import type { CasoAtencion } from "@/features/inicio/types/dashboard.types";

const COLUMNAS = [
  { key: "caso", label: "Caso" },
  { key: "categoria", label: "Categoría" },
  { key: "prioridad", label: "Prioridad" },
  { key: "responsable", label: "Responsable" },
  { key: "vencimiento", label: "Vencimiento" },
] as const;

@Component({
  selector: "app-casos-atencion-tabla",
  imports: [Badge],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block overflow-x-auto" },
  template: `
    <table class="w-full text-left text-sm">
      <thead>
        <tr>
          @for (columna of columnas; track columna.key) {
            <th scope="col" class="pb-3 text-xs font-medium text-gray-500">{{ columna.label }}</th>
          }
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        @for (caso of casos(); track caso.codigo) {
          <tr>
            <td class="py-3 pr-4 font-medium text-gray-900">{{ caso.codigo }}</td>
            <td class="py-3 pr-4 text-gray-700">{{ caso.categoria }}</td>
            <td class="py-3 pr-4">
              <app-badge [tone]="prioridad[caso.prioridad].tone">{{ prioridad[caso.prioridad].label }}</app-badge>
            </td>
            <td class="py-3 pr-4 text-gray-700">{{ caso.responsable }}</td>
            <td class="py-3 text-gray-700">{{ caso.vencimiento }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class CasosAtencionTabla {
  readonly casos = input.required<readonly CasoAtencion[]>();

  protected readonly columnas = COLUMNAS;
  protected readonly prioridad = PRIORIDAD_BADGE;
}
