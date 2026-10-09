import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { CasosStore } from "@/features/casos/casos.store";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";

@Component({
  selector: "app-aviso-envio",
  imports: [Alert, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    @if (store.avisoEnvio(); as mensaje) {
      <app-alert [tone]="BadgeTone.SUCCESS">
        <div class="flex flex-wrap items-center justify-between gap-3">
          <span class="min-w-0">{{ mensaje }}</span>
          <app-button [variant]="ButtonVariant.OUTLINE" [tone]="ButtonTone.NEUTRAL" [size]="ButtonSize.SM" (click)="store.descartarAvisoEnvio()">
            Entendido
          </app-button>
        </div>
      </app-alert>
    }
  `,
})
export class AvisoEnvio {
  protected readonly store = inject(CasosStore);
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
}
