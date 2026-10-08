import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";

export interface HBarDatum {
  readonly label: string;
  readonly valor: number;
  /** Texto de apoyo a la derecha del valor, por ejemplo "48 %". */
  readonly detalle?: string;
}

const COLORES = ["bg-gray-900", "bg-primary-500", "bg-primary-700", "bg-gray-400"] as const;
const FORMATO_NUMERO = new Intl.NumberFormat("es-PE");

/** Lista de barras horizontales: cada barra mide su valor contra el mayor de la lista. */
@Component({
  selector: "app-hbar-list",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <ul class="space-y-4" role="list" [attr.aria-label]="label()">
      @for (fila of filas(); track fila.label) {
        <li>
          <div class="mb-1.5 flex items-baseline justify-between gap-3 text-sm">
            <span class="min-w-0 truncate font-medium text-gray-700">{{ fila.label }}</span>
            <span class="shrink-0 tabular-nums">
              <span class="font-bold text-gray-900">{{ fila.texto }}</span>
              @if (fila.detalle) {
                <span class="ml-1.5 text-xs font-medium text-gray-500">{{ fila.detalle }}</span>
              }
            </span>
          </div>
          <div class="h-3 overflow-hidden rounded-full bg-gray-100">
            <div
              role="progressbar"
              aria-valuemin="0"
              [attr.aria-valuemax]="maximo()"
              [attr.aria-valuenow]="fila.valor"
              [attr.aria-label]="fila.label"
              class="h-full rounded-full transition-[width] duration-500"
              [class]="fila.color"
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
    this.data().map((fila, indice) => ({
      ...fila,
      texto: FORMATO_NUMERO.format(fila.valor),
      color: COLORES[indice % COLORES.length],
      ancho: fila.valor === 0 ? 0 : Math.max(3, Math.round((fila.valor / this.maximo()) * 100)),
    })),
  );
}
