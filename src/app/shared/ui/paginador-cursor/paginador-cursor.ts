import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Button } from "@/shared/ui/button/button";

/**
 * Paginación por cursor: sin total ni números de página, solo «Anterior» y «Siguiente». La pila de cursores ya
 * visitados la guarda quien lo usa; aquí solo se avisa de la intención.
 */
@Component({
  selector: "app-paginador-cursor",
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    @if (cantidad() > 0 || hayAnterior()) {
      <nav [attr.aria-label]="label()" class="flex flex-col items-center gap-3 sm:flex-row sm:justify-between">
        <p class="text-sm font-medium text-gray-600" aria-live="polite">
          Página {{ pagina() }} · {{ cantidad() }} {{ cantidad() === 1 ? singular() : plural() }}{{ hayMas() ? " · hay más" : "" }}
        </p>
        <div class="flex items-center gap-2">
          <app-button
            [variant]="ButtonVariant.OUTLINE"
            [tone]="ButtonTone.NEUTRAL"
            [size]="ButtonSize.SM"
            [disabled]="!hayAnterior() || cargando()"
            (click)="anterior.emit()"
          >
            Anterior<span class="sr-only"> página</span>
          </app-button>
          <app-button
            [variant]="ButtonVariant.OUTLINE"
            [tone]="ButtonTone.NEUTRAL"
            [size]="ButtonSize.SM"
            [disabled]="!hayMas() || cargando()"
            (click)="siguiente.emit()"
          >
            Siguiente<span class="sr-only"> página</span>
          </app-button>
        </div>
      </nav>
    }
  `,
})
export class PaginadorCursor {
  readonly pagina = input.required<number>();
  readonly cantidad = input.required<number>();
  readonly hayAnterior = input.required<boolean>();
  readonly hayMas = input.required<boolean>();
  readonly cargando = input(false);
  readonly label = input("Paginación");
  readonly singular = input("caso");
  readonly plural = input("casos");
  readonly anterior = output();
  readonly siguiente = output();

  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
}
