import { computed, inject, Injectable, signal } from "@angular/core";
import { takeUntilDestroyed } from "@angular/core/rxjs-interop";
import { debounceTime, filter, map, Subject } from "rxjs";
import { BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import { MENSAJE_USUARIOS, TAMANO_PAGINA_USUARIOS } from "@/features/usuarios/constants/usuarios-constants";
import { mensajeDeErrorUsuario } from "@/features/usuarios/services/usuario-error";
import { UsuariosApi } from "@/features/usuarios/services/usuarios.api";
import type {
  CambiosUsuario,
  ConsultaUsuarios,
  NuevoUsuario,
  ResultadoConClave,
  ResultadoUsuario,
  Usuario,
} from "@/features/usuarios/types/usuario.types";

/**
 * Lista de usuarios con paginación por cursor (la pila de cursores ya visitados permite volver) y búsqueda con
 * espera. Cambiar la búsqueda o el área vuelve a la primera página. Las acciones devuelven el resultado y, si salen
 * bien, vuelven a pedir la página; la clave inicial que devuelven crear y restablecer pasa a quien llamó y aquí no
 * se guarda. Se provee en la página (no en la raíz).
 */
@Injectable()
export class ListaUsuariosStore {
  private readonly api = inject(UsuariosApi);
  private readonly espera = inject(BUSQUEDA_DEBOUNCE_MS);
  private readonly textoAplicado = signal("");
  private readonly textoEscrito = signal("");
  private readonly entrada = new Subject<string>();
  private readonly cursorActual = signal<string | null>(null);
  private readonly pila = signal<readonly (string | null)[]>([]);
  private peticion = 0;

  readonly usuarios = signal<readonly Usuario[]>([]);
  readonly siguiente = signal<string | null>(null);
  readonly hayMas = signal(false);
  readonly texto = this.textoEscrito.asReadonly();
  readonly area = signal<AreaOpcion | null>(null);
  readonly estadoCarga = signal<CargaEstado>(CargaEstado.INICIAL);
  readonly error = signal<string | null>(null);

  readonly pagina = computed(() => this.pila().length + 1);
  readonly hayAnterior = computed(() => this.pila().length > 0);
  readonly vacio = computed(() => this.estadoCarga() === CargaEstado.LISTO && this.usuarios().length === 0);
  readonly hayFiltros = computed(
    () => this.area() !== null || this.textoAplicado() !== "" || this.textoEscrito().trim() !== "",
  );
  readonly activos = computed(() => this.usuarios().filter((usuario) => usuario.activo).length);

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

  cambiarArea(area: AreaOpcion | null): Promise<void> {
    this.area.set(area);
    return this.cargarPagina(null, []);
  }

  limpiar(): Promise<void> {
    this.textoEscrito.set("");
    this.textoAplicado.set("");
    this.area.set(null);
    return this.cargarPagina(null, []);
  }

  async crear(datos: NuevoUsuario): Promise<ResultadoConClave> {
    try {
      const creado = await this.api.crear(datos);
      void this.cargar();
      return { ok: true, ...creado };
    } catch (error) {
      return { ok: false, error: mensajeDeErrorUsuario(error) };
    }
  }

  async cambiar(id: string, cambios: CambiosUsuario): Promise<ResultadoUsuario> {
    try {
      const usuario = await this.api.actualizar(id, cambios);
      void this.cargar();
      return { ok: true, usuario };
    } catch (error) {
      return { ok: false, error: mensajeDeErrorUsuario(error) };
    }
  }

  async restablecerClave(id: string): Promise<ResultadoConClave> {
    try {
      const restablecido = await this.api.restablecerClave(id);
      return { ok: true, ...restablecido };
    } catch (error) {
      return { ok: false, error: mensajeDeErrorUsuario(error) };
    }
  }

  /** El cursor y la pila solo cambian cuando la página llegó: si falla, se sigue en la página anterior. */
  private async cargarPagina(cursor: string | null, pila: readonly (string | null)[]): Promise<void> {
    const token = ++this.peticion;
    this.estadoCarga.set(CargaEstado.CARGANDO);
    this.error.set(null);
    try {
      const lista = await this.api.listar(this.consulta(cursor));
      if (token !== this.peticion) return;
      if (lista.usuarios.length === 0 && pila.length > 0) {
        return this.cargarPagina(pila[pila.length - 1], pila.slice(0, -1));
      }
      this.cursorActual.set(cursor);
      this.pila.set(pila);
      this.usuarios.set(lista.usuarios);
      this.siguiente.set(lista.siguiente);
      this.hayMas.set(lista.hayMas);
      this.estadoCarga.set(CargaEstado.LISTO);
    } catch (error) {
      if (token !== this.peticion) return;
      this.error.set(`${MENSAJE_USUARIOS.CARGA_LISTA} ${mensajeDeErrorUsuario(error)}`);
      this.estadoCarga.set(CargaEstado.ERROR);
    }
  }

  private consulta(cursor: string | null): ConsultaUsuarios {
    const texto = this.textoAplicado();
    const area = this.area();
    return {
      limite: TAMANO_PAGINA_USUARIOS,
      ...(cursor !== null && { cursor }),
      ...(texto !== "" && { q: texto }),
      ...(area && { area: area.codigo }),
    };
  }
}
