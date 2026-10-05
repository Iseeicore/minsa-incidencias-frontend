import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { Prioridad } from "@/shared/enums/prioridad.enum";
import type { SelectOption } from "@/shared/ui/select-field/select-field";
import type { TabOption } from "@/shared/ui/tabs/tabs";

export const FILTRO_TODOS = "todos";

export const CATEGORIA_LABEL: Record<CategoriaCaso, string> = {
  [CategoriaCaso.RECLAMO]: "Reclamo",
  [CategoriaCaso.QUEJA]: "Queja",
  [CategoriaCaso.CORRUPCION]: "Corrupción",
};

export const ESTADO_BADGE: Record<EstadoCaso, { readonly label: string; readonly tone: BadgeTone }> = {
  [EstadoCaso.NUEVO]: { label: "Nuevo", tone: BadgeTone.PRIMARY },
  [EstadoCaso.EN_ATENCION]: { label: "En atención", tone: BadgeTone.WARNING },
  [EstadoCaso.DERIVADO]: { label: "Derivado", tone: BadgeTone.NEUTRAL },
  [EstadoCaso.VENCIDO]: { label: "Vencido", tone: BadgeTone.DANGER },
  [EstadoCaso.CERRADO]: { label: "Cerrado", tone: BadgeTone.SUCCESS },
};

export const PRIORIDAD_CASO_BADGE: Record<Prioridad, { readonly label: string; readonly tone: BadgeTone }> = {
  [Prioridad.ALTA]: { label: "Alta", tone: BadgeTone.DANGER },
  [Prioridad.MEDIA]: { label: "Media", tone: BadgeTone.WARNING },
  [Prioridad.BAJA]: { label: "Baja", tone: BadgeTone.NEUTRAL },
};

export const TABS_OPCIONES: readonly TabOption[] = [
  { value: FiltroTab.TODOS, label: "Todos" },
  { value: FiltroTab.RECLAMOS, label: "Reclamos" },
  { value: FiltroTab.QUEJAS, label: "Quejas" },
  { value: FiltroTab.CORRUPCION, label: "Corrupción" },
  { value: FiltroTab.CRITICOS, label: "Críticos" },
];

export const PRIORIDAD_OPCIONES: readonly SelectOption[] = [
  { value: FILTRO_TODOS, label: "Toda prioridad" },
  { value: Prioridad.ALTA, label: PRIORIDAD_CASO_BADGE[Prioridad.ALTA].label },
  { value: Prioridad.MEDIA, label: PRIORIDAD_CASO_BADGE[Prioridad.MEDIA].label },
  { value: Prioridad.BAJA, label: PRIORIDAD_CASO_BADGE[Prioridad.BAJA].label },
];

export const ESTADO_OPCIONES: readonly SelectOption[] = [
  { value: FILTRO_TODOS, label: "Todo estado" },
  ...Object.values(EstadoCaso).map((estado) => ({ value: estado, label: ESTADO_BADGE[estado].label })),
];
