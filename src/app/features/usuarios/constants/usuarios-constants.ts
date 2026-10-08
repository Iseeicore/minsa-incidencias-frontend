import { RolCodigo } from "@/shared/enums/rol-codigo.enum";
import { TipoArea } from "@/shared/enums/tipo-area.enum";
import type { SelectOption } from "@/shared/ui/select-field/select-field";

export const TAMANO_PAGINA_USUARIOS = 20;
/** El servidor hace cumplir este tope; aquí solo se muestra. */
export const TOPE_USUARIOS_ACTIVOS = 3;
export const MIN_NOMBRE_USUARIO = 3;
export const MAX_NOMBRE_USUARIO = 120;
export const MAX_CORREO_USUARIO = 254;
export const SIN_ROL = "Sin rol";
export const SIN_AREA_USUARIO = "—";
export const SIN_ELEGIR = "";

export const ROL_LABEL: Record<RolCodigo, string> = {
  [RolCodigo.ADMINISTRADOR]: "Administrador",
  [RolCodigo.GESTOR]: "Gestor",
  [RolCodigo.OTRANS]: "OTRANS",
  [RolCodigo.ESTABLECIMIENTO]: "Responsable de establecimiento",
};

/** Roles que se pueden asignar: el administrador, todos; un establecimiento, solo los de su equipo. */
export const ROLES_ASIGNABLES_POR_ADMINISTRADOR: readonly RolCodigo[] = [
  RolCodigo.ADMINISTRADOR,
  RolCodigo.GESTOR,
  RolCodigo.OTRANS,
  RolCodigo.ESTABLECIMIENTO,
];
export const ROLES_ASIGNABLES_POR_ESTABLECIMIENTO: readonly RolCodigo[] = [RolCodigo.GESTOR, RolCodigo.ESTABLECIMIENTO];

/** Tipo de área que exige cada rol; el administrador no tiene área. */
export const TIPO_AREA_POR_ROL: Readonly<Record<RolCodigo, TipoArea | null>> = {
  [RolCodigo.ADMINISTRADOR]: null,
  [RolCodigo.GESTOR]: TipoArea.ESTABLECIMIENTO,
  [RolCodigo.OTRANS]: TipoArea.OTRANS,
  [RolCodigo.ESTABLECIMIENTO]: TipoArea.ESTABLECIMIENTO,
};

export function opcionesDeRol(roles: readonly RolCodigo[]): readonly SelectOption[] {
  return [{ value: SIN_ELEGIR, label: "Elige un rol" }, ...roles.map((rol) => ({ value: rol, label: ROL_LABEL[rol] }))];
}

export const MENSAJE_USUARIOS = {
  SIN_CONEXION: "No se pudo conectar con el servidor. Revisa tu conexión e inténtalo de nuevo.",
  DATOS_NO_VALIDOS: "Revisa los datos enviados e inténtalo de nuevo.",
  AREA_O_ROL_NO_VALIDOS: "El rol o el área elegidos no son válidos para este usuario. Revisa los datos.",
  SIN_PERMISO: "No tienes permiso para esta acción sobre este usuario.",
  NO_DISPONIBLE: "Este usuario ya no está disponible. Actualiza la lista.",
  CONFLICTO: "El usuario cambió mientras lo editabas. Actualiza la lista e inténtalo de nuevo.",
  LIMITE_USUARIOS: `Este establecimiento ya tiene ${TOPE_USUARIOS_ACTIVOS} usuarios activos. Desactiva a uno antes de crear o activar otro.`,
  CORREO_REPETIDO: "Ya existe un usuario con ese correo.",
  AUTOEDICION: "No puedes cambiar tu propio rol ni desactivar tu propia cuenta.",
  DEMASIADAS_PETICIONES: "Demasiadas peticiones seguidas. Espera un momento e inténtalo de nuevo.",
  RESPUESTA_INESPERADA: "El servidor envió una respuesta inesperada. Inténtalo de nuevo.",
  GENERICO: "No se pudo completar la operación. Inténtalo de nuevo.",
  CARGA_LISTA: "No se pudieron cargar los usuarios.",
  COPIADA: "Clave copiada.",
  NO_SE_PUDO_COPIAR: "No se pudo copiar. Selecciónala y cópiala a mano.",
} as const;

export const MENSAJE_CAMPO_USUARIO = {
  nombreCompleto: {
    required: "Escribe el nombre completo.",
    minlength: `El nombre necesita al menos ${MIN_NOMBRE_USUARIO} caracteres.`,
    maxlength: `El nombre no puede pasar de ${MAX_NOMBRE_USUARIO} caracteres.`,
  },
  correo: {
    required: "Escribe el correo.",
    email: "Escribe un correo válido.",
    maxlength: `El correo no puede pasar de ${MAX_CORREO_USUARIO} caracteres.`,
  },
} as const;
