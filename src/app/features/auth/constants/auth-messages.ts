import { AuthErrorCode } from "@/core/auth/enums/auth-error-code.enum";

export const AUTH_ERROR_MESSAGES: Record<AuthErrorCode, string> = {
  [AuthErrorCode.INVALID_CREDENTIALS]: "Correo o contraseña incorrectos.",
  [AuthErrorCode.ACCOUNT_LOCKED]: "Tu cuenta está bloqueada. Contacta a un administrador.",
  [AuthErrorCode.TOO_MANY_ATTEMPTS]: "Demasiados intentos. Espera unos minutos e inténtalo de nuevo.",
  [AuthErrorCode.NETWORK]: "No se pudo conectar con el servidor. Revisa tu conexión.",
  [AuthErrorCode.UNKNOWN]: "No se pudo iniciar sesión. Inténtalo de nuevo.",
};

export const LOGIN_FIELD_MESSAGES = {
  correo: {
    required: "Ingresa tu correo.",
    email: "Ingresa un correo válido.",
  },
  password: {
    required: "Ingresa tu contraseña.",
  },
} as const;

export const LOGIN_ASIDE_ITEMS: readonly string[] = [
  "Revisar las incidencias de los pacientes",
  "Confirmar o corregir su categoría",
  "Registrar la resolución",
  "Ver los indicadores del día",
];
