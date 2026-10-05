import { ChangeDetectionStrategy, Component, computed, DestroyRef, inject, signal } from "@angular/core";
import { Router, RouterOutlet } from "@angular/router";
import { SessionStore } from "@/core/auth/session.store";
import { NAV_SECTIONS } from "@/core/nav/nav.config";
import { visibleNav } from "@/core/nav/visible-nav";
import { ROUTE } from "@/shared/constants/routes";
import { Sidebar } from "./sidebar";
import { Topbar } from "./topbar";

const SMALL_SCREEN_QUERY = "(max-width: 1023px)";

@Component({
  selector: "app-shell",
  imports: [RouterOutlet, Sidebar, Topbar],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { "(document:keydown.escape)": "cerrarMenu()" },
  templateUrl: "./app-shell.html",
})
export class AppShell {
  private readonly store = inject(SessionStore);
  private readonly router = inject(Router);
  private readonly smallScreen = globalThis.matchMedia?.(SMALL_SCREEN_QUERY);

  protected readonly pantallaChica = signal(this.smallScreen?.matches ?? false);
  protected readonly menuAbierto = signal(false);
  protected readonly compact = signal(false);
  protected readonly nombre = computed(() => this.store.sesion()?.nombreCompleto ?? "");
  protected readonly correo = computed(() => this.store.sesion()?.correo ?? "");
  protected readonly secciones = computed(() => visibleNav(NAV_SECTIONS, this.store.sesion()?.modulos ?? []));

  constructor() {
    const alCambiar = (evento: MediaQueryListEvent) => {
      this.pantallaChica.set(evento.matches);
      this.menuAbierto.set(false);
    };
    this.smallScreen?.addEventListener("change", alCambiar);
    inject(DestroyRef).onDestroy(() => this.smallScreen?.removeEventListener("change", alCambiar));
  }

  protected alternarMenu(): void {
    if (this.pantallaChica()) {
      this.menuAbierto.update((valor) => !valor);
    } else {
      this.compact.update((valor) => !valor);
    }
  }

  protected cerrarMenu(): void {
    this.menuAbierto.set(false);
  }

  protected async cerrarSesion(): Promise<void> {
    await this.store.cerrar();
    await this.router.navigateByUrl(ROUTE.LOGIN);
  }
}
