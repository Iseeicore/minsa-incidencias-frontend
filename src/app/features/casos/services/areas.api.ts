import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom } from "rxjs";
import { API_BASE_URL } from "@/core/config/api.config";
import { NivelAtencion } from "@/features/casos/enums/nivel-atencion.enum";
import { RespuestaInvalidaError, toIncidenciaError } from "@/features/casos/services/incidencia-error";
import type { AreaDtoLista, AreaOpcion, ConsultaAreas, ListaAreas, ListaAreasDto } from "@/features/casos/types/area.types";
import { TipoArea } from "@/shared/enums/tipo-area.enum";
import { buildQueryParams } from "@/shared/utils/build-query-params";

const RUTA = `${API_BASE_URL}/areas`;

function tipoDe(valor: string): TipoArea {
  const tipo = Object.values(TipoArea).find((candidato) => candidato === valor);
  if (tipo === undefined) throw new RespuestaInvalidaError("tipoArea");
  return tipo;
}

function nivelDe(valor: string | null): NivelAtencion | null {
  if (valor === null) return null;
  const nivel = Object.values(NivelAtencion).find((candidato) => candidato === valor);
  if (nivel === undefined) throw new RespuestaInvalidaError("nivelAtencion");
  return nivel;
}

function mapearArea(dto: AreaDtoLista): AreaOpcion {
  return {
    id: String(dto.id),
    codigo: dto.codigo,
    nombre: dto.nombre,
    tipoArea: tipoDe(dto.tipoArea),
    establecimiento:
      dto.establecimiento === null
        ? null
        : {
            codigoRenipress: dto.establecimiento.codigoRenipress,
            nivelAtencion: nivelDe(dto.establecimiento.nivelAtencion),
            categoria: dto.establecimiento.categoria,
          },
  };
}

@Injectable({ providedIn: "root" })
export class AreasApi {
  private readonly http = inject(HttpClient);

  async listar(consulta: ConsultaAreas = {}): Promise<ListaAreas> {
    try {
      const dto = await firstValueFrom(
        this.http.get<ListaAreasDto>(RUTA, { withCredentials: true, params: buildQueryParams({ ...consulta }) }),
      );
      return { areas: dto.items.map(mapearArea), siguiente: dto.siguiente, hayMas: dto.hayMas };
    } catch (error) {
      throw toIncidenciaError(error);
    }
  }
}
