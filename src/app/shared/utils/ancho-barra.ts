export const ANCHO_MINIMO_BARRA = 3;

/** Porcentaje de ancho de una barra: cero no dibuja nada y un valor pequeño sigue visible. */
export function anchoBarra(valor: number, maximo: number): number {
  const proporcion = valor / maximo;
  if (!(proporcion > 0)) return 0;
  return Math.min(100, Math.max(ANCHO_MINIMO_BARRA, Math.round(proporcion * 100)));
}
