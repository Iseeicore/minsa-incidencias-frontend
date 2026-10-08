import { ChangeDetectionStrategy, Component, inject, input, output } from "@angular/core";
import { PLAZOS_TOKEN } from "@/core/config/plazos.config";
import { CasosStore } from "@/features/casos/casos.store";
import {
  CATEGORIA_LABEL,
  ESTADO_BADGE,
  PRIORIDAD_CASO_BADGE,
  SIN_DATO,
} from "@/features/casos/constants/casos-constants";
import type { Caso } from "@/features/casos/types/caso.types";
import { accionesPermitidas } from "@/features/casos/utils/acciones-caso";
import { areaDe } from "@/features/casos/utils/area-de-categoria";
import { tonoConfianza } from "@/features/casos/utils/confianza-tone";
import { textoPlazo } from "@/features/casos/utils/texto-plazo";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Badge } from "@/shared/ui/badge/badge";
import { Button } from "@/shared/ui/button/button";
import { ScrollArea } from "@/shared/ui/scroll-area/scroll-area";

const ENCABEZADO = "sticky top-0 z-10 bg-white pb-3 pr-4 text-xs font-medium text-gray-500";

const COLUMNAS = [
  { key: "codigo", label: "Código" },
  { key: "categoria", label: "Categoría" },
  { key: "etiquetas", label: "Etiquetas" },
  { key: "prioridad", label: "Prioridad" },
  { key: "area", label: "Área" },
  { key: "responsable", label: "Responsable" },
  { key: "estado", label: "Estado" },
  { key: "confianza", label: "Confianza IA" },
  { key: "plazo", label: "Plazo" },
  { key: "acciones", label: "Acciones" },
] as const;

@Component({
  selector: "app-casos-tabla",
  imports: [Badge, Button, ScrollArea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <app-scroll-area [label]="descripcion()">
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
            <tr class="transition-colors hover:bg-gray-50">
              <td class="py-3 pr-4 font-bold text-gray-900">{{ caso.codigo }}</td>
              <td class="py-3 pr-4 text-gray-700">{{ caso.categoria ? categoria[caso.categoria] : sinDato }}</td>
              <td class="py-3 pr-4">
                @if (caso.etiquetas.length > 0) {
                  <div class="flex items-center gap-1.5">
                    <app-badge>{{ caso.etiquetas[0] }}</app-badge>
                    @if (caso.etiquetas.length > 1) {
                      <span class="text-xs font-medium text-gray-500">+{{ caso.etiquetas.length - 1 }}</span>
                    }
                  </div>
                } @else {
                  <span class="text-gray-500">{{ sinDato }}</span>
                }
              </td>
              <td class="py-3 pr-4">
                <app-badge [tone]="prioridad[caso.prioridad].tone">{{ prioridad[caso.prioridad].label }}</app-badge>
              </td>
              <td class="py-3 pr-4">
                <p class="text-gray-900">{{ areaDe(caso.categoria) }}</p>
                <p class="text-xs text-gray-500">{{ caso.organismo }}</p>
              </td>
              <td class="py-3 pr-4 text-gray-700">{{ caso.responsable }}</td>
              <td class="py-3 pr-4">
                <app-badge [tone]="estado[caso.estado].tone">{{ estado[caso.estado].label }}</app-badge>
              </td>
              <td class="py-3 pr-4">
                @if (caso.confianzaIa !== null) {
                  <app-badge [tone]="tonoConfianza(caso.confianzaIa)">{{ caso.confianzaIa }} %</app-badge>
                } @else {
                  <span class="text-gray-500">{{ sinDato }}</span>
                }
              </td>
              <td class="py-3 pr-4">
                <span [class]="claseDePlazo(caso)">{{ textoPlazo(caso, plazos) }}</span>
              </td>
              <td class="py-3">
                @if (puedeActuar(caso)) {
                  <app-button [size]="ButtonSize.SM" (click)="revisar.emit(caso.codigo)">
                    Revisar<span class="sr-only"> el caso {{ caso.codigo }}</span>
                  </app-button>
                } @else {
                  <app-button
                    [variant]="ButtonVariant.OUTLINE"
                    [tone]="ButtonTone.NEUTRAL"
                    [size]="ButtonSize.SM"
                    (click)="revisar.emit(caso.codigo)"
                  >
                    Ver<span class="sr-only"> el caso {{ caso.codigo }}</span>
                  </app-button>
                }
              </td>
            </tr>
          }
        </tbody>
      </table>
    </app-scroll-area>
  `,
})
export class CasosTabla {
  private readonly store = inject(CasosStore);

  readonly casos = input.required<readonly Caso[]>();
  readonly descripcion = input("Listado de casos");
  readonly revisar = output<string>();

  protected readonly plazos = inject(PLAZOS_TOKEN);
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly columnas = COLUMNAS;
  protected readonly encabezado = ENCABEZADO;
  protected readonly sinDato = SIN_DATO;
  protected readonly categoria = CATEGORIA_LABEL;
  protected readonly prioridad = PRIORIDAD_CASO_BADGE;
  protected readonly estado = ESTADO_BADGE;
  protected readonly tonoConfianza = tonoConfianza;
  protected readonly textoPlazo = textoPlazo;
  protected readonly areaDe = areaDe;

  protected claseDePlazo(caso: Caso): string {
    return textoPlazo(caso, this.plazos) === "Vencido" ? "font-bold text-danger-700" : "text-gray-700";
  }

  protected puedeActuar(caso: Caso): boolean {
    return accionesPermitidas(caso, this.store.rol()).length > 0;
  }
}
