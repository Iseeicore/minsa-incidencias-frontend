import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from "@angular/core";
import { SessionStore } from "@/core/auth/session.store";
import { AreaSelector } from "@/features/casos/components/area-selector";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import {
  MENSAJE_USUARIOS,
  opcionesDeRol,
  ROL_LABEL,
  ROLES_ASIGNABLES_POR_ADMINISTRADOR,
  ROLES_ASIGNABLES_POR_ESTABLECIMIENTO,
  SIN_AREA_USUARIO,
  SIN_ELEGIR,
  SIN_ROL,
  TIPO_AREA_POR_ROL,
  TOPE_USUARIOS_ACTIVOS,
} from "@/features/usuarios/constants/usuarios-constants";
import { ListaUsuariosStore } from "@/features/usuarios/lista-usuarios.store";
import type { CredencialInicial, Usuario } from "@/features/usuarios/types/usuario.types";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { RolCodigo } from "@/shared/enums/rol-codigo.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Badge } from "@/shared/ui/badge/badge";
import { Button } from "@/shared/ui/button/button";
import { Drawer } from "@/shared/ui/drawer/drawer";
import { SelectField } from "@/shared/ui/select-field/select-field";

const PasoConfirmacion = {
  DESACTIVAR: "desactivar",
  ACTIVAR: "activar",
  RESTABLECER: "restablecer",
} as const;
type PasoConfirmacion = (typeof PasoConfirmacion)[keyof typeof PasoConfirmacion];

type Aviso = { readonly ok: boolean; readonly texto: string };

/**
 * Panel para editar un usuario: cambiar el rol, activar o desactivar la cuenta y restablecer la clave. Lo que
 * desactiva o restablece pide una confirmación explícita. Quien edita no puede cambiar su propio rol ni desactivarse
 * (el servidor también lo rechaza).
 */
@Component({
  selector: "app-usuario-edicion",
  imports: [Alert, AreaSelector, Badge, Button, Drawer, SelectField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-drawer
      titulo="Editar usuario"
      [subtitulo]="actual()?.nombreCompleto"
      [abierto]="usuario() !== null"
      (abiertoChange)="alCambiarPanel($event)"
    >
      @if (actual(); as u) {
        <div class="space-y-6">
          @if (aviso(); as mensaje) {
            <app-alert [tone]="mensaje.ok ? BadgeTone.SUCCESS : BadgeTone.DANGER">{{ mensaje.texto }}</app-alert>
          }

          <dl class="space-y-2 text-sm">
            <div class="flex gap-4">
              <dt class="w-20 shrink-0 font-medium text-gray-500">Correo</dt>
              <dd class="min-w-0 break-all text-gray-900">{{ u.correo }}</dd>
            </div>
            <div class="flex gap-4">
              <dt class="w-20 shrink-0 font-medium text-gray-500">Rol</dt>
              <dd class="text-gray-900">{{ u.rol ? rolLabel[u.rol] : sinRol }}</dd>
            </div>
            <div class="flex gap-4">
              <dt class="w-20 shrink-0 font-medium text-gray-500">Área</dt>
              <dd class="min-w-0 text-gray-900">{{ u.area?.nombre ?? sinArea }}</dd>
            </div>
            <div class="flex gap-4">
              <dt class="w-20 shrink-0 font-medium text-gray-500">Estado</dt>
              <dd>
                <app-badge [tone]="u.activo ? BadgeTone.SUCCESS : BadgeTone.NEUTRAL">{{ u.activo ? "Activo" : "Inactivo" }}</app-badge>
              </dd>
            </div>
          </dl>

          @if (esPropio()) {
            <app-alert [tone]="BadgeTone.NEUTRAL">{{ mensajeAutoedicion }}</app-alert>
          }

          @if (paso(); as pendiente) {
            <section aria-label="Confirmación" class="space-y-3">
              <app-alert [tone]="BadgeTone.WARNING">{{ textoDeConfirmacion(pendiente, u) }}</app-alert>
              <div class="flex flex-wrap gap-2">
                <app-button
                  [tone]="pendiente === Paso.DESACTIVAR ? ButtonTone.DANGER : ButtonTone.PRIMARY"
                  [loading]="procesando()"
                  (click)="confirmar(pendiente, u)"
                >
                  {{ etiquetaDeConfirmacion[pendiente] }}
                </app-button>
                <app-button [variant]="ButtonVariant.OUTLINE" [tone]="ButtonTone.NEUTRAL" [disabled]="procesando()" (click)="paso.set(null)">
                  Volver
                </app-button>
              </div>
            </section>
          } @else {
            <section aria-labelledby="edicion-rol" class="space-y-3">
              <h3 id="edicion-rol" class="text-sm font-bold text-gray-900">Cambiar el rol</h3>
              <app-select-field label="Rol del usuario" [etiquetaVisible]="true" [options]="opcionesRol()" [(value)]="rol" />
              @if (necesitaArea()) {
                <app-area-selector
                  label="Área del usuario"
                  placeholder="Busca el área..."
                  [tipo]="tipoAreaNueva() ?? undefined"
                  [(seleccionada)]="area"
                />
              }
              <app-button [disabled]="!puedeGuardarRol()" [loading]="procesando()" (click)="guardarRol(u)">Guardar rol</app-button>
            </section>

            <section aria-labelledby="edicion-cuenta" class="space-y-3">
              <h3 id="edicion-cuenta" class="text-sm font-bold text-gray-900">Cuenta</h3>
              @if (u.activo) {
                <app-button
                  [variant]="ButtonVariant.OUTLINE"
                  [tone]="ButtonTone.DANGER"
                  [disabled]="esPropio() || procesando()"
                  (click)="paso.set(Paso.DESACTIVAR)"
                >
                  Desactivar usuario
                </app-button>
              } @else {
                <app-button [disabled]="procesando()" (click)="paso.set(Paso.ACTIVAR)">Activar usuario</app-button>
              }
            </section>

            <section aria-labelledby="edicion-clave" class="space-y-3">
              <h3 id="edicion-clave" class="text-sm font-bold text-gray-900">Clave</h3>
              <p class="text-sm text-gray-600">Si la persona olvidó su clave, genera una nueva. La actual dejará de servir.</p>
              <app-button
                [variant]="ButtonVariant.OUTLINE"
                [tone]="ButtonTone.NEUTRAL"
                [disabled]="procesando()"
                (click)="paso.set(Paso.RESTABLECER)"
              >
                Restablecer clave
              </app-button>
            </section>
          }
        </div>
      }
    </app-drawer>
  `,
})
export class UsuarioEdicion {
  private readonly lista = inject(ListaUsuariosStore);
  private readonly sesion = inject(SessionStore);

  readonly usuario = input.required<Usuario | null>();
  readonly cerrado = output();
  readonly claveRestablecida = output<CredencialInicial>();

  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly Paso = PasoConfirmacion;
  protected readonly rolLabel = ROL_LABEL;
  protected readonly sinRol = SIN_ROL;
  protected readonly sinArea = SIN_AREA_USUARIO;
  protected readonly mensajeAutoedicion = MENSAJE_USUARIOS.AUTOEDICION;
  protected readonly etiquetaDeConfirmacion: Readonly<Record<PasoConfirmacion, string>> = {
    [PasoConfirmacion.DESACTIVAR]: "Sí, desactivar",
    [PasoConfirmacion.ACTIVAR]: "Sí, activar",
    [PasoConfirmacion.RESTABLECER]: "Sí, restablecer la clave",
  };

  /** El usuario con los cambios ya guardados; arranca con el que se eligió. */
  protected readonly actual = signal<Usuario | null>(null);
  protected readonly rol = signal<string>(SIN_ELEGIR);
  protected readonly area = signal<AreaOpcion | null>(null);
  protected readonly paso = signal<PasoConfirmacion | null>(null);
  protected readonly aviso = signal<Aviso | null>(null);
  protected readonly procesando = signal(false);

  protected readonly esPropio = computed(() => {
    const correo = this.actual()?.correo.toLowerCase();
    return correo !== undefined && correo === this.sesion.sesion()?.correo.toLowerCase();
  });

  protected readonly opcionesRol = computed(() =>
    opcionesDeRol(this.sesion.veTodasLasAreas() ? ROLES_ASIGNABLES_POR_ADMINISTRADOR : ROLES_ASIGNABLES_POR_ESTABLECIMIENTO),
  );

  protected readonly tipoAreaNueva = computed(() => TIPO_AREA_POR_ROL[this.rol() as RolCodigo] ?? null);

  /** Solo el administrador mueve de área, y solo si el rol nuevo exige un área que el usuario no tiene. */
  protected readonly necesitaArea = computed(() => {
    const actual = this.actual();
    const nuevo = this.tipoAreaNueva();
    if (!this.sesion.veTodasLasAreas() || !actual || nuevo === null) return false;
    const tipoActual = actual.rol ? TIPO_AREA_POR_ROL[actual.rol] : null;
    return actual.area === null || nuevo !== tipoActual;
  });

  protected readonly cambiaRol = computed(() => this.rol() !== SIN_ELEGIR && this.rol() !== (this.actual()?.rol ?? SIN_ELEGIR));
  protected readonly puedeGuardarRol = computed(
    () => this.cambiaRol() && !this.esPropio() && (!this.necesitaArea() || this.area() !== null) && !this.procesando(),
  );

  constructor() {
    effect(() => {
      const elegido = this.usuario();
      untracked(() => {
        this.actual.set(elegido);
        this.rol.set(elegido?.rol ?? SIN_ELEGIR);
        this.area.set(null);
        this.paso.set(null);
        this.aviso.set(null);
        this.procesando.set(false);
      });
    });
    effect(() => {
      this.rol();
      untracked(() => this.area.set(null));
    });
  }

  protected alCambiarPanel(abierto: boolean): void {
    if (!abierto) this.cerrado.emit();
  }

  protected textoDeConfirmacion(paso: PasoConfirmacion, usuario: Usuario): string {
    switch (paso) {
      case PasoConfirmacion.DESACTIVAR:
        return `Al desactivar a ${usuario.nombreCompleto} ya no podrá ingresar y se cerrará su sesión. Podrás activarla de nuevo mientras el establecimiento tenga lugar (hasta ${TOPE_USUARIOS_ACTIVOS} usuarios activos).`;
      case PasoConfirmacion.ACTIVAR:
        return `Al activar a ${usuario.nombreCompleto} podrá ingresar de nuevo. Un establecimiento puede tener hasta ${TOPE_USUARIOS_ACTIVOS} usuarios activos.`;
      case PasoConfirmacion.RESTABLECER:
        return `Se generará una clave nueva para ${usuario.nombreCompleto} y la actual dejará de servir. La clave nueva se muestra una sola vez.`;
    }
  }

  protected async guardarRol(usuario: Usuario): Promise<void> {
    if (!this.puedeGuardarRol()) return;
    const area = this.necesitaArea() ? this.area()?.codigo : undefined;
    await this.ejecutar(async () => {
      const resultado = await this.lista.cambiar(usuario.id, { rol: this.rol() as RolCodigo, ...(area && { area }) });
      if (resultado.ok) {
        this.actual.set(resultado.usuario);
        this.rol.set(resultado.usuario.rol ?? SIN_ELEGIR);
        return { ok: true, texto: "El rol se actualizó. Si la persona tenía una sesión abierta, deberá ingresar de nuevo." };
      }
      return { ok: false, texto: resultado.error };
    });
  }

  protected async confirmar(paso: PasoConfirmacion, usuario: Usuario): Promise<void> {
    if (paso === PasoConfirmacion.RESTABLECER) {
      await this.restablecer(usuario);
      return;
    }
    const activar = paso === PasoConfirmacion.ACTIVAR;
    await this.ejecutar(async () => {
      const resultado = await this.lista.cambiar(usuario.id, { activo: activar });
      if (resultado.ok) {
        this.actual.set(resultado.usuario);
        return { ok: true, texto: activar ? "El usuario quedó activo." : "El usuario quedó desactivado." };
      }
      return { ok: false, texto: resultado.error };
    });
  }

  private async restablecer(usuario: Usuario): Promise<void> {
    await this.ejecutar(async () => {
      const resultado = await this.lista.restablecerClave(usuario.id);
      if (!resultado.ok) return { ok: false, texto: resultado.error };
      this.claveRestablecida.emit({
        nombreCompleto: resultado.usuario.nombreCompleto,
        correo: resultado.usuario.correo,
        claveInicial: resultado.claveInicial,
        restablecida: true,
      });
      this.cerrado.emit();
      return null;
    });
  }

  private async ejecutar(accion: () => Promise<Aviso | null>): Promise<void> {
    if (this.procesando()) return;
    this.procesando.set(true);
    this.aviso.set(null);
    const elegido = this.usuario();
    try {
      const resultado = await accion();
      if (this.usuario() !== elegido) return;
      this.aviso.set(resultado);
      this.paso.set(null);
    } finally {
      this.procesando.set(false);
    }
  }
}
