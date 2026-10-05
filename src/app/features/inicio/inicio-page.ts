import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { Router } from "@angular/router";
import { SessionStore } from "@/core/auth/session.store";
import { ROUTE } from "@/shared/constants/routes";
import { ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Button } from "@/shared/ui/button/button";
import { MODULO_LABELS } from "./constants/modulo-labels";

@Component({
  selector: "app-inicio-page",
  imports: [Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./inicio-page.html",
})
export class InicioPage {
  private readonly store = inject(SessionStore);
  private readonly router = inject(Router);

  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;

  protected readonly sesion = this.store.sesion;
  protected readonly modulos = computed(() => (this.sesion()?.modulos ?? []).map((codigo) => MODULO_LABELS[codigo]));

  protected async cerrarSesion(): Promise<void> {
    await this.store.cerrar();
    await this.router.navigateByUrl(ROUTE.LOGIN);
  }
}
