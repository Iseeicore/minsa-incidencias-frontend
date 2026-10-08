import type { CategoriaCasos, ResumenFila } from "@/features/inicio/types/dashboard.types";
import type { HBarDatum } from "@/shared/ui/hbar-list/hbar-list";

export function categoriasABarras(categorias: readonly CategoriaCasos[]): readonly HBarDatum[] {
  return categorias.map((categoria) => ({
    label: categoria.label,
    valor: categoria.casos,
    detalle: `${categoria.porcentaje} %`,
  }));
}

export function resumenABarras(filas: readonly ResumenFila[]): readonly HBarDatum[] {
  return filas.map((fila) => ({ label: fila.label, valor: fila.valor }));
}
