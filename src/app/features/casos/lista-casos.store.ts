import { computed, effect, inject, Injectable, signal, untracked } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, filter, map, Subject } from "rxjs";
import { CasosStore } from "@/features/casos/casos.store";
import { BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { CATEGORIA_POR_TAB, FILTRO_TODOS, TAMANO_PAGINA } from "@/features/casos/constants/casos-constants";
import { MENSAJE_CARGA } from "@/features/casos/constants/casos-messages";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { DireccionOrden, OrdenCaso } from "@/features/casos/enums/orden-caso.enum";
import { mensajeDeError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import type { Caso } from "@/features/casos/types/caso.types";
import type { ConsultaCasos } from "@/features/casos/types/incidencias-api.types";

/**
 * Lista paginada de casos de una pantalla: página, orden, filtros y búsqueda viven aquí y se piden al servidor.
 * Se provee en la página (no en la raíz), así cada pantalla tiene su propia lista.
 */
@Injectable()
export class ListaCasosStore {
  private readonly api = inject(IncidenciasApi);
  private readonly espera = inject(BUSQUEDA_DEBOUNCE_MS);
  private readonly textoAplicado = signal("");
  private readonly textoEscrito = signal("");
  private readonly entrada = new Subject<string>();
  private peticion = 0;

  readonly tamano = TAMANO_PAGINA;
  readonly casos = signal<readonly Caso[]>([]);
  readonly total = signal(0);
  readonly pagina = signal(1);
  readonly orden = signal<OrdenCaso>(OrdenCaso.FECHA);
  readonly direccion = signal<DireccionOrden>(DireccionOrden.ASCENDENTE);
  readonly tab = signal<FiltroTab>(FiltroTab.TODOS);
  readonly estado = signal<string>(FILTRO_TODOS);
  readonly texto = this.textoEscrito.asReadonly();
  readonly estadoCarga = signal<CargaEstado>(CargaEstado.INICIAL);
  readonly error = signal<string | null>(null);

  readonly totalPaginas = computed(() => Math.ceil(this.total() / this.tamano));
  readonly vacio = computed(() => this.estadoCarga() === CargaEstado.LISTO && this.casos().length === 0);
  readonly hayFiltros = computed(
    () =>
      this.tab() !== FiltroTab.TODOS ||
      this.estado() !== FILTRO_TODOS ||
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
        this.pagina.set(1);
        void this.cargar();
      });
    effect(() => {
      if (casos.cambios() === cambiosIniciales) return;
      untracked(() => void this.cargar());
    });
    void this.cargar();
  }

  async cargar(): Promise<void> {
    const token = ++this.peticion;
    this.estadoCarga.set(CargaEstado.CARGANDO);
    this.error.set(null);
    try {
      const lista = await this.api.listar(this.consulta());
      if (token !== this.peticion) return;
      const ultima = Math.max(Math.ceil(lista.total / this.tamano), 1);
      if (lista.casos.length === 0 && lista.total > 0 && this.pagina() > ultima) {
        this.pagina.set(ultima);
        return this.cargar();
      }
      this.casos.set(lista.casos);
      this.total.set(lista.total);
      this.estadoCarga.set(CargaEstado.LISTO);
    } catch (error) {
      if (token !== this.peticion) return;
      this.error.set(`${MENSAJE_CARGA.LISTA} ${mensajeDeError(error)}`);
      this.estadoCarga.set(CargaEstado.ERROR);
    }
  }

  reintentar(): Promise<void> {
    return this.cargar();
  }

  irAPagina(pagina: number): Promise<void> {
    const ultima = Math.max(this.totalPaginas(), 1);
    this.pagina.set(Math.min(Math.max(pagina, 1), ultima));
    return this.cargar();
  }

  ordenarPor(columna: OrdenCaso): Promise<void> {
    if (this.orden() === columna) {
      this.direccion.update((actual) =>
        actual === DireccionOrden.ASCENDENTE ? DireccionOrden.DESCENDENTE : DireccionOrden.ASCENDENTE,
      );
    } else {
      this.orden.set(columna);
      this.direccion.set(DireccionOrden.ASCENDENTE);
    }
    this.pagina.set(1);
    return this.cargar();
  }

  cambiarTab(tab: FiltroTab): Promise<void> {
    this.tab.set(tab);
    this.pagina.set(1);
    return this.cargar();
  }

  cambiarEstado(estado: string): Promise<void> {
    this.estado.set(estado);
    this.pagina.set(1);
    return this.cargar();
  }

  escribirTexto(texto: string): void {
    this.textoEscrito.set(texto);
    this.entrada.next(texto);
  }

  limpiar(): Promise<void> {
    this.tab.set(FiltroTab.TODOS);
    this.estado.set(FILTRO_TODOS);
    this.textoEscrito.set("");
    this.textoAplicado.set("");
    this.pagina.set(1);
    return this.cargar();
  }

  private consulta(): ConsultaCasos {
    const estado = this.estado();
    const categoria = CATEGORIA_POR_TAB[this.tab()];
    const texto = this.textoAplicado();
    return {
      pagina: this.pagina(),
      tamano: this.tamano,
      ...(estado !== FILTRO_TODOS && { estado }),
      ...(categoria && { categoria }),
      ...(texto !== "" && { texto }),
      orden: this.orden(),
      direccion: this.direccion(),
    };
  }
}
