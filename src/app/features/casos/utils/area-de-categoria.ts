import { AREA_POR_CATEGORIA, SIN_AREA } from "@/features/casos/constants/casos-constants";
import type { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";

/** El área sale de la categoría (tabla rol_categoria): no se elige a mano. */
export function areaDe(categoria: CategoriaCaso | null): string {
  return (categoria && AREA_POR_CATEGORIA[categoria]) ?? SIN_AREA;
}

export function tieneArea(categoria: CategoriaCaso | null): boolean {
  return categoria !== null && AREA_POR_CATEGORIA[categoria] !== null;
}
