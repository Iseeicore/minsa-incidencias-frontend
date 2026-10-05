import { ChangeDetectionStrategy, Component, computed, input } from "@angular/core";
import { niceScale } from "@/shared/utils/nice-scale";

export interface BarDatum {
  readonly label: string;
  readonly base: number;
  readonly extra: number;
}

const FORMATO_NUMERO = new Intl.NumberFormat("es-PE");

@Component({
  selector: "app-bar-chart",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <div class="mb-4 flex justify-end gap-4 text-xs font-medium text-gray-600">
      <span class="inline-flex items-center gap-2">
        <span class="size-2.5 rounded-sm bg-gray-900"></span>
        {{ baseLabel() }}
      </span>
      <span class="inline-flex items-center gap-2">
        <span class="size-2.5 rounded-sm bg-primary-500"></span>
        {{ extraLabel() }}
      </span>
    </div>

    <div class="flex gap-3">
      <div class="flex h-56 w-10 flex-col justify-between text-right text-xs font-medium text-gray-500" aria-hidden="true">
        @for (marca of escala().ticks; track marca) {
          <span class="leading-none">{{ formato(marca) }}</span>
        }
      </div>

      <div class="min-w-0 flex-1">
        <div class="relative h-56">
          <div class="absolute inset-0 flex flex-col justify-between" aria-hidden="true">
            @for (marca of escala().ticks; track marca) {
              <div class="border-t border-dashed border-gray-200"></div>
            }
          </div>
          <div role="img" [attr.aria-label]="description()" class="absolute inset-0 flex items-end gap-2 sm:gap-4">
            @for (barra of barras(); track barra.label) {
              <div class="flex h-full min-w-0 flex-1 items-end justify-center">
                <div
                  class="flex w-full max-w-12 flex-col-reverse gap-0.5"
                  [style.height.%]="barra.alto"
                  [attr.title]="barra.titulo"
                >
                  <div class="min-h-0 basis-0 rounded-lg bg-gray-900" [style.flex-grow]="barra.base"></div>
                  <div class="min-h-0 basis-0 rounded-lg bg-hatched" [style.flex-grow]="barra.extra"></div>
                </div>
              </div>
            }
          </div>
        </div>
        <div class="mt-3 flex gap-2 sm:gap-4" aria-hidden="true">
          @for (barra of barras(); track barra.label) {
            <span class="min-w-0 flex-1 truncate text-center text-xs font-medium text-gray-500">{{ barra.label }}</span>
          }
        </div>
      </div>
    </div>
  `,
})
export class BarChart {
  readonly data = input.required<readonly BarDatum[]>();
  readonly description = input.required<string>();
  readonly baseLabel = input.required<string>();
  readonly extraLabel = input.required<string>();

  protected readonly escala = computed(() =>
    niceScale(Math.max(0, ...this.data().map((item) => item.base + item.extra))),
  );

  protected readonly barras = computed(() => {
    const { max } = this.escala();
    return this.data().map((item) => ({
      ...item,
      alto: Math.round(((item.base + item.extra) / max) * 100),
      titulo: `${item.label}: ${item.base + item.extra} (${this.baseLabel()} ${item.base}, ${this.extraLabel()} ${item.extra})`,
    }));
  });

  protected formato(valor: number): string {
    return FORMATO_NUMERO.format(valor);
  }
}
