import type { ModuloCodigo } from "@/shared/enums/modulo-codigo.enum";

export interface Credentials {
  correo: string;
  password: string;
}

export interface SesionUsuario {
  nombreCompleto: string;
  correo: string;
  modulos: ModuloCodigo[];
}
