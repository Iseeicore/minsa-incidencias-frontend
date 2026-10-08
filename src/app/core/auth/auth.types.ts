import type { RolCodigo } from "@/shared/enums/rol-codigo.enum";
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
  /** Códigos de rol de la sesión. Solo distingue al ADMINISTRADOR para el menú: el servidor decide los permisos. */
  roles: RolCodigo[];
  /** Área a la que pertenece la persona (GESTOR, OTRANS y ESTABLECIMIENTO la tienen); `null` solo para el ADMINISTRADOR. */
  area: AreaSesion | null;
}
