import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { RolDemo } from "@/features/casos/enums/rol-demo.enum";
import { TipoEvidencia } from "@/features/casos/enums/tipo-evidencia.enum";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { Prioridad } from "@/shared/enums/prioridad.enum";
import type { SelectOption } from "@/shared/ui/select-field/select-field";
import type { TabOption } from "@/shared/ui/tabs/tabs";

export const FILTRO_TODOS = "todos";
export const SIN_DATO = "—";
export const SIN_AREA = "Sin área";

export const CATEGORIA_LABEL: Record<CategoriaCaso, string> = {
  [CategoriaCaso.DENUNCIA_CORRUPCION]: "Denuncia por corrupción",
  [CategoriaCaso.QUEJA]: "Queja",
  [CategoriaCaso.RECLAMO]: "Reclamo",
  [CategoriaCaso.OTRO]: "Otro",
};

export const AREA_POR_CATEGORIA: Record<CategoriaCaso, string | null> = {
  [CategoriaCaso.DENUNCIA_CORRUPCION]: "Área de denuncias por corrupción",
  [CategoriaCaso.QUEJA]: "Área de quejas",
  [CategoriaCaso.RECLAMO]: "Área de reclamos",
  [CategoriaCaso.OTRO]: null,
};

export const CATEGORIA_DE_AREA: Partial<Record<RolDemo, CategoriaCaso>> = {
  [RolDemo.AREA_RECLAMO]: CategoriaCaso.RECLAMO,
  [RolDemo.AREA_QUEJA]: CategoriaCaso.QUEJA,
  [RolDemo.AREA_DENUNCIA_CORRUPCION]: CategoriaCaso.DENUNCIA_CORRUPCION,
};

export const ROL_LABEL: Record<RolDemo, string> = {
  [RolDemo.ADMINISTRADOR]: "Administrador",
  [RolDemo.GESTOR]: "Gestor",
  [RolDemo.REVISOR]: "Revisor",
  [RolDemo.AREA_RECLAMO]: "Área de reclamos",
  [RolDemo.AREA_QUEJA]: "Área de quejas",
  [RolDemo.AREA_DENUNCIA_CORRUPCION]: "Área de denuncias por corrupción",
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

export const ROL_OPCIONES: readonly SelectOption[] = Object.values(RolDemo).map((rol) => ({
  value: rol,
  label: ROL_LABEL[rol],
}));
