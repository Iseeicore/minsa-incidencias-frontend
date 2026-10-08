import { ChangeDetectionStrategy, Component, computed, input, output, signal } from "@angular/core";
import { MAX_REAPERTURA_MOTIVO, MIN_TEXTO_REVISION } from "@/features/casos/constants/casos-constants";
import { ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Button } from "@/shared/ui/button/button";
import { TextareaField } from "@/shared/ui/textarea-field/textarea-field";

/** Reabrir un caso archivado: el motivo queda registrado junto con quién lo reabrió. */
@Component({
  selector: "app-formulario-reapertura",
  imports: [Button, TextareaField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block space-y-3" },
  template: `
    <app-textarea-field
      label="Motivo de la reapertura"
      placeholder="Por qué el caso vuelve a revisarse"
      [rows]="4"
      [minlength]="minimo"
      [maxlength]="maximo"
      [(value)]="motivo"
    />
    <div class="flex flex-wrap gap-2">
      <app-button [disabled]="!valido() || procesando()" (click)="reabrir()">Confirmar reapertura</app-button>
      <app-button [variant]="ButtonVariant.OUTLINE" [tone]="ButtonTone.NEUTRAL" (click)="cancelar.emit()">Cancelar</app-button>
    </div>
  `,
})
export class FormularioReapertura {
  readonly procesando = input(false);
  readonly enviar = output<string>();
  readonly cancelar = output();

  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly minimo = MIN_TEXTO_REVISION;
  protected readonly maximo = MAX_REAPERTURA_MOTIVO;

  protected readonly motivo = signal("");
  protected readonly valido = computed(() => this.motivo().trim().length >= this.minimo);

  protected reabrir(): void {
    if (this.valido()) this.enviar.emit(this.motivo());
  }
}
