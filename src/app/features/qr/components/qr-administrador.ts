import { ChangeDetectionStrategy, Component, inject, signal } from "@angular/core";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { ListaEstablecimientosStore } from "@/features/qr/lista-establecimientos.store";
import type { EstablecimientoQr } from "@/features/qr/types/establecimiento-qr.types";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { PaginadorCursor } from "@/shared/ui/paginador-cursor/paginador-cursor";
import { SearchInput } from "@/shared/ui/search-input/search-input";
import { EstablecimientosTabla } from "./establecimientos-tabla";
import { QrModal } from "./qr-modal";

/** Vista del administrador: busca un establecimiento y genera su QR en un diálogo. */
@Component({
  selector: "app-qr-administrador",
  imports: [Alert, Button, Card, EstablecimientosTabla, PaginadorCursor, QrModal, SearchInput],
  providers: [ListaEstablecimientosStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block space-y-6" },
  template: `
    <section aria-label="Filtros" class="md:max-w-sm">
      <app-search-input
        label="Buscar establecimiento"
        placeholder="Buscar por nombre o código RENIPRESS..."
        [value]="lista.texto()"
        (valueChange)="lista.escribirTexto($event)"
      />
    </section>

    <app-card>
      <div class="mb-4 flex items-center justify-between gap-3">
        <h2 class="text-base font-bold text-gray-900">Establecimientos</h2>
        <p class="text-sm font-medium text-gray-600" aria-live="polite">
          {{ lista.establecimientos().length }}
          {{ lista.establecimientos().length === 1 ? "establecimiento" : "establecimientos" }} en esta página
        </p>
      </div>

      @if (lista.error(); as mensaje) {
        <div class="mb-4 space-y-3">
          <app-alert [tone]="BadgeTone.DANGER">{{ mensaje }}</app-alert>
          <app-button [variant]="ButtonVariant.OUTLINE" [tone]="ButtonTone.NEUTRAL" [size]="ButtonSize.SM" (click)="lista.cargar()">
            Reintentar
          </app-button>
        </div>
      }

      @if (lista.establecimientos().length > 0) {
        <div [attr.aria-busy]="lista.estadoCarga() === CargaEstado.CARGANDO">
          <app-establecimientos-tabla [establecimientos]="lista.establecimientos()" (generar)="elegido.set($event)" />
        </div>
        <app-paginador-cursor
          class="mt-4"
          label="Paginación de establecimientos"
          singular="establecimiento"
          plural="establecimientos"
          [pagina]="lista.pagina()"
          [cantidad]="lista.establecimientos().length"
          [hayAnterior]="lista.hayAnterior()"
          [hayMas]="lista.hayMas()"
          [cargando]="lista.estadoCarga() === CargaEstado.CARGANDO"
          (anterior)="lista.irAAnterior()"
          (siguiente)="lista.irASiguiente()"
        />
      } @else if (lista.estadoCarga() === CargaEstado.INICIAL || lista.estadoCarga() === CargaEstado.CARGANDO) {
        <p class="py-10 text-center text-sm font-medium text-gray-700" aria-live="polite">Cargando establecimientos…</p>
      } @else if (lista.vacio()) {
        <div class="flex flex-col items-center gap-3 py-10 text-center">
          <p class="text-sm font-medium text-gray-700">
            {{ lista.hayFiltros() ? "No hay establecimientos que coincidan con la búsqueda." : "No hay establecimientos." }}
          </p>
          @if (lista.hayFiltros()) {
            <app-button [variant]="ButtonVariant.OUTLINE" [tone]="ButtonTone.NEUTRAL" [size]="ButtonSize.SM" (click)="lista.limpiar()">
              Limpiar búsqueda
            </app-button>
          }
        </div>
      }
    </app-card>

    <app-qr-modal [establecimiento]="elegido()" (cerrado)="elegido.set(null)" />
  `,
})
export class QrAdministrador {
  protected readonly lista = inject(ListaEstablecimientosStore);
  protected readonly elegido = signal<EstablecimientoQr | null>(null);
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly CargaEstado = CargaEstado;
}
