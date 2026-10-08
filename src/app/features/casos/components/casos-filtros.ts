import { ChangeDetectionStrategy, Component, computed, input, model } from "@angular/core";
import {
  ESTADO_OPCIONES,
  FILTRO_TODOS,
  PRIORIDAD_OPCIONES,
  TABS_OPCIONES,
} from "@/features/casos/constants/casos-constants";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";
import { SearchInput } from "@/shared/ui/search-input/search-input";
import { SelectField } from "@/shared/ui/select-field/select-field";

const CATEGORIAS = TABS_OPCIONES.filter((opcion) => opcion.value !== FiltroTab.CRITICOS);

const CHIP_BASE =
  "rounded-full px-3.5 py-1.5 text-sm font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500";
const CHIP_ACTIVO = `${CHIP_BASE} bg-gray-900 text-white`;
const CHIP_INACTIVO = `${CHIP_BASE} bg-gray-100 text-gray-700 hover:bg-gray-200`;

interface FiltroActivo {
  readonly id: string;
  readonly texto: string;
  readonly quitar: () => void;
}

/** Barra de filtros de una bandeja: búsqueda, categoría, prioridad y estado, con los filtros activos a la vista. */
@Component({
  selector: "app-casos-filtros",
  imports: [Icon, SearchInput, SelectField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <section aria-label="Filtros" class="space-y-4 rounded-2xl bg-gray-50 p-4">
      <div class="grid grid-cols-1 gap-3 md:grid-cols-[minmax(0,1fr)_12rem_12rem]">
        <app-search-input
          class="[&_input]:border [&_input]:border-gray-200"
          label="Buscar caso"
          placeholder="Buscar por código, área o responsable"
          [(value)]="texto"
        />
        <app-select-field
          class="[&_select]:border [&_select]:border-gray-200"
          label="Filtrar por prioridad"
          [options]="prioridadOpciones"
          [(value)]="prioridad"
        />
        <app-select-field
          class="[&_select]:border [&_select]:border-gray-200"
          label="Filtrar por estado"
          [options]="estadoOpciones"
          [(value)]="estado"
        />
      </div>

      <div class="flex flex-wrap items-center gap-2">
        <span id="filtro-categoria" class="mr-1 text-xs font-medium text-gray-600">Categoría</span>
        <div role="group" aria-labelledby="filtro-categoria" class="flex flex-wrap gap-2">
          @for (opcion of categorias; track opcion.value) {
            <button
              type="button"
              [class]="categoria() === opcion.value ? chipActivo : chipInactivo"
              [attr.aria-pressed]="categoria() === opcion.value"
              (click)="categoria.set(opcion.value)"
            >
              {{ opcion.label }}
            </button>
          }
        </div>
      </div>

      <div class="flex min-h-7 flex-wrap items-center gap-2 border-t border-gray-200 pt-3" aria-live="polite">
        <p class="text-sm font-medium text-gray-700">
          Mostrando <span class="font-bold text-gray-900">{{ mostrados() }}</span> de {{ total() }}
          {{ total() === 1 ? "caso" : "casos" }}
        </p>
        @for (filtro of activos(); track filtro.id) {
          <button
            type="button"
            class="inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-2.5 py-1 text-xs font-medium text-primary-700 hover:bg-primary-100 focus-visible:outline-2 focus-visible:outline-primary-500"
            (click)="filtro.quitar()"
          >
            {{ filtro.texto }}
            <app-icon [name]="IconName.CLOSE" [size]="12" />
            <span class="sr-only">Quitar filtro</span>
          </button>
        }
        @if (activos().length > 0) {
          <button
            type="button"
            class="ml-auto rounded-full px-2.5 py-1 text-xs font-bold text-gray-700 underline underline-offset-2 hover:text-gray-900 focus-visible:outline-2 focus-visible:outline-primary-500"
            (click)="limpiar()"
          >
            Limpiar filtros
          </button>
        }
      </div>
    </section>
  `,
})
export class CasosFiltros {
  readonly texto = model("");
  readonly categoria = model<string>(FiltroTab.TODOS);
  readonly prioridad = model<string>(FILTRO_TODOS);
  readonly estado = model<string>(FILTRO_TODOS);
  /** Casos de la bandeja antes de filtrar. */
  readonly total = input.required<number>();
  readonly mostrados = input.required<number>();

  protected readonly IconName = IconName;
  protected readonly categorias = CATEGORIAS;
  protected readonly prioridadOpciones = PRIORIDAD_OPCIONES;
  protected readonly estadoOpciones = ESTADO_OPCIONES;
  protected readonly chipActivo = CHIP_ACTIVO;
  protected readonly chipInactivo = CHIP_INACTIVO;

  protected readonly activos = computed<readonly FiltroActivo[]>(() => {
    const lista: FiltroActivo[] = [];
    const texto = this.texto().trim();
    if (texto !== "") lista.push({ id: "texto", texto: `Texto: ${texto}`, quitar: () => this.texto.set("") });
    if (this.categoria() !== FiltroTab.TODOS) {
      lista.push({
        id: "categoria",
        texto: `Categoría: ${etiqueta(CATEGORIAS, this.categoria())}`,
        quitar: () => this.categoria.set(FiltroTab.TODOS),
      });
    }
    if (this.prioridad() !== FILTRO_TODOS) {
      lista.push({
        id: "prioridad",
        texto: `Prioridad: ${etiqueta(PRIORIDAD_OPCIONES, this.prioridad())}`,
        quitar: () => this.prioridad.set(FILTRO_TODOS),
      });
    }
    if (this.estado() !== FILTRO_TODOS) {
      lista.push({
        id: "estado",
        texto: `Estado: ${etiqueta(ESTADO_OPCIONES, this.estado())}`,
        quitar: () => this.estado.set(FILTRO_TODOS),
      });
    }
    return lista;
  });

  protected limpiar(): void {
    this.texto.set("");
    this.categoria.set(FiltroTab.TODOS);
    this.prioridad.set(FILTRO_TODOS);
    this.estado.set(FILTRO_TODOS);
  }
}

function etiqueta(opciones: readonly { readonly value: string; readonly label: string }[], valor: string): string {
  return opciones.find((opcion) => opcion.value === valor)?.label ?? valor;
}
