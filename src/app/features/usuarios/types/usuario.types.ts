import type { RolCodigo } from "@/shared/enums/rol-codigo.enum";

export interface AreaUsuario {
  readonly codigo: string;
  readonly nombre: string;
}

export interface Usuario {
  readonly id: string;
  readonly nombreCompleto: string;
  readonly correo: string;
  /** `null` si el usuario no tiene ningún rol activo. */
  readonly rol: RolCodigo | null;
  readonly activo: boolean;
  readonly area: AreaUsuario | null;
}

export interface ListaUsuarios {
  readonly usuarios: readonly Usuario[];
  readonly siguiente: string | null;
  readonly hayMas: boolean;
}

export interface ConsultaUsuarios {
  readonly limite?: number;
  readonly cursor?: string;
  readonly q?: string;
  /** Código del área; solo lo respeta quien ve varias. */
  readonly area?: string;
}

export interface NuevoUsuario {
  readonly nombreCompleto: string;
  readonly correo: string;
  readonly rol: RolCodigo;
  /** Solo el administrador la indica; un establecimiento crea siempre en el suyo. */
  readonly area?: string;
}

export interface CambiosUsuario {
  readonly rol?: RolCodigo;
  readonly activo?: boolean;
  readonly area?: string;
}

/** La clave inicial se muestra una sola vez: no se guarda en ningún estado que dure más que el diálogo. */
export interface UsuarioConClave {
  readonly usuario: Usuario;
  readonly claveInicial: string;
}

export type ResultadoUsuario = { readonly ok: true; readonly usuario: Usuario } | { readonly ok: false; readonly error: string };

export type ResultadoConClave = ({ readonly ok: true } & UsuarioConClave) | { readonly ok: false; readonly error: string };

/** Lo que muestra el diálogo de la clave inicial. */
export interface CredencialInicial {
  readonly nombreCompleto: string;
  readonly correo: string;
  readonly claveInicial: string;
  readonly restablecida: boolean;
}

export interface UsuarioDto {
  readonly id: string;
  readonly nombreCompleto: string;
  readonly correo: string;
  readonly rol: string | null;
  readonly activo: boolean;
  readonly area: AreaUsuario | null;
}

export interface ListaUsuariosDto {
  readonly items: readonly UsuarioDto[];
  readonly siguiente: string | null;
  readonly hayMas: boolean;
}

export interface UsuarioConClaveDto {
  readonly usuario: UsuarioDto;
  readonly claveInicial: string;
}

export interface UsuarioActualizadoDto {
  readonly usuario: UsuarioDto;
}
