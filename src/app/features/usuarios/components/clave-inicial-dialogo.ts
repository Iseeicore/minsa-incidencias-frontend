import { ChangeDetectionStrategy, Component, effect, input, output, signal, untracked } from "@angular/core";
import { MENSAJE_USUARIOS } from "@/features/usuarios/constants/usuarios-constants";
import type { CredencialInicial } from "@/features/usuarios/types/usuario.types";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";
import { Drawer } from "@/shared/ui/drawer/drawer";
import { Icon } from "@/shared/ui/icon/icon";

/**
 * Muestra la clave inicial una sola vez. La clave solo vive en la credencial que recibe: quien lo usa la borra al
 * recibir `cerrado`, y aquí no se guarda en ningún almacenamiento ni se escribe en la consola.
 */
@Component({
  selector: "app-clave-inicial-dialogo",
  imports: [Alert, Button, Drawer, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <app-drawer
      [titulo]="credencial()?.restablecida ? 'Clave restablecida' : 'Usuario creado'"
      subtitulo="Entrega esta clave a la persona"
      [abierto]="credencial() !== null"
      (abiertoChange)="alCambiar($event)"
    >
      @if (credencial(); as datos) {
        <div class="space-y-5">
          <dl class="space-y-2 text-sm">
            <div>
              <dt class="font-medium text-gray-500">Usuario</dt>
              <dd class="mt-1 text-gray-900">{{ datos.nombreCompleto }}</dd>
            </div>
            <div>
              <dt class="font-medium text-gray-500">Correo</dt>
              <dd class="mt-1 break-all text-gray-900">{{ datos.correo }}</dd>
            </div>
            <div>
              <dt class="font-medium text-gray-500">Clave inicial</dt>
              <dd class="mt-1">
                <code class="block select-all break-all rounded-md bg-gray-100 p-3 font-mono text-base font-bold text-gray-900">{{
                  datos.claveInicial
                }}</code>
              </dd>
            </div>
          </dl>

          <app-alert [tone]="BadgeTone.WARNING">
            No se volverá a mostrar. Cópiala ahora y entrégala por un medio seguro; si se pierde, restablece la clave del usuario.
          </app-alert>

          <div class="flex flex-wrap gap-2">
            <app-button (click)="copiar(datos.claveInicial)">
              <app-icon [name]="copiada() ? IconName.CHECK : IconName.COPY" [size]="16" />
              Copiar clave
            </app-button>
            <app-button [variant]="ButtonVariant.OUTLINE" [tone]="ButtonTone.NEUTRAL" (click)="cerrado.emit()">
              Listo, ya la copié
            </app-button>
          </div>

          @if (aviso(); as mensaje) {
            <p class="text-sm font-medium text-gray-700" aria-live="polite">{{ mensaje }}</p>
          }
        </div>
      }
    </app-drawer>
  `,
})
export class ClaveInicialDialogo {
  readonly credencial = input.required<CredencialInicial | null>();
  readonly cerrado = output();

  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly IconName = IconName;
  protected readonly copiada = signal(false);
  protected readonly aviso = signal<string | null>(null);

  constructor() {
    effect(() => {
      this.credencial();
      untracked(() => {
        this.copiada.set(false);
        this.aviso.set(null);
      });
    });
  }

  protected alCambiar(abierto: boolean): void {
    if (!abierto) this.cerrado.emit();
  }

  protected async copiar(clave: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(clave);
      this.copiada.set(true);
      this.aviso.set(MENSAJE_USUARIOS.COPIADA);
    } catch {
      this.copiada.set(false);
      this.aviso.set(MENSAJE_USUARIOS.NO_SE_PUDO_COPIAR);
    }
  }
}
