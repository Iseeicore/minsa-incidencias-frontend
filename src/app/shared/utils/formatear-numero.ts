const FORMATO = new Intl.NumberFormat("es-PE");

export function formatearNumero(valor: number): string {
  return FORMATO.format(valor);
}
