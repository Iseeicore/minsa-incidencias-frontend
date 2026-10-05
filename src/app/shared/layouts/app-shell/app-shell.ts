import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { SessionStore } from "@/core/auth/session.store";
import { NAV_SECTIONS } from "@/core/nav/nav.config";
import { visibleNav } from "@/core/nav/visible-nav";
import { ROUTE } from "@/shared/constants/routes";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

const NARROW_SCREEN_QUERY = "(max-width: 1023px)";

@Component({
  selector: "app-shell",
  imports: [RouterOutlet, Sidebar, Topbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./app-shell.html",
})
export class AppShell {
  private readonly store = inject(SessionStore);
  private readonly router = inject(Router);

  protected readonly compact = signal(globalThis.matchMedia?.(NARROW_SCREEN_QUERY).matches ?? false);
  protected readonly nombre = computed(() => this.store.sesion()?.nombreCompleto ?? "");
  protected readonly correo = computed(() => this.store.sesion()?.correo ?? "");
  protected readonly secciones = computed(() => visibleNav(NAV_SECTIONS, this.store.sesion()?.modulos ?? []));

  protected alternarMenu(): void {
    this.compact.update((valor) => !valor);
  }

  protected async cerrarSesion(): Promise<void> {
    await this.store.cerrar();
    await this.router.navigateByUrl(ROUTE.LOGIN);
  }
}
