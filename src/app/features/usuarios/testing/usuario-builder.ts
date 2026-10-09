import type { Usuario, UsuarioDto } from "@/features/usuarios/types/usuario.types";
import { RolCodigo } from "@/shared/enums/rol-codigo.enum";

export function crearUsuario(parcial: Partial<Usuario> = {}): Usuario {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    nombreCompleto: "Rosa Quispe",
    correo: "rosa@minsa.gob.pe",
    rol: RolCodigo.GESTOR,
    activo: true,
    area: { codigo: "EESS-6206", nombre: "Hospital Dos de Mayo" },
    ...parcial,
  };
}

export function crearUsuarioDto(parcial: Partial<UsuarioDto> = {}): UsuarioDto {
  return {
    id: "11111111-1111-4111-8111-111111111111",
    nombreCompleto: "Rosa Quispe",
    correo: "rosa@minsa.gob.pe",
    rol: "GESTOR",
    activo: true,
    area: { codigo: "EESS-6206", nombre: "Hospital Dos de Mayo" },
    ...parcial,
  };
}
