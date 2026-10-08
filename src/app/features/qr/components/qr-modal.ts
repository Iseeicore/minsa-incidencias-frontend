import { ChangeDetectionStrategy, Component, input, output } from "@angular/core";
import type { EstablecimientoQr } from "@/features/qr/types/establecimiento-qr.types";
import { Drawer } from "@/shared/ui/drawer/drawer";
import { QrPanel } from "./qr-panel";

/** Diálogo con el QR de un establecimiento: se abre cuando hay uno elegido y avisa al cerrarse (Esc, fondo o botón). */
@Component({
  selector: "app-qr-modal",
  imports: [Drawer, QrPanel],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-drawer
      titulo="Código QR de WhatsApp"
      subtitulo="Escanéalo para abrir el chat con el mensaje listo"
      [abierto]="establecimiento() !== null"
      (abiertoChange)="alCambiar($event)"
    >
      @if (establecimiento(); as elegido) {
        <app-qr-panel [nombre]="elegido.nombre" [codigoRenipress]="elegido.codigoRenipress" />
      }
    </app-drawer>
  `,
})
export class QrModal {
  readonly establecimiento = input.required<EstablecimientoQr | null>();
  readonly cerrado = output();

  protected alCambiar(abierto: boolean): void {
    if (!abierto) this.cerrado.emit();
  }
}
