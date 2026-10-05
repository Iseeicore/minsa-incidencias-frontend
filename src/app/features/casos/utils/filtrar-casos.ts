import { FILTRO_TODOS } from "@/features/casos/constants/casos-constants";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import type { Caso, FiltrosCasos } from "@/features/casos/types/caso.types";
import { Prioridad } from "@/shared/enums/prioridad.enum";

const COINCIDE_TAB: Record<FiltroTab, (caso: Caso) => boolean> = {
  [FiltroTab.TODOS]: () => true,
  [FiltroTab.RECLAMOS]: (caso) => caso.categoria === CategoriaCaso.RECLAMO,
  [FiltroTab.QUEJAS]: (caso) => caso.categoria === CategoriaCaso.QUEJA,
  [FiltroTab.CORRUPCION]: (caso) => caso.categoria === CategoriaCaso.DENUNCIA_CORRUPCION,
  [FiltroTab.CRITICOS]: (caso) => caso.prioridad === Prioridad.ALTA,
};

/** Quita tildes y mayúsculas para que "corrupcion" encuentre "Corrupción". */
export function normalizar(texto: string): string {
  return texto
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

export function filtrarCasos(casos: readonly Caso[], filtros: FiltrosCasos): Caso[] {
  const texto = normalizar(filtros.texto);
  return casos.filter((caso) => {
    if (!COINCIDE_TAB[filtros.tab](caso)) return false;
    if (filtros.prioridad !== FILTRO_TODOS && caso.prioridad !== filtros.prioridad) return false;
    if (filtros.estado !== FILTRO_TODOS && caso.estado !== filtros.estado) return false;
    if (texto === "") return true;
    const pajar = normalizar([caso.codigo, caso.area, caso.organismo, caso.responsable, ...caso.etiquetas].join(" "));
    return pajar.includes(texto);
  });
}
