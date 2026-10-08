import { computed, inject, Injectable, signal } from "@angular/core";
import { RolCodigo } from "@/shared/enums/rol-codigo.enum";
import { AuthService } from "./auth.service";
import type { SesionUsuario } from "./auth.types";

@Injectable({ providedIn: "root" })
export class SessionStore {
  private readonly auth = inject(AuthService);

  readonly sesion = signal<SesionUsuario | null>(null);
  readonly autenticado = computed(() => this.sesion() !== null);
  readonly area = computed(() => this.sesion()?.area ?? null);
  /** Sin área (solo el ADMINISTRADOR) la persona ve casos de todos los establecimientos. Solo ordena la pantalla: el servidor decide qué devuelve. */
  readonly veTodasLasAreas = computed(() => this.sesion() !== null && !this.sesion()?.area);

  /** El superadministrador ve todo el menú, también las pantallas que aún no existen (en gris). */
  readonly esAdministrador = computed(() => this.sesion()?.roles.includes(RolCodigo.ADMINISTRADOR) ?? false);

  async cargar(): Promise<boolean> {
    try {
      this.sesion.set(await this.auth.me());
      return true;
    } catch {
      this.sesion.set(null);
      return false;
    }
  }

  async cerrar(): Promise<void> {
    try {
      await this.auth.logout();
    } finally {
      this.sesion.set(null);
    }
  }

  limpiar(): void {
    this.sesion.set(null);
  }
}
