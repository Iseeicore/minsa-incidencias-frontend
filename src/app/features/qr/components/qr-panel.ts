import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from "@angular/core";
import { WHATSAPP_NUMERO } from "@/core/config/whatsapp.config";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { LADO_QR_PX, MENSAJE_QR, PREFIJO_ARCHIVO_QR } from "@/features/qr/constants/qr-constants";
import { DescargaArchivo } from "@/features/qr/services/descarga-archivo";
import { QrImagen } from "@/features/qr/services/qr-imagen";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { IconName } from "@/shared/enums/icon-name.enum";
import { construirEnlaceWhatsapp, formatearNumeroWhatsapp } from "@/shared/utils/enlace-whatsapp";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";
import { Icon } from "@/shared/ui/icon/icon";

const FUERA_DE_NOMBRE_DE_ARCHIVO = /[^0-9A-Za-z-]/g;

/** El QR de WhatsApp de un establecimiento, con el mensaje que precarga, el número y la descarga del PNG. */
@Component({
  selector: "app-qr-panel",
  imports: [Alert, Button, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <div class="space-y-5">
      <dl class="space-y-1 text-sm">
        <div>
          <dt class="sr-only">Establecimiento</dt>
          <dd class="text-base font-bold text-gray-900">{{ nombre() }}</dd>
        </div>
        <div>
          <dt class="sr-only">Código RENIPRESS</dt>
          <dd class="font-medium text-gray-600">RENIPRESS {{ codigoRenipress() }}</dd>
        </div>
      </dl>

      <div class="flex min-h-64 items-center justify-center" [attr.aria-busy]="estado() === CargaEstado.CARGANDO">
        @if (imagen(); as origen) {
          <img
            [src]="origen"
            [alt]="'Código QR de WhatsApp de ' + nombre()"
            [attr.width]="lado"
            [attr.height]="lado"
            class="h-64 w-64 max-w-full rounded-md border border-gray-200 bg-white"
          />
        } @else if (estado() === CargaEstado.ERROR) {
          <div class="space-y-3 text-center">
            <app-alert [tone]="BadgeTone.DANGER">{{ mensajeError }}</app-alert>
            <app-button [variant]="ButtonVariant.OUTLINE" [tone]="ButtonTone.NEUTRAL" [size]="ButtonSize.SM" (click)="generar()">
              Reintentar
            </app-button>
          </div>
        } @else {
          <p class="text-sm font-medium text-gray-700" aria-live="polite">Generando el código QR…</p>
        }
      </div>

      <dl class="space-y-3 rounded-md bg-gray-50 p-4 text-sm">
        <div>
          <dt class="font-medium text-gray-600">Mensaje que se precarga en WhatsApp</dt>
          <dd class="mt-1 break-words font-medium text-gray-900">{{ datos().mensaje }}</dd>
        </div>
        <div>
          <dt class="font-medium text-gray-600">Número de WhatsApp</dt>
          <dd class="mt-1 font-medium text-gray-900">{{ numeroVisible }}</dd>
        </div>
      </dl>

      <app-button [block]="true" [disabled]="imagen() === null" (click)="descargar()">
        <app-icon [name]="IconName.DOWNLOAD" />
        Descargar<span class="sr-only"> el PNG del código QR de {{ nombre() }}</span>
      </app-button>
    </div>
  `,
})
export class QrPanel {
  private readonly numero = inject(WHATSAPP_NUMERO);
  private readonly generador = inject(QrImagen);
  private readonly descarga = inject(DescargaArchivo);
  private peticion = 0;

  readonly nombre = input.required<string>();
  readonly codigoRenipress = input.required<string>();

  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly CargaEstado = CargaEstado;
  protected readonly IconName = IconName;
  protected readonly lado = LADO_QR_PX;
  protected readonly mensajeError = MENSAJE_QR.GENERAR;
  protected readonly numeroVisible = formatearNumeroWhatsapp(this.numero);
  protected readonly datos = computed(() => construirEnlaceWhatsapp(this.numero, this.nombre(), this.codigoRenipress()));
  protected readonly imagen = signal<string | null>(null);
  protected readonly estado = signal<CargaEstado>(CargaEstado.INICIAL);

  constructor() {
    effect(() => {
      this.datos();
      untracked(() => void this.generar());
    });
  }

  protected async generar(): Promise<void> {
    const token = ++this.peticion;
    this.imagen.set(null);
    this.estado.set(CargaEstado.CARGANDO);
    try {
      const png = await this.generador.generarPng(this.datos().enlace);
      if (token !== this.peticion) return;
      this.imagen.set(png);
      this.estado.set(CargaEstado.LISTO);
    } catch {
      if (token !== this.peticion) return;
      this.estado.set(CargaEstado.ERROR);
    }
  }

  protected descargar(): void {
    const png = this.imagen();
    if (png === null) return;
    const codigo = this.codigoRenipress().trim().replace(FUERA_DE_NOMBRE_DE_ARCHIVO, "");
    this.descarga.descargar(png, `${PREFIJO_ARCHIVO_QR}${codigo}.png`);
  }
}
