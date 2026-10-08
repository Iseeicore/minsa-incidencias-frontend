import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { SIN_DATO_QR } from "@/features/qr/constants/qr-constants";
import type { EstablecimientoQr } from "@/features/qr/types/establecimiento-qr.types";
import { ButtonSize } from "@/shared/enums/button.enum";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Button } from "@/shared/ui/button/button";
import { Icon } from "@/shared/ui/icon/icon";
import { ScrollArea } from "@/shared/ui/scroll-area/scroll-area";

const ENCABEZADO = "bg-white pb-3 pr-6 text-xs font-medium text-gray-500";

const COLUMNAS: readonly { readonly key: string; readonly label: string }[] = [
  { key: "establecimiento", label: "Establecimiento" },
  { key: "renipress", label: "RENIPRESS" },
  { key: "nivel", label: "Nivel" },
  { key: "categoria", label: "Categoría" },
  { key: "acciones", label: "Acciones" },
];

@Component({
  selector: "app-establecimientos-tabla",
  imports: [Button, Icon, ScrollArea],
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
          @for (establecimiento of establecimientos(); track establecimiento.id) {
            <tr>
              <td class="py-3 pr-6 font-medium text-gray-900">{{ establecimiento.nombre }}</td>
              <td class="py-3 pr-6 text-gray-700">{{ establecimiento.codigoRenipress }}</td>
              <td class="py-3 pr-6 text-gray-700">{{ establecimiento.nivelAtencion ?? sinDato }}</td>
              <td class="py-3 pr-6 text-gray-700">{{ establecimiento.categoria ?? sinDato }}</td>
              <td class="py-3">
                <app-button [size]="ButtonSize.SM" (click)="generar.emit(establecimiento)">
                  <app-icon [name]="IconName.QR_CODE" [size]="16" />
                  Generar QR<span class="sr-only"> de {{ establecimiento.nombre }}</span>
                </app-button>
              </td>
            </tr>
          }
        </tbody>
      </table>
    </app-scroll-area>
  `,
})
export class EstablecimientosTabla {
  readonly establecimientos = input.required<readonly EstablecimientoQr[]>();
  readonly descripcion = input("Listado de establecimientos");
  readonly generar = output<EstablecimientoQr>();

  protected readonly ButtonSize = ButtonSize;
  protected readonly IconName = IconName;
  protected readonly columnas = COLUMNAS;
  protected readonly encabezado = ENCABEZADO;
  protected readonly sinDato = SIN_DATO_QR;
}
