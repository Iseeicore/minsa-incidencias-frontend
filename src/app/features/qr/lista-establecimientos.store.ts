import { computed, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, filter, map, Subject } from "rxjs";
import { BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { AreasApi } from "@/features/casos/services/areas.api";
import { mensajeDeError } from "@/features/casos/services/incidencia-error";
import type { ConsultaAreas } from "@/features/casos/types/area.types";
import { MENSAJE_QR, TAMANO_PAGINA_QR } from "@/features/qr/constants/qr-constants";
import type { EstablecimientoQr } from "@/features/qr/types/establecimiento-qr.types";
import { aEstablecimientosQr } from "@/features/qr/utils/mapear-establecimiento";
import { TipoArea } from "@/shared/enums/tipo-area.enum";

/**
 * Lista de establecimientos para el administrador, con paginación por cursor (la pila de cursores ya visitados
 * permite volver) y búsqueda con espera: el servidor busca por nombre sin tildes o por código RENIPRESS.
 * Cambiar la búsqueda vuelve a la primera página. Se provee en el componente (no en la raíz).
 */
@Injectable()
export class ListaEstablecimientosStore {
  private readonly api = inject(AreasApi);
  private readonly espera = inject(BUSQUEDA_DEBOUNCE_MS);
  private readonly textoAplicado = signal("");
  private readonly textoEscrito = signal("");
  private readonly entrada = new Subject<string>();
  private readonly cursorActual = signal<string | null>(null);
  private readonly pila = signal<readonly (string | null)[]>([]);
  private peticion = 0;

  readonly establecimientos = signal<readonly EstablecimientoQr[]>([]);
  readonly siguiente = signal<string | null>(null);
  readonly hayMas = signal(false);
  readonly texto = this.textoEscrito.asReadonly();
  readonly estadoCarga = signal<CargaEstado>(CargaEstado.INICIAL);
  readonly error = signal<string | null>(null);

  readonly pagina = computed(() => this.pila().length + 1);
  readonly hayAnterior = computed(() => this.pila().length > 0);
  readonly vacio = computed(() => this.estadoCarga() === CargaEstado.LISTO && this.establecimientos().length === 0);
  readonly hayFiltros = computed(() => this.textoAplicado() !== "" || this.textoEscrito().trim() !== "");

  constructor() {
    this.entrada
      .pipe(
        debounceTime(this.espera),
        map((texto) => texto.trim()),
        filter((texto) => texto !== this.textoAplicado()),
        takeUntilDestroyed(),
      )
      .subscribe((texto) => {
        this.textoAplicado.set(texto);
        void this.cargarPagina(null, []);
      });
    void this.cargar();
  }

  cargar(): Promise<void> {
    return this.cargarPagina(this.cursorActual(), this.pila());
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

  escribirTexto(texto: string): void {
    this.textoEscrito.set(texto);
    this.entrada.next(texto);
  }

  limpiar(): Promise<void> {
    this.textoEscrito.set("");
    this.textoAplicado.set("");
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
      const establecimientos = aEstablecimientosQr(lista.areas);
      if (establecimientos.length === 0 && pila.length > 0) {
        return this.cargarPagina(pila[pila.length - 1], pila.slice(0, -1));
      }
      this.cursorActual.set(cursor);
      this.pila.set(pila);
      this.establecimientos.set(establecimientos);
      this.siguiente.set(lista.siguiente);
      this.hayMas.set(lista.hayMas);
      this.estadoCarga.set(CargaEstado.LISTO);
    } catch (error) {
      if (token !== this.peticion) return;
      this.error.set(`${MENSAJE_QR.CARGA_LISTA} ${mensajeDeError(error)}`);
      this.estadoCarga.set(CargaEstado.ERROR);
    }
  }

  private consulta(cursor: string | null): ConsultaAreas {
    const texto = this.textoAplicado();
    return {
      tipo: TipoArea.ESTABLECIMIENTO,
      limite: TAMANO_PAGINA_QR,
      ...(cursor !== null && { cursor }),
      ...(texto !== "" && { q: texto }),
    };
  }
}
