/** Índice al que lleva una tecla de navegación en una lista circular de pestañas; `null` si la tecla no navega. */
export function indiceDeTecla(tecla: string, actual: number, total: number): number | null {
  if (total === 0) return null;
  switch (tecla) {
    case "ArrowRight":
      return (actual + 1) % total;
    case "ArrowLeft":
      return (actual - 1 + total) % total;
    case "Home":
      return 0;
    case "End":
      return total - 1;
    default:
      return null;
  }
}
