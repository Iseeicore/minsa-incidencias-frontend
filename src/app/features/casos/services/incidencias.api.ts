import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom, type Observable } from "rxjs";
import { API_BASE_URL } from "@/core/config/api.config";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import type { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import type { MotivoArchivo } from "@/features/casos/enums/motivo-archivo.enum";
import type {
  CasoDetalle,
  CasosPorVencer,
  DatosResolucion,
  ListaCasos,
  RespuestaAccion,
} from "@/features/casos/types/caso.types";
import type {
  CasoDetalleDto,
  ConsultaCasos,
  EnviadoAOtransDto,
  ListaCasosDto,
  PorVencerDto,
  ResultadoAccionDto,
} from "@/features/casos/types/incidencias-api.types";
import { mapearDetalle, mapearResumen } from "@/features/casos/utils/mapear-caso";
import { buildQueryParams } from "@/shared/utils/build-query-params";
import { toIncidenciaError } from "./incidencia-error";

const RUTA = `${API_BASE_URL}/incidencias`;
const OPCIONES = { withCredentials: true } as const;

function esEnvioAOtrans(dto: ResultadoAccionDto | EnviadoAOtransDto): dto is EnviadoAOtransDto {
  return "enviadoAOtrans" in dto && dto.enviadoAOtrans === true;
}

@Injectable({ providedIn: "root" })
export class IncidenciasApi {
  private readonly http = inject(HttpClient);

  async listar(consulta: ConsultaCasos): Promise<ListaCasos> {
    const dto = await this.pedir(
      this.http.get<ListaCasosDto>(RUTA, { ...OPCIONES, params: buildQueryParams({ ...consulta }) }),
    );
    return { casos: dto.items.map(mapearResumen), siguiente: dto.siguiente, hayMas: dto.hayMas };
  }

  async detalle(codigo: string): Promise<CasoDetalle> {
    return mapearDetalle(await this.pedir(this.http.get<CasoDetalleDto>(this.ruta(codigo), OPCIONES)));
  }

  async porVencer(): Promise<CasosPorVencer> {
    const dto = await this.pedir(this.http.get<PorVencerDto>(`${RUTA}/por-vencer`, OPCIONES));
    return { total: dto.total, porVencer: dto.porVencer, vencidos: dto.vencidos, casos: dto.casos.map(mapearResumen) };
  }

  confirmar(codigo: string): Promise<RespuestaAccion> {
    return this.ejecutar(codigo, AccionCaso.CONFIRMAR, {});
  }

  corregir(codigo: string, categoria: CategoriaCaso): Promise<RespuestaAccion> {
    return this.ejecutar(codigo, AccionCaso.CORREGIR, { categoria });
  }

  /** Sin área de destino, una denuncia de corrupción se queda en OTRANS. */
  derivar(codigo: string, areaDestino?: string): Promise<RespuestaAccion> {
    return this.ejecutar(codigo, AccionCaso.DERIVAR, areaDestino === undefined ? {} : { areaDestino });
  }

  tomar(codigo: string): Promise<RespuestaAccion> {
    return this.ejecutar(codigo, AccionCaso.TOMAR, {});
  }

  resolver(codigo: string, resolucion: DatosResolucion): Promise<RespuestaAccion> {
    return this.ejecutar(codigo, AccionCaso.RESOLVER, resolucion);
  }

  archivar(codigo: string, motivo: MotivoArchivo, detalle: string): Promise<RespuestaAccion> {
    return this.ejecutar(codigo, AccionCaso.ARCHIVAR, { motivo, detalle });
  }

  reabrir(codigo: string, motivo: string): Promise<RespuestaAccion> {
    return this.ejecutar(codigo, AccionCaso.REABRIR, { motivo });
  }

  private async ejecutar(codigo: string, accion: AccionCaso, cuerpo: object): Promise<RespuestaAccion> {
    const dto = await this.pedir(
      this.http.post<ResultadoAccionDto | EnviadoAOtransDto>(`${this.ruta(codigo)}/${accion}`, cuerpo, OPCIONES),
    );
    if (esEnvioAOtrans(dto)) {
      return { mensaje: `El caso ${dto.codigo} se envió a OTRANS.`, caso: null, enviadoAOtrans: true };
    }
    return { mensaje: dto.mensaje, caso: dto.caso === null ? null : mapearDetalle(dto.caso) };
  }

  private ruta(codigo: string): string {
    return `${RUTA}/${encodeURIComponent(codigo)}`;
  }

  private async pedir<T>(llamada: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(llamada);
    } catch (error) {
      throw toIncidenciaError(error);
    }
  }
}
