import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { MENSAJE_QR } from "@/features/qr/constants/qr-constants";
import { MiEstablecimientoStore } from "@/features/qr/mi-establecimiento.store";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { QrPanel } from "./qr-panel";

/** Vista del establecimiento: solo el QR del suyo, con el mensaje y la descarga. */
@Component({
  selector: "app-qr-propio",
  imports: [Alert, Button, Card, QrPanel],
  providers: [MiEstablecimientoStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block md:max-w-lg" },
  template: `
    <app-card>
      @if (propio.establecimiento(); as establecimiento) {
        <app-qr-panel [nombre]="establecimiento.nombre" [codigoRenipress]="establecimiento.codigoRenipress" />
      } @else if (propio.error(); as mensaje) {
        <div class="space-y-3">
          <app-alert [tone]="BadgeTone.DANGER">{{ mensaje }}</app-alert>
          <app-button [variant]="ButtonVariant.OUTLINE" [tone]="ButtonTone.NEUTRAL" [size]="ButtonSize.SM" (click)="propio.cargar()">
            Reintentar
          </app-button>
        </div>
      } @else if (propio.vacio()) {
        <p class="py-10 text-center text-sm font-medium text-gray-700">{{ sinEstablecimiento }}</p>
      } @else {
        <p class="py-10 text-center text-sm font-medium text-gray-700" aria-live="polite">Cargando tu establecimiento…</p>
      }
    </app-card>
  `,
})
export class QrPropio {
  protected readonly propio = inject(MiEstablecimientoStore);
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly sinEstablecimiento = MENSAJE_QR.SIN_ESTABLECIMIENTO;
}
