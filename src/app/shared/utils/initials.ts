/** Devuelve hasta dos iniciales en mayúscula del nombre completo. */
export function initials(nombreCompleto: string): string {
  return nombreCompleto
    .trim()
    .split(/\s+/)
    .filter((parte) => parte.length > 0)
    .slice(0, 2)
    .map((parte) => parte[0].toUpperCase())
    .join("");
}

export function firstName(nombreCompleto: string): string {
  return nombreCompleto.trim().split(/\s+/)[0] ?? "";
}
