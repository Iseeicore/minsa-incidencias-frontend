export const ELIPSIS = "…";
export type PaginaVisible = number | typeof ELIPSIS;

const PAGINAS_SIN_COLAPSAR = 7;
const PAGINAS_EN_EL_BORDE = 5;
const MARGEN_DEL_BORDE = 4;

function rango(desde: number, hasta: number): number[] {
  return Array.from({ length: hasta - desde + 1 }, (_, indice) => desde + indice);
}

/** Qué números mostrar en el paginador: siempre la primera y la última, la actual con sus vecinas y elipsis en los huecos. */
export function paginasVisibles(actual: number, total: number): PaginaVisible[] {
  if (total <= 0) return [];
  if (total <= PAGINAS_SIN_COLAPSAR) return rango(1, total);
  const pagina = Math.min(Math.max(actual, 1), total);
  if (pagina <= MARGEN_DEL_BORDE) return [...rango(1, PAGINAS_EN_EL_BORDE), ELIPSIS, total];
  if (pagina >= total - MARGEN_DEL_BORDE + 1) return [1, ELIPSIS, ...rango(total - MARGEN_DEL_BORDE, total)];
  return [1, ELIPSIS, pagina - 1, pagina, pagina + 1, ELIPSIS, total];
}
