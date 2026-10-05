import { ChangeDetectionStrategy, Component, input } from "@angular/core";
import { CATEGORIA_LABEL, ESTADO_BADGE, PRIORIDAD_CASO_BADGE } from "@/features/casos/constants/casos-constants";
import type { Caso } from "@/features/casos/types/caso.types";
import { tonoConfianza } from "@/features/casos/utils/confianza-tone";
import { Badge } from "@/shared/ui/badge/badge";

const ENCABEZADO = "pb-3 pr-4 text-xs font-medium text-gray-500";
const DESDE_MD = "hidden md:table-cell";
const DESDE_LG = "hidden lg:table-cell";
const DESDE_XL = "hidden xl:table-cell";

const COLUMNAS = [
  { key: "codigo", label: "Código", clases: ENCABEZADO },
  { key: "categoria", label: "Categoría", clases: `${ENCABEZADO} ${DESDE_MD}` },
  { key: "etiquetas", label: "Etiquetas", clases: `${ENCABEZADO} ${DESDE_XL}` },
  { key: "prioridad", label: "Prioridad", clases: ENCABEZADO },
  { key: "area", label: "Área", clases: `${ENCABEZADO} ${DESDE_LG}` },
  { key: "responsable", label: "Responsable", clases: `${ENCABEZADO} ${DESDE_LG}` },
  { key: "estado", label: "Estado", clases: ENCABEZADO },
  { key: "confianza", label: "Confianza IA", clases: `${ENCABEZADO} ${DESDE_XL}` },
  { key: "vencimiento", label: "Vencimiento", clases: `${ENCABEZADO} ${DESDE_MD}` },
] as const;

@Component({
  selector: "app-casos-tabla",
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
            <td class="py-3 pr-4">
              <p class="font-medium text-gray-900">{{ caso.codigo }}</p>
              <p class="text-xs text-gray-500 md:hidden">{{ categoria[caso.categoria] }}</p>
            </td>
            <td class="hidden py-3 pr-4 text-gray-700 md:table-cell">{{ categoria[caso.categoria] }}</td>
            <td class="hidden py-3 pr-4 xl:table-cell">
              <div class="flex items-center gap-1.5">
                <app-badge>{{ caso.etiquetas[0] }}</app-badge>
                @if (caso.etiquetas.length > 1) {
                  <span class="text-xs font-medium text-gray-500">+{{ caso.etiquetas.length - 1 }}</span>
                }
              </div>
            </td>
            <td class="py-3 pr-4">
              <app-badge [tone]="prioridad[caso.prioridad].tone">{{ prioridad[caso.prioridad].label }}</app-badge>
            </td>
            <td class="hidden py-3 pr-4 lg:table-cell">
              <p class="text-gray-900">{{ caso.area }}</p>
              <p class="text-xs text-gray-500">{{ caso.organismo }}</p>
            </td>
            <td class="hidden py-3 pr-4 text-gray-700 lg:table-cell">{{ caso.responsable }}</td>
            <td class="py-3 pr-4">
              <app-badge [tone]="estado[caso.estado].tone">{{ estado[caso.estado].label }}</app-badge>
            </td>
            <td class="hidden py-3 pr-4 xl:table-cell">
              <app-badge [tone]="tonoConfianza(caso.confianzaIa)">{{ caso.confianzaIa }} %</app-badge>
            </td>
            <td class="hidden py-3 text-gray-700 md:table-cell">{{ caso.vencimiento }}</td>
          </tr>
        }
      </tbody>
    </table>
  `,
})
export class CasosTabla {
  readonly casos = input.required<readonly Caso[]>();

  protected readonly columnas = COLUMNAS;
  protected readonly categoria = CATEGORIA_LABEL;
  protected readonly prioridad = PRIORIDAD_CASO_BADGE;
  protected readonly estado = ESTADO_BADGE;
  protected readonly tonoConfianza = tonoConfianza;
}
