/** Un conteo acotado por el servidor se muestra como `1000+` cuando hay más de los que se cuentan. */
export function textoConteo(cantidad: number, conMas = false): string {
  return `${cantidad}${conMas ? "+" : ""}`;
}
