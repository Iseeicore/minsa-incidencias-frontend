import { HttpClient } from "@angular/common/http";
import { inject, Injectable } from "@angular/core";
import { firstValueFrom, type Observable } from "rxjs";
import { API_BASE_URL } from "@/core/config/api.config";
import { toIncidenciaError } from "@/features/casos/services/incidencia-error";
import type {
  CambiosUsuario,
  ConsultaUsuarios,
  ListaUsuarios,
  ListaUsuariosDto,
  NuevoUsuario,
  Usuario,
  UsuarioActualizadoDto,
  UsuarioConClave,
  UsuarioConClaveDto,
} from "@/features/usuarios/types/usuario.types";
import { mapearUsuario } from "@/features/usuarios/utils/mapear-usuario";
import { buildQueryParams } from "@/shared/utils/build-query-params";

const RUTA = `${API_BASE_URL}/usuarios`;
const OPCIONES = { withCredentials: true } as const;

@Injectable({ providedIn: "root" })
export class UsuariosApi {
  private readonly http = inject(HttpClient);

  async listar(consulta: ConsultaUsuarios): Promise<ListaUsuarios> {
    const dto = await this.pedir(
      this.http.get<ListaUsuariosDto>(RUTA, { ...OPCIONES, params: buildQueryParams({ ...consulta }) }),
    );
    return { usuarios: dto.items.map(mapearUsuario), siguiente: dto.siguiente, hayMas: dto.hayMas };
  }

  async crear(datos: NuevoUsuario): Promise<UsuarioConClave> {
    return this.conClave(await this.pedir(this.http.post<UsuarioConClaveDto>(RUTA, datos, OPCIONES)));
  }

  async actualizar(id: string, cambios: CambiosUsuario): Promise<Usuario> {
    const dto = await this.pedir(this.http.patch<UsuarioActualizadoDto>(this.ruta(id), cambios, OPCIONES));
    return mapearUsuario(dto.usuario);
  }

  async restablecerClave(id: string): Promise<UsuarioConClave> {
    return this.conClave(await this.pedir(this.http.post<UsuarioConClaveDto>(`${this.ruta(id)}/restablecer-clave`, {}, OPCIONES)));
  }

  private conClave(dto: UsuarioConClaveDto): UsuarioConClave {
    return { usuario: mapearUsuario(dto.usuario), claveInicial: dto.claveInicial };
  }

  private ruta(id: string): string {
    return `${RUTA}/${encodeURIComponent(id)}`;
  }

  private async pedir<T>(llamada: Observable<T>): Promise<T> {
    try {
      return await firstValueFrom(llamada);
    } catch (error) {
      throw toIncidenciaError(error);
    }
  }
}
