import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom, type Observable } from "rxjs";
import { API_BASE_URL } from "@/core/config/api.config";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import type { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import type { CasoDetalle, CasosPorVencer, ListaCasos, RespuestaAccion } from "@/features/casos/types/caso.types";
import type {
  CasoDetalleDto,
  ConsultaCasos,
  ListaCasosDto,
  PorVencerDto,
  ResultadoAccionDto,
} from "@/features/casos/types/incidencias-api.types";
import { mapearDetalle, mapearResumen } from "@/features/casos/utils/mapear-caso";
import { buildQueryParams } from "@/shared/utils/build-query-params";
import { toIncidenciaError } from "./incidencia-error";

const RUTA = `${API_BASE_URL}/incidencias`;
const OPCIONES = { withCredentials: true } as const;

@Injectable({ providedIn: "root" })
export class IncidenciasApi {
  private readonly http = inject(HttpClient);

  async listar(consulta: ConsultaCasos): Promise<ListaCasos> {
    const dto = await this.pedir(
      this.http.get<ListaCasosDto>(RUTA, { ...OPCIONES, params: buildQueryParams({ ...consulta }) }),
    );
    return { casos: dto.casos.map(mapearResumen), pagina: dto.pagina, tamano: dto.tamano, total: dto.total };
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

  derivar(codigo: string): Promise<RespuestaAccion> {
    return this.ejecutar(codigo, AccionCaso.DERIVAR, {});
  }

  tomar(codigo: string): Promise<RespuestaAccion> {
    return this.ejecutar(codigo, AccionCaso.TOMAR, {});
  }

  resolver(codigo: string, resolucion: string): Promise<RespuestaAccion> {
    return this.ejecutar(codigo, AccionCaso.RESOLVER, { resolucion });
  }

  private async ejecutar(codigo: string, accion: AccionCaso, cuerpo: object): Promise<RespuestaAccion> {
    const dto = await this.pedir(
      this.http.post<ResultadoAccionDto>(`${this.ruta(codigo)}/${accion}`, cuerpo, OPCIONES),
    );
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
