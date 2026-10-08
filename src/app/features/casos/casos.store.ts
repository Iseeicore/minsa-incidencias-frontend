import { inject, Injectable, signal } from "@angular/core";
import { MAX_RESOLUCION } from "@/features/casos/constants/casos-constants";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import type { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { IncidenciaError, mensajeDeError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import type { CasoDetalle, RespuestaAccion, ResultadoAccion } from "@/features/casos/types/caso.types";
import { HttpStatus } from "@/shared/enums/http-status.enum";

const ESTADOS_QUE_PIDEN_RECARGAR: readonly number[] = [HttpStatus.NOT_FOUND, HttpStatus.CONFLICT];

function fallo(error: string): ResultadoAccion {
  return { ok: false, error };
}

/**
 * Detalle del caso abierto y acciones sobre él. Las reglas las aplica el servidor (y, detrás, la base): aquí solo
 * se llama, se muestra el resultado y se avisa con `cambios` a las listas para que se vuelvan a pedir.
 */
@Injectable({ providedIn: "root" })
export class CasosStore {
  private readonly api = inject(IncidenciasApi);
  private peticion = 0;
  private codigoActual: string | null = null;

  readonly detalle = signal<CasoDetalle | null>(null);
  readonly estadoDetalle = signal<CargaEstado>(CargaEstado.INICIAL);
  readonly errorDetalle = signal<string | null>(null);
  readonly cambios = signal(0);

  async abrir(codigo: string): Promise<void> {
    const token = ++this.peticion;
    this.codigoActual = codigo;
    this.detalle.set(null);
    this.errorDetalle.set(null);
    this.estadoDetalle.set(CargaEstado.CARGANDO);
    try {
      const detalle = await this.api.detalle(codigo);
      if (token !== this.peticion) return;
      this.detalle.set(detalle);
      this.estadoDetalle.set(CargaEstado.LISTO);
    } catch (error) {
      if (token !== this.peticion) return;
      this.errorDetalle.set(mensajeDeError(error));
      this.estadoDetalle.set(CargaEstado.ERROR);
    }
  }

  reintentar(): Promise<void> {
    return this.codigoActual === null ? Promise.resolve() : this.abrir(this.codigoActual);
  }

  cerrar(): void {
    this.peticion++;
    this.codigoActual = null;
    this.detalle.set(null);
    this.errorDetalle.set(null);
    this.estadoDetalle.set(CargaEstado.INICIAL);
  }

  confirmar(codigo: string): Promise<ResultadoAccion> {
    return this.ejecutar(AccionCaso.CONFIRMAR, () => this.api.confirmar(codigo));
  }

  corregir(codigo: string, categoria: CategoriaCaso): Promise<ResultadoAccion> {
    return this.ejecutar(AccionCaso.CORREGIR, () => this.api.corregir(codigo, categoria));
  }

  derivar(codigo: string, areaDestino: string): Promise<ResultadoAccion> {
    return this.ejecutar(AccionCaso.DERIVAR, () => this.api.derivar(codigo, areaDestino));
  }

  tomar(codigo: string): Promise<ResultadoAccion> {
    return this.ejecutar(AccionCaso.TOMAR, () => this.api.tomar(codigo));
  }

  async resolver(codigo: string, resolucion: string): Promise<ResultadoAccion> {
    const texto = resolucion.trim();
    if (texto === "") return fallo("La resolución no puede estar vacía.");
    if (texto.length > MAX_RESOLUCION) return fallo(`La resolución no puede pasar de ${MAX_RESOLUCION} caracteres.`);
    return this.ejecutar(AccionCaso.RESOLVER, () => this.api.resolver(codigo, texto));
  }

  private async ejecutar(accion: AccionCaso, llamada: () => Promise<RespuestaAccion>): Promise<ResultadoAccion> {
    try {
      const respuesta = await llamada();
      this.detalle.set(respuesta.caso);
      this.estadoDetalle.set(CargaEstado.LISTO);
      this.cambios.update((cantidad) => cantidad + 1);
      return { ok: true, mensaje: respuesta.mensaje };
    } catch (error) {
      if (error instanceof IncidenciaError && ESTADOS_QUE_PIDEN_RECARGAR.includes(error.estado)) {
        this.cambios.update((cantidad) => cantidad + 1);
      }
      return fallo(mensajeDeError(error, accion));
    }
  }
}
