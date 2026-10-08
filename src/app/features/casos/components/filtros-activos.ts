import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { FiltroActivoId } from "@/features/casos/enums/filtro-activo.enum";
import type { FiltroActivo } from "@/features/casos/types/filtro-activo.types";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Button } from "@/shared/ui/button/button";
import { ChipQuitable } from "@/shared/ui/chip-quitable/chip-quitable";

@Component({
  selector: "app-filtros-activos",
  imports: [Button, ChipQuitable],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block min-w-0" },
  template: `
    @if (filtros().length > 0) {
      <section aria-label="Filtros aplicados" class="flex min-w-0 flex-wrap items-center gap-2">
        <span class="text-sm font-medium text-gray-600">Filtros aplicados</span>
        @for (filtro of filtros(); track filtro.id) {
          <app-chip-quitable [label]="filtro.label" (quitar)="quitar.emit(filtro.id)" />
        }
        <app-button
          [variant]="ButtonVariant.OUTLINE"
          [tone]="ButtonTone.NEUTRAL"
          [size]="ButtonSize.SM"
          (click)="limpiar.emit()"
        >
          Limpiar todo
        </app-button>
      </section>
    }
  `,
})
export class FiltrosActivos {
  readonly filtros = input.required<readonly FiltroActivo[]>();
  readonly quitar = output<FiltroActivoId>();
  readonly limpiar = output();

  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
}
