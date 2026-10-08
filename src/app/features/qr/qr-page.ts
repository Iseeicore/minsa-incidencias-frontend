import { ChangeDetectionStrategy, Component, inject } from "@angular/core";
import { SessionStore } from "@/core/auth/session.store";
import { QrAdministrador } from "@/features/qr/components/qr-administrador";
import { QrPropio } from "@/features/qr/components/qr-propio";

@Component({
  selector: "app-qr-page",
  imports: [QrAdministrador, QrPropio],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./qr-page.html",
})
export class QrPage {
  protected readonly esAdministrador = inject(SessionStore).esAdministrador;
}
