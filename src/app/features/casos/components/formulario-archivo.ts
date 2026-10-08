import { ChangeDetectionStrategy, Component, computed, input, output, signal } from "@angular/core";
import {
  MAX_ARCHIVO_DETALLE,
  MIN_TEXTO_REVISION,
  OPCIONES_MOTIVO_ARCHIVO_MANUAL,
} from "@/features/casos/constants/casos-constants";
import type { MotivoArchivo } from "@/features/casos/enums/motivo-archivo.enum";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";
import { SelectField } from "@/shared/ui/select-field/select-field";
import { TextareaField } from "@/shared/ui/textarea-field/textarea-field";

export interface DatosArchivo {
  readonly motivo: MotivoArchivo;
  readonly detalle: string;
}

/** Archivar a mano: motivo, justificación y una confirmación explícita antes de enviar. */
@Component({
  selector: "app-formulario-archivo",
  imports: [Alert, Button, SelectField, TextareaField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block space-y-3" },
  template: `
    @if (!confirmando()) {
      <app-select-field label="Motivo del archivo" [etiquetaVisible]="true" [options]="opcionesMotivo" [(value)]="motivo" />
      <app-textarea-field
        label="Justificación"
        placeholder="Explica por qué el caso se archiva"
        [rows]="4"
        [minlength]="minimo"
        [maxlength]="maximo"
        [(value)]="detalle"
      />
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <app-button [icon]="IconName.ARCHIVE" [disabled]="!valido() || procesando()" (click)="confirmando.set(true)">Archivar el caso</app-button>
        <app-button [variant]="ButtonVariant.OUTLINE" [tone]="ButtonTone.NEUTRAL" [icon]="IconName.CLOSE" (click)="cancelar.emit()">Cancelar</app-button>
      </div>
    } @else {
      <app-alert [tone]="BadgeTone.WARNING">
        Al archivar el caso deja de contar para el entrenamiento de la IA y sale de las bandejas activas. Podrás
        reabrirlo después. ¿Confirmas que quieres archivarlo?
      </app-alert>
      <div class="flex flex-col gap-2 sm:flex-row sm:flex-wrap">
        <app-button [tone]="ButtonTone.DANGER" [icon]="IconName.ARCHIVE" [disabled]="procesando()" (click)="archivar()">Sí, archivar el caso</app-button>
        <app-button
          [variant]="ButtonVariant.OUTLINE"
          [tone]="ButtonTone.NEUTRAL"
          [icon]="IconName.CHEVRON_LEFT"
          [disabled]="procesando()"
          (click)="confirmando.set(false)"
        >
          Volver
        </app-button>
      </div>
    }
  `,
})
export class FormularioArchivo {
  readonly procesando = input(false);
  readonly enviar = output<DatosArchivo>();
  readonly cancelar = output();

  protected readonly BadgeTone = BadgeTone;
  protected readonly IconName = IconName;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly minimo = MIN_TEXTO_REVISION;
  protected readonly maximo = MAX_ARCHIVO_DETALLE;
  protected readonly opcionesMotivo = OPCIONES_MOTIVO_ARCHIVO_MANUAL;

  protected readonly motivo = signal("");
  protected readonly detalle = signal("");
  protected readonly confirmando = signal(false);

  protected readonly valido = computed(() => this.motivo() !== "" && this.detalle().trim().length >= this.minimo);

  protected archivar(): void {
    if (!this.valido()) return;
    this.enviar.emit({ motivo: this.motivo() as MotivoArchivo, detalle: this.detalle() });
  }
}
