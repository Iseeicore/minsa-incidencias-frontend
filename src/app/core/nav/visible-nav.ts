import type { ModuloCodigo } from "@/shared/enums/modulo-codigo.enum";
import type { NavSection } from "./nav.types";

/** Deja solo las entradas sin módulo asociado o cuyo módulo tiene el usuario, y quita las secciones vacías. */
export function visibleNav(sections: readonly NavSection[], modulos: readonly ModuloCodigo[]): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      entries: section.entries.filter((entry) => entry.modulo === undefined || modulos.includes(entry.modulo)),
    }))
    .filter((section) => section.entries.length > 0);
}
