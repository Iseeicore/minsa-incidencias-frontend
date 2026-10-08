import { computed, effect, inject, Injectable, signal, untracked } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, filter, map, Subject } from "rxjs";
import { CasosStore } from "@/features/casos/casos.store";
import { BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { CATEGORIA_POR_TAB, FILTRO_TODOS, TAMANO_PAGINA } from "@/features/casos/constants/casos-constants";
import { MENSAJE_CARGA } from "@/features/casos/constants/casos-messages";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { mensajeDeError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import type { Caso } from "@/features/casos/types/caso.types";
import type { ConsultaCasos } from "@/features/casos/types/incidencias-api.types";

/**
 * Lista de casos de una pantalla con paginación por cursor: el servidor entrega `siguiente` y `hayMas`, y el cursor
 * de cada página ya visitada se guarda en una pila local para poder volver. Filtros y búsqueda viven aquí y se piden
 * al servidor; cambiar cualquiera vuelve a la primera página. Se provee en la página (no en la raíz).
 */
@Injectable()
export class ListaCasosStore {
  private readonly api = inject(IncidenciasApi);
  private readonly espera = inject(BUSQUEDA_DEBOUNCE_MS);
  private readonly textoAplicado = signal("");
  private readonly textoEscrito = signal("");
  private readonly entrada = new Subject<string>();
  private readonly cursorActual = signal<string | null>(null);
  private readonly pila = signal<readonly (string | null)[]>([]);
  private peticion = 0;

  readonly tamano = TAMANO_PAGINA;
  readonly casos = signal<readonly Caso[]>([]);
  readonly siguiente = signal<string | null>(null);
  readonly hayMas = signal(false);
  readonly tab = signal<FiltroTab>(FiltroTab.TODOS);
  readonly estado = signal<string>(FILTRO_TODOS);
  readonly establecimiento = signal<AreaOpcion | null>(null);
  readonly texto = this.textoEscrito.asReadonly();
  readonly estadoCarga = signal<CargaEstado>(CargaEstado.INICIAL);
  readonly error = signal<string | null>(null);

  /** Número de página que se está viendo (sin total, solo cuántas se recorrieron). */
  readonly pagina = computed(() => this.pila().length + 1);
  readonly hayAnterior = computed(() => this.pila().length > 0);
  readonly vacio = computed(() => this.estadoCarga() === CargaEstado.LISTO && this.casos().length === 0);
  readonly hayFiltros = computed(
    () =>
      this.tab() !== FiltroTab.TODOS ||
      this.estado() !== FILTRO_TODOS ||
      this.establecimiento() !== null ||
      this.textoAplicado() !== "" ||
      this.textoEscrito().trim() !== "",
  );

  constructor() {
    const casos = inject(CasosStore);
    const cambiosIniciales = casos.cambios();
    this.entrada
      .pipe(
        debounceTime(this.espera),
        map((texto) => texto.trim()),
        filter((texto) => texto !== this.textoAplicado()),
        takeUntilDestroyed(),
      )
      .subscribe((texto) => {
        this.textoAplicado.set(texto);
        void this.desdeElPrincipio();
      });
    effect(() => {
      if (casos.cambios() === cambiosIniciales) return;
      untracked(() => void this.cargar());
    });
    void this.cargar();
  }

  /** Vuelve a pedir la página actual. */
  cargar(): Promise<void> {
    return this.cargarPagina(this.cursorActual(), this.pila());
  }

  reintentar(): Promise<void> {
    return this.cargar();
  }

  irASiguiente(): Promise<void> {
    const cursor = this.siguiente();
    if (cursor === null) return Promise.resolve();
    return this.cargarPagina(cursor, [...this.pila(), this.cursorActual()]);
  }

  irAAnterior(): Promise<void> {
    const pila = this.pila();
    if (pila.length === 0) return Promise.resolve();
    return this.cargarPagina(pila[pila.length - 1], pila.slice(0, -1));
  }

  cambiarTab(tab: FiltroTab): Promise<void> {
    this.tab.set(tab);
    return this.desdeElPrincipio();
  }

  cambiarEstado(estado: string): Promise<void> {
    this.estado.set(estado);
    return this.desdeElPrincipio();
  }

  cambiarEstablecimiento(area: AreaOpcion | null): Promise<void> {
    this.establecimiento.set(area);
    return this.desdeElPrincipio();
  }

  escribirTexto(texto: string): void {
    this.textoEscrito.set(texto);
    this.entrada.next(texto);
  }

  limpiar(): Promise<void> {
    this.tab.set(FiltroTab.TODOS);
    this.estado.set(FILTRO_TODOS);
    this.establecimiento.set(null);
    this.textoEscrito.set("");
    this.textoAplicado.set("");
    return this.desdeElPrincipio();
  }

  private desdeElPrincipio(): Promise<void> {
    return this.cargarPagina(null, []);
  }

  /** El cursor y la pila solo cambian cuando la página llegó: si falla, se sigue en la página anterior. */
  private async cargarPagina(cursor: string | null, pila: readonly (string | null)[]): Promise<void> {
    const token = ++this.peticion;
    this.estadoCarga.set(CargaEstado.CARGANDO);
    this.error.set(null);
    try {
      const lista = await this.api.listar(this.consulta(cursor));
      if (token !== this.peticion) return;
      if (lista.casos.length === 0 && pila.length > 0) {
        return this.cargarPagina(pila[pila.length - 1], pila.slice(0, -1));
      }
      this.cursorActual.set(cursor);
      this.pila.set(pila);
      this.casos.set(lista.casos);
      this.siguiente.set(lista.siguiente);
      this.hayMas.set(lista.hayMas);
      this.estadoCarga.set(CargaEstado.LISTO);
    } catch (error) {
      if (token !== this.peticion) return;
      this.error.set(`${MENSAJE_CARGA.LISTA} ${mensajeDeError(error)}`);
      this.estadoCarga.set(CargaEstado.ERROR);
    }
  }

  private consulta(cursor: string | null): ConsultaCasos {
    const estado = this.estado();
    const categoria = CATEGORIA_POR_TAB[this.tab()];
    const texto = this.textoAplicado();
    const establecimiento = this.establecimiento()?.establecimiento;
    return {
      limite: this.tamano,
      ...(cursor !== null && { cursor }),
      ...(estado !== FILTRO_TODOS && { estado }),
      ...(categoria && { categoria }),
      ...(texto !== "" && { texto }),
      ...(establecimiento && { establecimiento: establecimiento.codigoRenipress }),
    };
  }
}
