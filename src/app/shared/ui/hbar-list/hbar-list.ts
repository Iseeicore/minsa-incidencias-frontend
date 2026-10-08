import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { anchoBarra } from "@/shared/utils/ancho-barra";
import { formatearNumero } from "@/shared/utils/formatear-numero";

export interface HBarDatum {
  readonly label: string;
  readonly valor: number;
  /** Texto de apoyo junto al valor, por ejemplo «48 %». */
  readonly detalle?: string;
}

@Component({
  selector: "app-hbar-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block min-w-0" },
  template: `
    <ul class="space-y-4" role="list" [attr.aria-label]="label()">
      @for (fila of filas(); track $index) {
        <li>
          <div class="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span class="min-w-0 break-words font-medium text-gray-700">{{ fila.label }}</span>
            <span class="shrink-0 tabular-nums">
              <span class="font-bold text-gray-900">{{ fila.texto }}</span>
              @if (fila.detalle) {
                <span class="ml-1.5 text-xs font-medium text-gray-600">{{ fila.detalle }}</span>
              }
            </span>
          </div>
          <div class="h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              role="meter"
              aria-valuemin="0"
              [attr.aria-valuemax]="maximo()"
              [attr.aria-valuenow]="fila.valor"
              [attr.aria-label]="fila.label"
              class="h-full rounded-full bg-gray-900 transition-all duration-500 motion-reduce:transition-none"
              [style.width.%]="fila.ancho"
            ></div>
          </div>
        </li>
      }
    </ul>
  `,
})
export class HBarList {
  readonly data = input.required<readonly HBarDatum[]>();
  readonly label = input.required<string>();

  protected readonly maximo = computed(() => Math.max(1, ...this.data().map((fila) => fila.valor)));

  protected readonly filas = computed(() =>
    this.data().map((fila) => ({
      ...fila,
      texto: formatearNumero(fila.valor),
      ancho: anchoBarra(fila.valor, this.maximo()),
    })),
  );
}
