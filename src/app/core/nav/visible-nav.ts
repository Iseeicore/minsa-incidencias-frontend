import type { VistaCodigo } from "@/shared/enums/vista-codigo.enum";
import type { NavSection } from "./nav.types";

/** Deja solo las entradas sin vista asociada o cuya vista tiene el usuario, y quita las secciones vacías. */
export function visibleNav(sections: readonly NavSection[], vistas: readonly VistaCodigo[]): NavSection[] {
  return sections
    .map((section) => ({
      ...section,
      entries: section.entries.filter((entry) => entry.vista === undefined || vistas.includes(entry.vista)),
    }))
    .filter((section) => section.entries.length > 0);
}
