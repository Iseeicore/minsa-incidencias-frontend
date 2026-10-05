import type { VistaCodigo } from "@/shared/enums/vista-codigo.enum";

export interface Credentials {
  correo: string;
  password: string;
}

export interface SesionUsuario {
  nombreCompleto: string;
  correo: string;
  vistas: VistaCodigo[];
}
