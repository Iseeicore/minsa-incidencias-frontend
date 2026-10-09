import { ChangeDetectionStrategy, Component, computed, DestroyRef, effect, inject, input, model, signal, untracked } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, Subject } from "rxjs";
import { BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { LIMITE_AREAS, MINIMO_BUSQUEDA_AREA } from "@/features/casos/constants/casos-constants";
import { MENSAJE_CARGA } from "@/features/casos/constants/casos-messages";
import { mensajeDeError } from "@/features/casos/services/incidencia-error";
import { AreasApi } from "@/features/casos/services/areas.api";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import { textoRenipress } from "@/features/casos/utils/texto-establecimiento";
import { CAMPO_BASE, CAMPO_VALIDO } from "@/shared/constants/campo-clases";
import { TipoArea } from "@/shared/enums/tipo-area.enum";

const CAMPO_CLASES = `${CAMPO_BASE} ${CAMPO_VALIDO} rounded-md px-3 py-2.5 text-sm font-medium`;

let siguienteId = 0;

/**
 * Selector de área con búsqueda: escribe, espera a que termine de teclear y pregunta a `GET /areas`. Es un combobox
 * (el foco se queda en el campo; las flechas mueven la opción activa y Enter la elige).
 */
@Component({
  selector: "app-area-selector",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "block" },
  template: `
    <label class="block">
      <span class="mb-1 block text-sm font-medium text-gray-700">{{ label() }}</span>
      <input
        type="text"
        role="combobox"
        autocomplete="off"
        [class]="campoClases"
        [placeholder]="placeholder()"
        [value]="texto()"
        [attr.aria-expanded]="abierta()"
        [attr.aria-controls]="idLista"
        [attr.aria-activedescendant]="opcionActiva() >= 0 ? idOpcion(opcionActiva()) : null"
        aria-autocomplete="list"
        (input)="alEscribir($event)"
        (keydown)="alTeclear($event)"
        (blur)="cerrar()"
      />
    </label>
    <div [id]="idLista" role="listbox" [attr.aria-label]="label()" [hidden]="!abierta()" class="mt-1 rounded-xl bg-white shadow-sm">
      @for (area of resultados(); track area.codigo; let indice = $index) {
        <div
          role="option"
          [id]="idOpcion(indice)"
          [attr.aria-selected]="indice === opcionActiva()"
          class="cursor-pointer px-4 py-2 text-sm hover:bg-gray-100"
          [class.bg-gray-100]="indice === opcionActiva()"
          (mousedown)="elegir(area, $event)"
        >
          <p class="font-medium text-gray-900">{{ area.nombre }}</p>
          @if (area.establecimiento; as establecimiento) {
            <p class="text-xs text-gray-600">{{ renipress(establecimiento) }}</p>
          }
        </div>
      }
    </div>
    <p class="mt-1 text-xs text-gray-600" aria-live="polite">
      @if (error(); as mensaje) {
        {{ mensaje }}
      } @else if (cargando()) {
        Buscando…
      } @else if (sinResultados()) {
        No hay áreas que coincidan.
      } @else if (hayMas()) {
        Hay más resultados: escribe más para afinar.
      } @else if (!seleccionada() && texto().trim().length < minimo) {
        Escribe al menos {{ minimo }} letras para buscar.
      }
    </p>
  `,
})
export class AreaSelector {
  private readonly api = inject(AreasApi);
  private readonly espera = inject(BUSQUEDA_DEBOUNCE_MS);
  private readonly entrada = new Subject<string>();
  private peticion = 0;
  private nombreElegido: string | null = null;
  private readonly id = ++siguienteId;

  readonly label = input.required<string>();
  readonly placeholder = input("Busca por nombre o código...");
  /** Solo áreas que son un establecimiento (con código RENIPRESS): lo que puede recibir una derivación. */
  readonly soloEstablecimientos = input(true);
  /** Si se indica, pide solo áreas de ese tipo y decide por sí mismo si hacen falta los datos de establecimiento. */
  readonly tipo = input<TipoArea>();
  readonly seleccionada = model<AreaOpcion | null>(null);

  protected readonly campoClases = CAMPO_CLASES;
  protected readonly idLista = `area-selector-${this.id}`;
  protected readonly minimo = MINIMO_BUSQUEDA_AREA;
  protected readonly renipress = textoRenipress;
  protected readonly texto = signal("");
  protected readonly resultados = signal<readonly AreaOpcion[]>([]);
  protected readonly hayMas = signal(false);
  protected readonly cargando = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly buscado = signal(false);
  protected readonly opcionActiva = signal(-1);
  protected readonly abierta = signal(false);
  protected readonly sinResultados = computed(
    () => this.buscado() && !this.cargando() && this.error() === null && this.resultados().length === 0,
  );

  constructor() {
    effect(() => {
      const elegida = this.seleccionada();
      untracked(() => {
        if (elegida) this.texto.set(elegida.nombre);
        else if (this.nombreElegido !== null && this.texto() === this.nombreElegido) this.texto.set("");
        this.nombreElegido = elegida?.nombre ?? null;
      });
    });
    this.entrada
      .pipe(debounceTime(this.espera), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe((texto) => void this.buscar(texto));
  }

  protected idOpcion(indice: number): string {
    return `${this.idLista}-${indice}`;
  }

  protected alEscribir(evento: Event): void {
    const texto = (evento.target as HTMLInputElement).value;
    this.texto.set(texto);
    if (this.seleccionada() !== null) this.seleccionada.set(null);
    this.peticion++;
    this.resultados.set([]);
    this.opcionActiva.set(-1);
    this.error.set(null);
    this.hayMas.set(false);
    this.buscado.set(false);
    const termino = texto.trim();
    if (termino.length < this.minimo) {
      this.cargando.set(false);
      this.abierta.set(false);
      return;
    }
    this.cargando.set(true);
    this.entrada.next(termino);
  }

  protected alTeclear(evento: KeyboardEvent): void {
    const cantidad = this.resultados().length;
    switch (evento.key) {
      case "ArrowDown":
        evento.preventDefault();
        if (cantidad > 0) {
          this.abierta.set(true);
          this.opcionActiva.update((actual) => (actual + 1) % cantidad);
        }
        break;
      case "ArrowUp":
        evento.preventDefault();
        if (cantidad > 0) this.opcionActiva.update((actual) => (actual <= 0 ? cantidad - 1 : actual - 1));
        break;
      case "Enter": {
        const area = this.resultados()[this.opcionActiva()];
        if (this.abierta() && area) {
          evento.preventDefault();
          this.elegir(area);
        }
        break;
      }
      case "Escape":
        this.cerrar();
        break;
    }
  }

  protected elegir(area: AreaOpcion, evento?: Event): void {
    evento?.preventDefault();
    this.seleccionada.set(area);
    this.cerrar();
  }

  protected cerrar(): void {
    this.abierta.set(false);
    this.opcionActiva.set(-1);
  }

  private async buscar(texto: string): Promise<void> {
    const token = ++this.peticion;
    this.cargando.set(true);
    try {
      const tipo = this.tipo();
      const lista = await this.api.listar({ q: texto, limite: LIMITE_AREAS, ...(tipo && { tipo }) });
      if (token !== this.peticion) return;
      const soloEstablecimientos = tipo ? tipo === TipoArea.ESTABLECIMIENTO : this.soloEstablecimientos();
      const areas = soloEstablecimientos ? lista.areas.filter((area) => area.establecimiento !== null) : lista.areas;
      this.resultados.set(areas);
      this.hayMas.set(lista.hayMas);
      this.error.set(null);
      this.abierta.set(areas.length > 0);
    } catch (error) {
      if (token !== this.peticion) return;
      this.resultados.set([]);
      this.error.set(`${MENSAJE_CARGA.AREAS} ${mensajeDeError(error)}`);
    } finally {
      if (token === this.peticion) {
        this.buscado.set(true);
        this.cargando.set(false);
      }
    }
  }
}
