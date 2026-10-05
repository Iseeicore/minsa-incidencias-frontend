import {
  afterNextRender,
  ChangeDetectionStrategy,
  Component,
  computed,
  ElementRef,
  inject,
  Injector,
  signal,
  viewChild,
} from "@angular/core";
import { RouterLink } from "@angular/router";
import { AvisosStore } from "@/features/casos/avisos.store";
import { CATEGORIA_LABEL, SIN_DATO } from "@/features/casos/constants/casos-constants";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { textoPlazo } from "@/features/casos/utils/texto-plazo";
import { ROUTE } from "@/shared/constants/routes";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";
import { IconButton } from "@/shared/ui/icon-button/icon-button";
import { ScrollArea } from "@/shared/ui/scroll-area/scroll-area";

const PANEL_ID = "panel-avisos";
const ENCABEZADO = "sticky top-0 z-10 bg-white pb-2 pr-4 text-xs font-medium text-gray-500";
const COLUMNAS = ["Código", "Categoría", "Vence en"] as const;

function plural(cantidad: number, singular: string, plural: string): string {
  return `${cantidad} ${cantidad === 1 ? singular : plural}`;
}

@Component({
  selector: "app-avisos-campana",
  imports: [Alert, Button, IconButton, RouterLink, ScrollArea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "relative block",
    "(document:keydown.escape)": "cerrarConFoco()",
    "(document:click)": "alHacerClicFuera($event)",
  },
  template: `
    <app-icon-button [icon]="IconName.BELL" [label]="etiqueta()" [expanded]="abierto()" [controls]="panelId" (click)="alternar()" />
    @if (store.contador() > 0) {
      <span
        data-contador
        aria-hidden="true"
        class="pointer-events-none absolute -top-1 -right-1 inline-flex min-w-5 items-center justify-center rounded-full bg-danger-500 px-1.5 text-xs font-bold text-white"
      >
        {{ store.contador() }}
      </span>
    }
    <span class="sr-only" aria-live="polite">{{ anuncio() }}</span>

    @if (abierto()) {
      <section
        #panel
        [id]="panelId"
        role="region"
        aria-label="Casos por vencer"
        tabindex="-1"
        class="fixed inset-x-4 top-20 z-40 rounded-2xl bg-white p-4 shadow-lg focus-visible:outline-2 focus-visible:outline-primary-500 sm:absolute sm:inset-x-auto sm:top-12 sm:right-0 sm:w-96"
      >
        <h2 class="text-base font-bold text-gray-900">Casos por vencer</h2>
        <p class="mb-3 text-sm text-gray-600">{{ resumen() }}</p>

        @if (store.error(); as mensaje) {
          <div class="space-y-3">
            <app-alert [tone]="BadgeTone.DANGER">{{ mensaje }}</app-alert>
            <app-button [variant]="ButtonVariant.OUTLINE" [tone]="ButtonTone.NEUTRAL" [size]="ButtonSize.SM" (click)="reintentar()">
              Reintentar
            </app-button>
          </div>
        } @else if (cargandoSinDatos()) {
          <p class="py-4 text-center text-sm text-gray-600" aria-live="polite">Cargando avisos…</p>
        } @else if (store.casos().length === 0) {
          <p class="py-4 text-center text-sm font-medium text-gray-700">No tienes casos por vencer.</p>
        } @else {
          <app-scroll-area label="Lista de casos por vencer">
            <table class="w-full whitespace-nowrap text-left text-sm">
              <thead>
                <tr>
                  @for (columna of columnas; track columna) {
                    <th scope="col" [class]="encabezado">{{ columna }}</th>
                  }
                </tr>
              </thead>
              <tbody class="divide-y divide-gray-100">
                @for (caso of store.casos(); track caso.codigo) {
                  <tr>
                    <td class="py-2 pr-4 font-medium">
                      <a
                        class="rounded text-primary-700 underline focus-visible:outline-2 focus-visible:outline-primary-500"
                        [routerLink]="rutaCasos"
                        [queryParams]="{ caso: caso.codigo }"
                        (click)="cerrar()"
                      >
                        {{ caso.codigo }}<span class="sr-only">: abrir el caso</span>
                      </a>
                    </td>
                    <td class="py-2 pr-4 text-gray-700">{{ caso.categoria ? categoria[caso.categoria] : sinDato }}</td>
                    <td class="py-2 text-gray-700">{{ textoPlazo(caso) }}</td>
                  </tr>
                }
              </tbody>
            </table>
          </app-scroll-area>
        }
      </section>
    }
  `,
})
export class AvisosCampana {
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);
  private readonly injector = inject(Injector);
  private readonly panel = viewChild<ElementRef<HTMLElement>>("panel");

  protected readonly store = inject(AvisosStore);
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly IconName = IconName;
  protected readonly panelId = PANEL_ID;
  protected readonly rutaCasos = ROUTE.CASOS;
  protected readonly columnas = COLUMNAS;
  protected readonly encabezado = ENCABEZADO;
  protected readonly categoria = CATEGORIA_LABEL;
  protected readonly sinDato = SIN_DATO;
  protected readonly textoPlazo = textoPlazo;

  protected readonly abierto = signal(false);

  protected readonly etiqueta = computed(() => {
    const cantidad = this.store.contador();
    return cantidad === 0 ? "Avisos: sin casos por vencer" : `Avisos: ${plural(cantidad, "caso", "casos")} por vencer`;
  });

  protected readonly anuncio = computed(() => {
    const cantidad = this.store.contador();
    return cantidad === 0 ? "" : `${plural(cantidad, "caso", "casos")} por vencer o vencidos`;
  });

  protected readonly resumen = computed(
    () => `${this.store.porVencer()} por vencer · ${plural(this.store.vencidos(), "vencido", "vencidos")}`,
  );

  protected readonly cargandoSinDatos = computed(
    () => this.store.estadoCarga() === CargaEstado.CARGANDO && this.store.casos().length === 0,
  );

  constructor() {
    void this.store.refrescar();
  }

  protected alternar(): void {
    if (this.abierto()) {
      this.cerrar();
      return;
    }
    this.abierto.set(true);
    void this.store.refrescar();
    afterNextRender(() => this.panel()?.nativeElement.focus(), { injector: this.injector });
  }

  protected cerrar(): void {
    this.abierto.set(false);
  }

  protected cerrarConFoco(): void {
    if (!this.abierto()) return;
    this.cerrar();
    this.host.nativeElement.querySelector<HTMLButtonElement>("button[aria-controls]")?.focus();
  }

  protected alHacerClicFuera(evento: Event): void {
    if (this.abierto() && !this.host.nativeElement.contains(evento.target as Node)) this.cerrar();
  }

  protected reintentar(): void {
    void this.store.refrescar();
  }
}
