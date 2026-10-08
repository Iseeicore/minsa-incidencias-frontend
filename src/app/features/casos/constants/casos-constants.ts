import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { TipoEvidencia } from "@/features/casos/enums/tipo-evidencia.enum";
import { TipoArea } from "@/shared/enums/tipo-area.enum";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { Prioridad } from "@/shared/enums/prioridad.enum";
import type { SelectOption } from "@/shared/ui/select-field/select-field";
import type { TabOption } from "@/shared/ui/tabs/tabs";

export const FILTRO_TODOS = "todos";
export const SIN_DATO = "—";
export const SIN_AREA = "Sin derivar";
export const SIN_ESTABLECIMIENTO = "Sin establecimiento";
export const SIN_CATEGORIA_API = "sin-categoria";
export const HORAS_POR_DIA = 24;
export const TAMANO_PAGINA = 20;
export const LIMITE_AREAS = 8;
export const MINIMO_BUSQUEDA_AREA = 2;
export const LIMITE_BANDEJA = 100;
export const MAX_RESOLUCION = 4000;

export const CATEGORIA_LABEL: Record<CategoriaCaso, string> = {
  [CategoriaCaso.DENUNCIA_CORRUPCION]: "Denuncia por corrupción",
  [CategoriaCaso.QUEJA]: "Queja",
  [CategoriaCaso.RECLAMO]: "Reclamo",
  [CategoriaCaso.OTRO]: "Otro",
};

export const ACCION_LABEL: Record<AccionCaso, string> = {
  [AccionCaso.CONFIRMAR]: "Confirmar categoría",
  [AccionCaso.CORREGIR]: "Corregir categoría",
  [AccionCaso.DERIVAR]: "Derivar al área",
  [AccionCaso.TOMAR]: "Tomar en gestión",
  [AccionCaso.RESOLVER]: "Resolver el caso",
};

export const TIPO_EVIDENCIA_LABEL: Record<TipoEvidencia, string> = {
  [TipoEvidencia.IMAGEN]: "Imagen",
  [TipoEvidencia.DOCUMENTO]: "Documento",
  [TipoEvidencia.AUDIO]: "Audio",
  [TipoEvidencia.VIDEO]: "Video",
};

export const ESTADO_BADGE: Record<EstadoCaso, { readonly label: string; readonly tone: BadgeTone }> = {
  [EstadoCaso.REGISTRADO]: { label: "Registrado", tone: BadgeTone.NEUTRAL },
  [EstadoCaso.CLASIFICADO]: { label: "Clasificado", tone: BadgeTone.PRIMARY },
  [EstadoCaso.DERIVADO]: { label: "Derivado", tone: BadgeTone.PRIMARY },
  [EstadoCaso.EN_GESTION]: { label: "En gestión", tone: BadgeTone.WARNING },
  [EstadoCaso.RESUELTO]: { label: "Resuelto", tone: BadgeTone.SUCCESS },
  [EstadoCaso.ARCHIVADO]: { label: "Archivado", tone: BadgeTone.NEUTRAL },
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
  { value: FiltroTab.OTRO, label: "Otro" },
  { value: FiltroTab.SIN_CATEGORIA, label: "Sin categoría" },
];

const TABS_TODAS: readonly TabOption[] = TABS_OPCIONES;
const TABS_DE_ESTABLECIMIENTO: readonly TabOption[] = TABS_OPCIONES.filter((tab) =>
  [FiltroTab.TODOS, FiltroTab.RECLAMOS, FiltroTab.QUEJAS].some((permitida) => permitida === tab.value),
);
const TABS_DE_OTRANS: readonly TabOption[] = TABS_OPCIONES.filter((tab) =>
  [FiltroTab.TODOS, FiltroTab.CORRUPCION].some((permitida) => permitida === tab.value),
);

/**
 * Pestañas que tienen sentido según el tipo de área de la persona (sin área: todas). Corrupción solo la ve OTRANS
 * (y quien no tiene área); el servidor es quien impone el alcance, esto solo evita pestañas que siempre salen vacías.
 */
export const TABS_POR_TIPO_AREA: Record<TipoArea, readonly TabOption[]> = {
  [TipoArea.ESTABLECIMIENTO]: TABS_DE_ESTABLECIMIENTO,
  [TipoArea.DIRIS]: TABS_DE_ESTABLECIMIENTO,
  [TipoArea.INSTITUTO]: TABS_DE_ESTABLECIMIENTO,
  [TipoArea.ORGANISMO]: TABS_DE_ESTABLECIMIENTO,
  [TipoArea.OTRANS]: TABS_DE_OTRANS,
};
export const TABS_SIN_AREA: readonly TabOption[] = TABS_TODAS;

export const CATEGORIA_POR_TAB: Record<FiltroTab, string | undefined> = {
  [FiltroTab.TODOS]: undefined,
  [FiltroTab.RECLAMOS]: CategoriaCaso.RECLAMO,
  [FiltroTab.QUEJAS]: CategoriaCaso.QUEJA,
  [FiltroTab.CORRUPCION]: CategoriaCaso.DENUNCIA_CORRUPCION,
  [FiltroTab.OTRO]: CategoriaCaso.OTRO,
  [FiltroTab.SIN_CATEGORIA]: SIN_CATEGORIA_API,
};

export const ESTADO_OPCIONES: readonly SelectOption[] = [
  { value: FILTRO_TODOS, label: "Todo estado" },
  ...Object.values(EstadoCaso).map((estado) => ({ value: estado, label: ESTADO_BADGE[estado].label })),
];
