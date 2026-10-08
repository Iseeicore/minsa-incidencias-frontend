import type { VistaCodigo } from "@/shared/enums/vista-codigo.enum";
import type { NavSection } from "./nav.types";

/**
 * Deja solo las entradas con pantalla implementada y, si piden vista, la que tiene el usuario; quita las secciones vacías.
 * El administrador ve todas las entradas y secciones: las que no tienen pantalla (`implementada: false`) se dibujan en gris.
 */
export function visibleNav(
  sections: readonly NavSection[],
  vistas: readonly VistaCodigo[],
  esAdministrador = false,
): NavSection[] {
  if (esAdministrador) return [...sections];
  return sections
    .map((section) => ({
      ...section,
      entries: section.entries.filter(
        (entry) => entry.implementada && (entry.vista === undefined || vistas.includes(entry.vista)),
      ),
    }))
    .filter((section) => section.entries.length > 0);
}
