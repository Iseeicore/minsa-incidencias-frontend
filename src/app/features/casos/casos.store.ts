import { inject, Injectable, signal } from "@angular/core";
import {
  MAX_ARCHIVO_DETALLE,
  MAX_REAPERTURA_MOTIVO,
  MAX_RESOLUCION,
  MIN_TEXTO_REVISION,
} from "@/features/casos/constants/casos-constants";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import type { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import type { MotivoArchivo } from "@/features/casos/enums/motivo-archivo.enum";
import { IncidenciaError, mensajeDeError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import type { CasoDetalle, DatosResolucion, RespuestaAccion, ResultadoAccion } from "@/features/casos/types/caso.types";
import { HttpStatus } from "@/shared/enums/http-status.enum";

const ESTADOS_QUE_PIDEN_RECARGAR: readonly number[] = [HttpStatus.NOT_FOUND, HttpStatus.CONFLICT];

function fallo(error: string): ResultadoAccion {
  return { ok: false, error };
}

/** Texto de revisión dentro del rango que acepta el servidor (sin contar los espacios de los bordes); `null` si es válido. */
function errorDeTexto(nombre: string, texto: string, maximo: number): string | null {
  if (texto.length < MIN_TEXTO_REVISION) return `${nombre} necesita al menos ${MIN_TEXTO_REVISION} caracteres.`;
  if (texto.length > maximo) return `${nombre} no puede pasar de ${maximo} caracteres.`;
  return null;
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
  /** Aviso de que un caso se envió a OTRANS; sobrevive al cierre del panel hasta que la persona lo descarte. */
  readonly avisoEnvio = signal<string | null>(null);

  descartarAvisoEnvio(): void {
    this.avisoEnvio.set(null);
  }

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

  derivar(codigo: string, areaDestino?: string): Promise<ResultadoAccion> {
    return this.ejecutar(AccionCaso.DERIVAR, () => this.api.derivar(codigo, areaDestino));
  }

  tomar(codigo: string): Promise<ResultadoAccion> {
    return this.ejecutar(AccionCaso.TOMAR, () => this.api.tomar(codigo));
  }

  async resolver(codigo: string, datos: DatosResolucion): Promise<ResultadoAccion> {
    const medidasTomadas = datos.medidasTomadas.trim();
    const fundamento = datos.fundamento.trim();
    const error =
      errorDeTexto("Las medidas tomadas", medidasTomadas, MAX_RESOLUCION) ?? errorDeTexto("El fundamento", fundamento, MAX_RESOLUCION);
    if (error) return fallo(error);
    return this.ejecutar(AccionCaso.RESOLVER, () =>
      this.api.resolver(codigo, { medidasTomadas, fundamento, resultado: datos.resultado }),
    );
  }

  async archivar(codigo: string, motivo: MotivoArchivo, detalle: string): Promise<ResultadoAccion> {
    const texto = detalle.trim();
    const error = errorDeTexto("La justificación", texto, MAX_ARCHIVO_DETALLE);
    if (error) return fallo(error);
    return this.ejecutar(AccionCaso.ARCHIVAR, () => this.api.archivar(codigo, motivo, texto));
  }

  async reabrir(codigo: string, motivo: string): Promise<ResultadoAccion> {
    const texto = motivo.trim();
    const error = errorDeTexto("El motivo", texto, MAX_REAPERTURA_MOTIVO);
    if (error) return fallo(error);
    return this.ejecutar(AccionCaso.REABRIR, () => this.api.reabrir(codigo, texto));
  }

  private async ejecutar(accion: AccionCaso, llamada: () => Promise<RespuestaAccion>): Promise<ResultadoAccion> {
    try {
      const respuesta = await llamada();
      this.cambios.update((cantidad) => cantidad + 1);
      if (respuesta.enviadoAOtrans) {
        this.peticion++;
        this.codigoActual = null;
        this.detalle.set(null);
        this.estadoDetalle.set(CargaEstado.INICIAL);
        this.avisoEnvio.set(respuesta.mensaje);
        return { ok: true, mensaje: respuesta.mensaje, enviadoAOtrans: true };
      }
      this.detalle.set(respuesta.caso);
      this.estadoDetalle.set(CargaEstado.LISTO);
      return { ok: true, mensaje: respuesta.mensaje };
    } catch (error) {
      if (error instanceof IncidenciaError && ESTADOS_QUE_PIDEN_RECARGAR.includes(error.estado)) {
        this.cambios.update((cantidad) => cantidad + 1);
      }
      return fallo(mensajeDeError(error, accion));
    }
  }
}
