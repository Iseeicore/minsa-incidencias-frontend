import { ChangeDetectionStrategy, Component, computed, inject } from "@angular/core";
import { SessionStore } from "@/core/auth/session.store";
import { BandejaStore } from "@/features/casos/bandeja.store";
import { AreaSelector } from "@/features/casos/components/area-selector";
import { FiltrosActivos } from "@/features/casos/components/filtros-activos";
import {
  ATAJOS_FECHA,
  OPCIONES_FILTRO_MOTIVO,
  PLACEHOLDER_BUSQUEDA,
  TABS_POR_TIPO_AREA,
  TABS_SIN_AREA,
} from "@/features/casos/constants/casos-constants";
import type { FiltroActivoId } from "@/features/casos/enums/filtro-activo.enum";
import type { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { sufijoMostrando } from "@/features/casos/utils/conteos-bandeja";
import { filtrosActivos } from "@/features/casos/utils/filtros-activos";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { TabsVariante } from "@/shared/enums/tabs.enum";
import { Button } from "@/shared/ui/button/button";
import { DateField } from "@/shared/ui/date-field/date-field";
import { SearchInput } from "@/shared/ui/search-input/search-input";
import { SelectField } from "@/shared/ui/select-field/select-field";
import { Tabs } from "@/shared/ui/tabs/tabs";

/** Panel de filtros de la Bandeja: búsqueda, fechas, establecimiento, categoría y los filtros ya aplicados. */
@Component({
  selector: "app-bandeja-filtros",
  imports: [AreaSelector, Button, DateField, FiltrosActivos, SearchInput, SelectField, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block min-w-0" },
  template: `
    <section aria-label="Filtros" class="min-w-0 space-y-4 rounded-2xl bg-gray-50 p-4">
      <div class="grid grid-cols-1 items-end gap-3 md:grid-cols-2 xl:grid-cols-4">
        <app-search-input
          class="md:col-span-2 xl:col-span-1"
          label="Buscar caso"
          [placeholder]="placeholderBusqueda"
          [value]="store.texto()"
          (valueChange)="store.escribirTexto($event)"
        />
        <app-date-field
          label="Desde"
          [invalid]="store.errorFechas() !== null"
          [value]="store.desde()"
          (valueChange)="alCambiarDesde($event)"
        />
        <app-date-field
          label="Hasta"
          [invalid]="store.errorFechas() !== null"
          [value]="store.hasta()"
          (valueChange)="alCambiarHasta($event)"
        />
        @if (veTodasLasAreas()) {
          <app-area-selector
            class="block md:col-span-2 xl:col-span-1"
            label="Filtrar por establecimiento"
            placeholder="Busca un establecimiento..."
            [seleccionada]="store.establecimiento()"
            (seleccionadaChange)="store.cambiarEstablecimiento($event)"
          />
        }
      </div>

      <div class="flex flex-wrap gap-2" role="group" aria-label="Atajos de fecha">
        @for (atajo of atajos; track atajo.value) {
          <app-button
            [variant]="ButtonVariant.OUTLINE"
            [tone]="ButtonTone.NEUTRAL"
            [size]="ButtonSize.SM"
            (click)="store.aplicarAtajo(atajo.value)"
          >
            {{ atajo.label }}
          </app-button>
        }
        @if (store.hayFechas()) {
          <app-button
            [variant]="ButtonVariant.OUTLINE"
            [tone]="ButtonTone.NEUTRAL"
            [size]="ButtonSize.SM"
            (click)="store.limpiarFechas()"
          >
            Limpiar<span class="sr-only"> fechas</span>
          </app-button>
        }
      </div>
      @if (store.errorFechas(); as mensaje) {
        <p class="text-sm font-medium text-danger-600" role="alert">{{ mensaje }}</p>
      }

      @if (store.verArchivados()) {
        <app-select-field
          class="md:max-w-xs"
          label="Filtrar por motivo del archivo"
          [options]="motivoOpciones"
          [value]="store.motivoArchivo()"
          (valueChange)="store.cambiarMotivoArchivo($event)"
        />
      }

      <div class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
        <span class="text-sm font-medium text-gray-600">Categoría</span>
        <app-tabs
          label="Categoría"
          [variante]="variante"
          [options]="categoriasOpciones()"
          [value]="store.categoria()"
          (valueChange)="cambiarCategoria($event)"
        />
      </div>

      <div class="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-2 border-t border-gray-200 pt-3">
        <p class="text-sm font-medium text-gray-700" aria-live="polite">
          Mostrando <span class="font-bold text-gray-900">{{ store.casos().length }}</span>{{ sufijo() }}
        </p>
        <app-filtros-activos
          class="flex-1"
          [filtros]="filtrosAplicados()"
          (quitar)="quitarFiltro($event)"
          (limpiar)="store.limpiar()"
        />
      </div>
    </section>
  `,
})
export class BandejaFiltros {
  private readonly sesion = inject(SessionStore);

  protected readonly store = inject(BandejaStore);
  protected readonly veTodasLasAreas = this.sesion.veTodasLasAreas;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly variante = TabsVariante.CHIPS;
  protected readonly atajos = ATAJOS_FECHA;
  protected readonly motivoOpciones = OPCIONES_FILTRO_MOTIVO;
  protected readonly placeholderBusqueda = PLACEHOLDER_BUSQUEDA;
  protected readonly categoriasOpciones = computed(() => {
    const area = this.sesion.area();
    return area ? TABS_POR_TIPO_AREA[area.tipo] : TABS_SIN_AREA;
  });
  protected readonly sufijo = computed(() => sufijoMostrando(this.store.casos().length, this.store.total()));
  protected readonly filtrosAplicados = computed(() => {
    const { desde, hasta } = this.store.rangoAplicado();
    return filtrosActivos({
      bandeja: this.store.bandeja(),
      categoria: this.store.categoria(),
      motivoArchivo: this.store.motivoArchivo(),
      establecimiento: this.store.establecimiento(),
      desde,
      hasta,
      texto: this.store.textoActivo(),
    });
  });

  protected cambiarCategoria(valor: string): void {
    void this.store.cambiarCategoria(valor as FiltroTab);
  }

  protected alCambiarDesde(valor: string): void {
    void this.store.cambiarFechas(valor, this.store.hasta());
  }

  protected alCambiarHasta(valor: string): void {
    void this.store.cambiarFechas(this.store.desde(), valor);
  }

  protected quitarFiltro(filtro: FiltroActivoId): void {
    void this.store.quitarFiltro(filtro);
  }
}
