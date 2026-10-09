import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import {
  CATEGORIA_LABEL,
  ESTADO_BADGE,
  PRIORIDAD_CASO_BADGE,
  SIN_AREA,
  SIN_DATO,
  SIN_ESTABLECIMIENTO,
} from "@/features/casos/constants/casos-constants";
import type { Caso } from "@/features/casos/types/caso.types";
import { tonoConfianza } from "@/features/casos/utils/confianza-tone";
import { textoRenipress } from "@/features/casos/utils/texto-establecimiento";
import { estaVencido, textoPlazo } from "@/features/casos/utils/texto-plazo";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Badge } from "@/shared/ui/badge/badge";
import { Button } from "@/shared/ui/button/button";
import { ScrollArea } from "@/shared/ui/scroll-area/scroll-area";

const PLAZO_VENCIDO = "font-bold text-danger-700";
const PLAZO_NORMAL = "text-gray-700";
const ENCABEZADO = "bg-white pb-3 pr-6 text-xs font-medium text-gray-500";

const COLUMNAS: readonly { readonly key: string; readonly label: string }[] = [
  { key: "codigo", label: "Código" },
  { key: "categoria", label: "Categoría" },
  { key: "etiquetas", label: "Etiquetas" },
  { key: "prioridad", label: "Prioridad" },
  { key: "establecimiento", label: "Establecimiento" },
  { key: "area", label: "Área" },
  { key: "responsable", label: "Responsable" },
  { key: "estado", label: "Estado" },
  { key: "confianza", label: "Confianza IA" },
  { key: "plazo", label: "Plazo" },
  { key: "acciones", label: "Acciones" },
];

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
              <td class="py-3 pr-6 font-bold text-gray-900">{{ caso.codigo }}</td>
              <td class="py-3 pr-6 text-gray-700">{{ caso.categoria ? categoria[caso.categoria] : sinDato }}</td>
              <td class="py-3 pr-6">
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
              <td class="py-3 pr-6">
                @if (caso.prioridad; as nivel) {
                  <app-badge [tone]="prioridad[nivel].tone">{{ prioridad[nivel].label }}</app-badge>
                } @else {
                  <span class="text-gray-500">{{ sinDato }}</span>
                }
              </td>
              <td class="py-3 pr-6">
                @if (caso.establecimiento; as establecimiento) {
                  <p class="text-gray-900">{{ establecimiento.nombre }}</p>
                  <p class="text-xs text-gray-500">{{ renipress(establecimiento) }}</p>
                } @else {
                  <span class="text-gray-500">{{ sinEstablecimiento }}</span>
                }
              </td>
              <td class="py-3 pr-6">
                <p class="text-gray-900">{{ caso.area?.nombre ?? sinArea }}</p>
                @if (caso.organismo) {
                  <p class="text-xs text-gray-500">{{ caso.organismo }}</p>
                }
              </td>
              <td class="py-3 pr-6 text-gray-700">{{ caso.responsable ?? sinDato }}</td>
              <td class="py-3 pr-6">
                <app-badge [tone]="estado[caso.estado].tone">{{ estado[caso.estado].label }}</app-badge>
              </td>
              <td class="py-3 pr-6">
                @if (caso.confianzaIa !== null) {
                  <app-badge [tone]="tonoConfianza(caso.confianzaIa)">{{ caso.confianzaIa }} %</app-badge>
                } @else {
                  <span class="text-gray-500">{{ sinDato }}</span>
                }
              </td>
              <td class="py-3 pr-6">
                <span [class]="clasePlazo(caso)">{{ textoPlazo(caso) }}</span>
              </td>
              <td class="py-3">
                @if (caso.acciones.length > 0) {
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
  readonly casos = input.required<readonly Caso[]>();
  readonly descripcion = input("Listado de casos");
  readonly revisar = output<string>();

  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly columnas = COLUMNAS;
  protected readonly encabezado = ENCABEZADO;
  protected readonly sinDato = SIN_DATO;
  protected readonly sinArea = SIN_AREA;
  protected readonly sinEstablecimiento = SIN_ESTABLECIMIENTO;
  protected readonly renipress = textoRenipress;
  protected readonly categoria = CATEGORIA_LABEL;
  protected readonly prioridad = PRIORIDAD_CASO_BADGE;
  protected readonly estado = ESTADO_BADGE;
  protected readonly tonoConfianza = tonoConfianza;
  protected readonly textoPlazo = textoPlazo;

  protected clasePlazo(caso: Caso): string {
    return estaVencido(caso) ? PLAZO_VENCIDO : PLAZO_NORMAL;
  }
}
