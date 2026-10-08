import { RespuestaInvalidaError } from "@/features/casos/services/incidencia-error";
import type { Usuario, UsuarioDto } from "@/features/usuarios/types/usuario.types";
import { RolCodigo } from "@/shared/enums/rol-codigo.enum";

function rolDe(valor: string | null): RolCodigo | null {
  if (valor === null) return null;
  const rol = Object.values(RolCodigo).find((candidato) => candidato === valor);
  if (rol === undefined) throw new RespuestaInvalidaError("rol");
  return rol;
}

export function mapearUsuario(dto: UsuarioDto): Usuario {
  return {
    id: dto.id,
    nombreCompleto: dto.nombreCompleto,
    correo: dto.correo,
    rol: rolDe(dto.rol),
    activo: dto.activo,
    area: dto.area === null ? null : { codigo: dto.area.codigo, nombre: dto.area.nombre },
  };
}
