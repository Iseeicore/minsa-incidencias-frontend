import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { AtajoFecha } from "@/features/casos/enums/atajo-fecha.enum";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { MotivoArchivo } from "@/features/casos/enums/motivo-archivo.enum";
import { ResultadoResolucion } from "@/features/casos/enums/resultado-resolucion.enum";
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
export const MAX_RANGO_DIAS = 366;
export const LARGO_NUMERO_CODIGO = 6;
export const PLACEHOLDER_BUSQUEDA = "Buscar por código (MINSA-2026-000017) o por relato";
export const MAX_RESOLUCION = 4000;
export const MAX_ARCHIVO_DETALLE = 2000;
export const MAX_REAPERTURA_MOTIVO = 2000;
export const MIN_TEXTO_REVISION = 10;
export const ARCHIVADO_POR_SISTEMA = "Archivado automáticamente";

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
  [AccionCaso.ARCHIVAR]: "Archivar el caso",
  [AccionCaso.REABRIR]: "Reabrir el caso",
};

export const MOTIVO_ARCHIVO_LABEL: Record<MotivoArchivo, string> = {
  [MotivoArchivo.DATOS_INSUFICIENTES]: "Datos insuficientes",
  [MotivoArchivo.NO_CORRESPONDE]: "No corresponde",
  [MotivoArchivo.VENCIDA_SIN_ATENDER]: "Venció sin atenderse",
  [MotivoArchivo.RESUELTA_VIGENCIA]: "Resolución cumplió su vigencia",
};

export const RESULTADO_LABEL: Record<ResultadoResolucion, string> = {
  [ResultadoResolucion.ATENDIDO]: "Atendido",
  [ResultadoResolucion.CERRADO]: "Cerrado",
};

const SIN_ELEGIR = "";

/** Los dos motivos que elige una persona al archivar; los otros dos los pone el sistema. */
export const OPCIONES_MOTIVO_ARCHIVO_MANUAL: readonly SelectOption[] = [
  { value: SIN_ELEGIR, label: "Elige un motivo" },
  { value: MotivoArchivo.DATOS_INSUFICIENTES, label: MOTIVO_ARCHIVO_LABEL[MotivoArchivo.DATOS_INSUFICIENTES] },
  { value: MotivoArchivo.NO_CORRESPONDE, label: MOTIVO_ARCHIVO_LABEL[MotivoArchivo.NO_CORRESPONDE] },
];

export const OPCIONES_RESULTADO: readonly SelectOption[] = [
  { value: SIN_ELEGIR, label: "Elige un resultado" },
  ...Object.values(ResultadoResolucion).map((resultado) => ({ value: resultado, label: RESULTADO_LABEL[resultado] })),
];

export const OPCIONES_FILTRO_MOTIVO: readonly SelectOption[] = [
  { value: FILTRO_TODOS, label: "Todos los motivos" },
  ...Object.values(MotivoArchivo).map((motivo) => ({ value: motivo, label: MOTIVO_ARCHIVO_LABEL[motivo] })),
];

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
  { value: FiltroTab.TODOS, label: "Todas" },
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

export interface BandejaOpcion extends TabOption {
  readonly value: BandejaTab;
  readonly ayuda: string;
}

export const BANDEJAS: readonly BandejaOpcion[] = [
  {
    value: BandejaTab.POR_REVISAR,
    label: "Por revisar",
    ayuda: "Clasificados por la IA: falta confirmar o corregir la categoría y derivarlos al área.",
  },
  { value: BandejaTab.EN_GESTION, label: "En gestión", ayuda: "Casos que el área está atendiendo." },
  { value: BandejaTab.DERIVADOS, label: "Derivados", ayuda: "Enviados al área, esperando que alguien los tome." },
  { value: BandejaTab.RESUELTOS, label: "Resueltos", ayuda: "Con resolución vigente; se archivan cuando cumplen su vigencia." },
  {
    value: BandejaTab.ARCHIVADOS,
    label: "Archivados",
    ayuda:
      "Archivados a mano, vencidos sin atender y resueltos que cumplieron su vigencia. Ábrelos para ver el motivo o reabrirlos.",
  },
  { value: BandejaTab.TODOS, label: "Todos", ayuda: "Todos los casos que tu rol puede ver, en cualquier estado." },
];

/** Estado que el servidor filtra en cada pestaña; `Todos` no manda estado. */
export const ESTADO_DE_BANDEJA: Record<BandejaTab, EstadoCaso | undefined> = {
  [BandejaTab.POR_REVISAR]: EstadoCaso.CLASIFICADO,
  [BandejaTab.EN_GESTION]: EstadoCaso.EN_GESTION,
  [BandejaTab.DERIVADOS]: EstadoCaso.DERIVADO,
  [BandejaTab.RESUELTOS]: EstadoCaso.RESUELTO,
  [BandejaTab.ARCHIVADOS]: EstadoCaso.ARCHIVADO,
  [BandejaTab.TODOS]: undefined,
};

export const ATAJOS_FECHA: readonly { readonly value: AtajoFecha; readonly label: string }[] = [
  { value: AtajoFecha.HOY, label: "Hoy" },
  { value: AtajoFecha.SIETE_DIAS, label: "7 días" },
  { value: AtajoFecha.TREINTA_DIAS, label: "30 días" },
  { value: AtajoFecha.ESTE_MES, label: "Este mes" },
];
