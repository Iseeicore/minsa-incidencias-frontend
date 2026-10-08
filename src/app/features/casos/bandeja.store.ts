import { computed, effect, inject, Injectable, signal, untracked } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, filter, map, Subject } from "rxjs";
import { CasosStore } from "@/features/casos/casos.store";
import { AHORA, BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { CATEGORIA_POR_TAB, ESTADO_DE_BANDEJA, FILTRO_TODOS, TAMANO_PAGINA } from "@/features/casos/constants/casos-constants";
import { MENSAJE_CARGA } from "@/features/casos/constants/casos-messages";
import type { AtajoFecha } from "@/features/casos/enums/atajo-fecha.enum";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { FiltroActivoId } from "@/features/casos/enums/filtro-activo.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { mensajeDeError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import type { Caso } from "@/features/casos/types/caso.types";
import type { ConsultaCasos } from "@/features/casos/types/incidencias-api.types";
import { errorDeRango, rangoDeAtajo } from "@/features/casos/utils/fechas-lima";
import { normalizarBusqueda } from "@/features/casos/utils/normalizar-busqueda";

/**
 * Bandeja de casos con paginación por cursor: el servidor entrega `siguiente` y `hayMas`, y el cursor de cada página
 * ya visitada se guarda en una pila local para poder volver. Pestaña de estado, categoría, fechas, búsqueda y
 * establecimiento se piden al servidor; cambiar cualquiera vuelve a la primera página. Se provee en la página.
 */
@Injectable()
export class BandejaStore {
  private readonly api = inject(IncidenciasApi);
  private readonly espera = inject(BUSQUEDA_DEBOUNCE_MS);
  private readonly ahora = inject(AHORA);
  private readonly textoAplicado = signal("");
  private readonly textoEscrito = signal("");
  private readonly entrada = new Subject<string>();
  private readonly cursorActual = signal<string | null>(null);
  private readonly pila = signal<readonly (string | null)[]>([]);
  private readonly desdeAplicada = signal("");
  private readonly hastaAplicada = signal("");
  private peticion = 0;

  readonly tamano = TAMANO_PAGINA;
  readonly casos = signal<readonly Caso[]>([]);
  readonly siguiente = signal<string | null>(null);
  readonly hayMas = signal(false);
  readonly bandeja = signal<BandejaTab>(BandejaTab.TODOS);
  readonly categoria = signal<FiltroTab>(FiltroTab.TODOS);
  /** Solo cuenta en Archivados: por qué se archivaron los casos que se listan. */
  readonly motivoArchivo = signal<string>(FILTRO_TODOS);
  readonly verArchivados = computed(() => this.bandeja() === BandejaTab.ARCHIVADOS);
  readonly establecimiento = signal<AreaOpcion | null>(null);
  readonly texto = this.textoEscrito.asReadonly();
  /** Lo que muestran los campos de fecha, válido o no; al servidor solo llegan las fechas válidas. */
  readonly desde = signal("");
  readonly hasta = signal("");
  readonly errorFechas = computed(() => errorDeRango(this.desde(), this.hasta()));
  /** Lo que ya se pidió al servidor: el texto tras la espera y el último rango válido. */
  readonly textoActivo = this.textoAplicado.asReadonly();
  readonly rangoAplicado = computed(() => ({ desde: this.desdeAplicada(), hasta: this.hastaAplicada() }));
  readonly estadoCarga = signal<CargaEstado>(CargaEstado.INICIAL);
  readonly error = signal<string | null>(null);

  /** Número de página que se está viendo (sin total, solo cuántas se recorrieron). */
  readonly pagina = computed(() => this.pila().length + 1);
  readonly hayAnterior = computed(() => this.pila().length > 0);
  readonly vacio = computed(() => this.estadoCarga() === CargaEstado.LISTO && this.casos().length === 0);
  readonly hayFechas = computed(() => this.desde() !== "" || this.hasta() !== "");
  readonly hayFiltros = computed(
    () =>
      this.bandeja() !== BandejaTab.TODOS ||
      this.categoria() !== FiltroTab.TODOS ||
      this.motivoArchivo() !== FILTRO_TODOS ||
      this.establecimiento() !== null ||
      this.hayFechas() ||
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

  cambiarBandeja(bandeja: BandejaTab): Promise<void> {
    this.bandeja.set(bandeja);
    if (bandeja !== BandejaTab.ARCHIVADOS) this.motivoArchivo.set(FILTRO_TODOS);
    return this.desdeElPrincipio();
  }

  cambiarCategoria(categoria: FiltroTab): Promise<void> {
    this.categoria.set(categoria);
    return this.desdeElPrincipio();
  }

  cambiarMotivoArchivo(motivo: string): Promise<void> {
    this.motivoArchivo.set(motivo);
    return this.desdeElPrincipio();
  }

  cambiarEstablecimiento(area: AreaOpcion | null): Promise<void> {
    this.establecimiento.set(area);
    return this.desdeElPrincipio();
  }

  /** Un rango inválido se muestra con su mensaje pero no se pide: la lista sigue con el último rango válido. */
  cambiarFechas(desde: string, hasta: string): Promise<void> {
    this.desde.set(desde);
    this.hasta.set(hasta);
    if (this.errorFechas() !== null) return Promise.resolve();
    if (desde === this.desdeAplicada() && hasta === this.hastaAplicada()) return Promise.resolve();
    this.desdeAplicada.set(desde);
    this.hastaAplicada.set(hasta);
    return this.desdeElPrincipio();
  }

  aplicarAtajo(atajo: AtajoFecha): Promise<void> {
    const rango = rangoDeAtajo(atajo, this.ahora());
    return this.cambiarFechas(rango.desde, rango.hasta);
  }

  limpiarFechas(): Promise<void> {
    return this.cambiarFechas("", "");
  }

  escribirTexto(texto: string): void {
    this.textoEscrito.set(texto);
    this.entrada.next(texto);
  }

  limpiarTexto(): void {
    this.escribirTexto("");
  }

  /** Quita un solo filtro y vuelve a la primera página. */
  quitarFiltro(filtro: FiltroActivoId): Promise<void> {
    switch (filtro) {
      case FiltroActivoId.ESTADO:
        return this.cambiarBandeja(BandejaTab.TODOS);
      case FiltroActivoId.CATEGORIA:
        return this.cambiarCategoria(FiltroTab.TODOS);
      case FiltroActivoId.MOTIVO:
        return this.cambiarMotivoArchivo(FILTRO_TODOS);
      case FiltroActivoId.ESTABLECIMIENTO:
        return this.cambiarEstablecimiento(null);
      case FiltroActivoId.FECHAS:
        return this.limpiarFechas();
      case FiltroActivoId.TEXTO:
        this.borrarTexto();
        return this.desdeElPrincipio();
    }
  }

  limpiar(): Promise<void> {
    this.bandeja.set(BandejaTab.TODOS);
    this.categoria.set(FiltroTab.TODOS);
    this.motivoArchivo.set(FILTRO_TODOS);
    this.establecimiento.set(null);
    this.borrarTexto();
    this.desde.set("");
    this.hasta.set("");
    this.desdeAplicada.set("");
    this.hastaAplicada.set("");
    return this.desdeElPrincipio();
  }

  /** Vacía el buscador al instante; el valor vacío reinicia la espera y descarta lo que estuviera pendiente. */
  private borrarTexto(): void {
    this.textoEscrito.set("");
    this.textoAplicado.set("");
    this.entrada.next("");
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
    const estado = ESTADO_DE_BANDEJA[this.bandeja()];
    const motivoArchivo = this.motivoArchivo();
    const categoria = CATEGORIA_POR_TAB[this.categoria()];
    const texto = normalizarBusqueda(this.textoAplicado());
    const establecimiento = this.establecimiento()?.establecimiento;
    const desde = this.desdeAplicada();
    const hasta = this.hastaAplicada();
    return {
      limite: this.tamano,
      ...(cursor !== null && { cursor }),
      ...(estado && { estado }),
      ...(this.verArchivados() && motivoArchivo !== FILTRO_TODOS && { motivoArchivo }),
      ...(categoria && { categoria }),
      ...(texto !== "" && { texto }),
      ...(establecimiento && { establecimiento: establecimiento.codigoRenipress }),
      ...(desde !== "" && { desde }),
      ...(hasta !== "" && { hasta }),
    };
  }
}
