import type { TipoArea } from "@/shared/enums/tipo-area.enum";
import type { VistaCodigo } from "@/shared/enums/vista-codigo.enum";

export interface Credentials {
  correo: string;
  password: string;
}

export interface AreaSesion {
  codigo: string;
  nombre: string;
  tipo: TipoArea;
}

export interface SesionUsuario {
  nombreCompleto: string;
  correo: string;
  vistas: VistaCodigo[];
  /** Área a la que pertenece la persona; `null` para ADMINISTRADOR y GESTOR, que no tienen área. */
  area: AreaSesion | null;
}
