import { ChangeDetectionStrategy, Component, computed, effect, inject, model, output, signal, untracked } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { SessionStore } from "@/core/auth/session.store";
import { AreaSelector } from "@/features/casos/components/area-selector";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import {
  MAX_CORREO_USUARIO,
  MAX_NOMBRE_USUARIO,
  MENSAJE_CAMPO_USUARIO,
  MIN_NOMBRE_USUARIO,
  opcionesDeRol,
  ROLES_ASIGNABLES_POR_ADMINISTRADOR,
  ROLES_ASIGNABLES_POR_ESTABLECIMIENTO,
  SIN_ELEGIR,
  TIPO_AREA_POR_ROL,
} from "@/features/usuarios/constants/usuarios-constants";
import { ListaUsuariosStore } from "@/features/usuarios/lista-usuarios.store";
import type { CredencialInicial } from "@/features/usuarios/types/usuario.types";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { RolCodigo } from "@/shared/enums/rol-codigo.enum";
import { TipoArea } from "@/shared/enums/tipo-area.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";
import { Drawer } from "@/shared/ui/drawer/drawer";
import { FormField } from "@/shared/ui/form-field/form-field";
import { SelectField } from "@/shared/ui/select-field/select-field";
import { TextInput } from "@/shared/ui/text-input/text-input";
import { firstErrorMessage } from "@/shared/utils/form-errors";

/**
 * Panel para crear un usuario. Quien ve todas las áreas (administrador) elige rol y área; un establecimiento solo
 * elige entre los roles de su equipo y el servidor pone el área de su sesión. La clave inicial no se queda aquí:
 * se entrega a quien abrió el panel con `creado`.
 */
@Component({
  selector: "app-usuario-nuevo",
  imports: [Alert, AreaSelector, Button, Drawer, FormField, ReactiveFormsModule, SelectField, TextInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-drawer
      titulo="Nuevo usuario"
      subtitulo="La clave inicial se genera sola y se muestra una única vez"
      [abierto]="abierto()"
      (abiertoChange)="abierto.set($event)"
    >
      <form class="space-y-5" [formGroup]="form" (ngSubmit)="crear()" novalidate>
        @if (errorServidor(); as mensaje) {
          <app-alert [tone]="BadgeTone.DANGER">{{ mensaje }}</app-alert>
        }

        <app-form-field label="Nombre completo" fieldId="usuario-nombre" [error]="errores().nombreCompleto">
          <input
            appTextInput
            id="usuario-nombre"
            type="text"
            formControlName="nombreCompleto"
            autocomplete="off"
            [invalid]="!!errores().nombreCompleto"
          />
        </app-form-field>

        <app-form-field label="Correo" fieldId="usuario-correo" [error]="errores().correo">
          <input
            appTextInput
            id="usuario-correo"
            type="email"
            formControlName="correo"
            autocomplete="off"
            placeholder="nombre@minsa.gob.pe"
            [invalid]="!!errores().correo"
          />
        </app-form-field>

        <div>
          <app-select-field label="Rol" [etiquetaVisible]="true" [options]="opcionesRol()" [(value)]="rol" />
          @if (intentado() && rol() === sinElegir) {
            <p class="mt-1 text-sm text-danger-600" role="alert">Elige un rol.</p>
          }
        </div>

        @if (pideArea()) {
          <div>
            <app-area-selector
              label="Área"
              [placeholder]="tipoArea() === TipoArea.OTRANS ? 'Busca el área OTRANS...' : 'Busca el establecimiento...'"
              [tipo]="tipoArea() ?? undefined"
              [(seleccionada)]="area"
            />
            @if (intentado() && area() === null) {
              <p class="mt-1 text-sm text-danger-600" role="alert">Elige el área del usuario.</p>
            }
          </div>
        }

        <div class="flex flex-wrap gap-2">
          <app-button type="submit" [loading]="procesando()">Crear usuario</app-button>
          <app-button [variant]="ButtonVariant.OUTLINE" [tone]="ButtonTone.NEUTRAL" [disabled]="procesando()" (click)="abierto.set(false)">
            Cancelar
          </app-button>
        </div>
      </form>
    </app-drawer>
  `,
})
export class UsuarioNuevo {
  private readonly lista = inject(ListaUsuariosStore);
  private readonly veTodasLasAreas = inject(SessionStore).veTodasLasAreas;

  readonly abierto = model(false);
  readonly creado = output<CredencialInicial>();

  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly TipoArea = TipoArea;
  protected readonly sinElegir = SIN_ELEGIR;

  protected readonly form = new FormGroup({
    nombreCompleto: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.minLength(MIN_NOMBRE_USUARIO), Validators.maxLength(MAX_NOMBRE_USUARIO)],
    }),
    correo: new FormControl("", {
      nonNullable: true,
      validators: [Validators.required, Validators.email, Validators.maxLength(MAX_CORREO_USUARIO)],
    }),
  });

  protected readonly rol = signal<string>(SIN_ELEGIR);
  protected readonly area = signal<AreaOpcion | null>(null);
  protected readonly intentado = signal(false);
  protected readonly procesando = signal(false);
  protected readonly errorServidor = signal<string | null>(null);

  private readonly valores = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly opcionesRol = computed(() =>
    opcionesDeRol(this.veTodasLasAreas() ? ROLES_ASIGNABLES_POR_ADMINISTRADOR : ROLES_ASIGNABLES_POR_ESTABLECIMIENTO),
  );
  protected readonly tipoArea = computed(() => TIPO_AREA_POR_ROL[this.rol() as RolCodigo] ?? null);
  /** Solo quien ve todas las áreas elige el área, y solo para los roles que tienen una. */
  protected readonly pideArea = computed(() => this.veTodasLasAreas() && this.tipoArea() !== null);

  protected readonly errores = computed(() => {
    this.valores();
    if (!this.intentado()) return { nombreCompleto: null, correo: null };
    return {
      nombreCompleto: firstErrorMessage(this.form.controls.nombreCompleto, MENSAJE_CAMPO_USUARIO.nombreCompleto),
      correo: firstErrorMessage(this.form.controls.correo, MENSAJE_CAMPO_USUARIO.correo),
    };
  });

  constructor() {
    effect(() => {
      this.rol();
      untracked(() => this.area.set(null));
    });
    effect(() => {
      if (!this.abierto()) untracked(() => this.reiniciar());
    });
  }

  protected async crear(): Promise<void> {
    this.intentado.set(true);
    this.form.updateValueAndValidity();
    if (this.form.invalid || this.rol() === SIN_ELEGIR || (this.pideArea() && this.area() === null) || this.procesando()) return;

    const { nombreCompleto, correo } = this.form.getRawValue();
    const area = this.pideArea() ? this.area()?.codigo : undefined;
    this.procesando.set(true);
    this.errorServidor.set(null);
    try {
      const resultado = await this.lista.crear({
        nombreCompleto: nombreCompleto.trim(),
        correo: correo.trim().toLowerCase(),
        rol: this.rol() as RolCodigo,
        ...(area && { area }),
      });
      if (!resultado.ok) {
        this.errorServidor.set(resultado.error);
        return;
      }
      this.creado.emit({
        nombreCompleto: resultado.usuario.nombreCompleto,
        correo: resultado.usuario.correo,
        claveInicial: resultado.claveInicial,
        restablecida: false,
      });
      this.abierto.set(false);
    } finally {
      this.procesando.set(false);
    }
  }

  private reiniciar(): void {
    this.form.reset();
    this.rol.set(SIN_ELEGIR);
    this.area.set(null);
    this.intentado.set(false);
    this.procesando.set(false);
    this.errorServidor.set(null);
  }
}
