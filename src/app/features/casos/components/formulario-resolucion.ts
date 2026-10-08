import { ChangeDetectionStrategy, Component, computed, input, output, signal } from "@angular/core";
import { MAX_RESOLUCION, MIN_TEXTO_REVISION, OPCIONES_RESULTADO } from "@/features/casos/constants/casos-constants";
import type { ResultadoResolucion } from "@/features/casos/enums/resultado-resolucion.enum";
import type { DatosResolucion } from "@/features/casos/types/caso.types";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";
import { SelectField } from "@/shared/ui/select-field/select-field";
import { TextareaField } from "@/shared/ui/textarea-field/textarea-field";

/** Cierre del caso: qué medidas se tomaron, por qué y con qué resultado. */
@Component({
  selector: "app-formulario-resolucion",
  imports: [Alert, Button, SelectField, TextareaField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block space-y-3" },
  template: `
    <app-textarea-field
      label="Medidas tomadas"
      placeholder="Qué se hizo para atender el caso"
      [rows]="4"
      [minlength]="minimo"
      [maxlength]="maximo"
      [(value)]="medidasTomadas"
    />
    <app-textarea-field
      label="Fundamento"
      placeholder="Por qué se tomaron esas medidas"
      [rows]="4"
      [minlength]="minimo"
      [maxlength]="maximo"
      [(value)]="fundamento"
    />
    <app-select-field label="Resultado" [etiquetaVisible]="true" [options]="opcionesResultado" [(value)]="resultado" />
    <app-alert [tone]="BadgeTone.WARNING">
      Al registrar la resolución el caso queda resuelto y no se puede deshacer.
    </app-alert>
    <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
      <app-button [icon]="IconName.RESOLVE" [disabled]="!valido() || procesando()" (click)="registrar()">Registrar resolución</app-button>
      <app-button [variant]="ButtonVariant.OUTLINE" [tone]="ButtonTone.NEUTRAL" [icon]="IconName.CLOSE" (click)="cancelar.emit()">Cancelar</app-button>
    </div>
  `,
})
export class FormularioResolucion {
  readonly procesando = input(false);
  readonly enviar = output<DatosResolucion>();
  readonly cancelar = output();

  protected readonly BadgeTone = BadgeTone;
  protected readonly IconName = IconName;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly minimo = MIN_TEXTO_REVISION;
  protected readonly maximo = MAX_RESOLUCION;
  protected readonly opcionesResultado = OPCIONES_RESULTADO;

  protected readonly medidasTomadas = signal("");
  protected readonly fundamento = signal("");
  protected readonly resultado = signal("");

  protected readonly valido = computed(
    () =>
      this.medidasTomadas().trim().length >= this.minimo &&
      this.fundamento().trim().length >= this.minimo &&
      this.resultado() !== "",
  );

  protected registrar(): void {
    if (!this.valido()) return;
    this.enviar.emit({
      medidasTomadas: this.medidasTomadas(),
      fundamento: this.fundamento(),
      resultado: this.resultado() as ResultadoResolucion,
    });
  }
}
