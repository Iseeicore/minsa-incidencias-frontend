import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { PRIORIDAD_BADGE } from "@/features/inicio/constants/prioridad-badge";
import type { CasoAtencion } from "@/features/inicio/types/dashboard.types";
import { Badge } from "@/shared/ui/badge/badge";

const ENCABEZADO = "pb-3 pr-4 text-xs font-medium text-gray-500";
const SOLO_PANTALLA_ANCHA = "hidden md:table-cell";

const COLUMNAS = [
  { key: "caso", label: "Caso", clases: ENCABEZADO },
  { key: "categoria", label: "Categoría", clases: `${ENCABEZADO} ${SOLO_PANTALLA_ANCHA}` },
  { key: "prioridad", label: "Prioridad", clases: ENCABEZADO },
  { key: "responsable", label: "Responsable", clases: `${ENCABEZADO} ${SOLO_PANTALLA_ANCHA}` },
  { key: "vencimiento", label: "Vencimiento", clases: ENCABEZADO },
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
            <th scope="col" [class]="columna.clases">{{ columna.label }}</th>
          }
        </tr>
      </thead>
      <tbody class="divide-y divide-gray-100">
        @for (caso of casos(); track caso.codigo) {
          <tr>
            <td class="py-3 pr-4 font-medium text-gray-900">{{ caso.codigo }}</td>
            <td class="hidden py-3 pr-4 text-gray-700 md:table-cell">{{ caso.categoria }}</td>
            <td class="py-3 pr-4">
              <app-badge [tone]="prioridad[caso.prioridad].tone">{{ prioridad[caso.prioridad].label }}</app-badge>
            </td>
            <td class="hidden py-3 pr-4 text-gray-700 md:table-cell">{{ caso.responsable }}</td>
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
