import { EstadoDerivacion } from "@/features/derivaciones/enums/estado-derivacion.enum";
import { BadgeTone } from "@/shared/enums/badge.enum";

export const SIN_FECHA = "—";

export const ESTADO_DERIVACION_BADGE: Record<EstadoDerivacion, { readonly label: string; readonly tone: BadgeTone }> = {
  [EstadoDerivacion.PENDIENTE]: { label: "Pendiente", tone: BadgeTone.WARNING },
  [EstadoDerivacion.REALIZADA]: { label: "Realizada", tone: BadgeTone.SUCCESS },
  [EstadoDerivacion.REASIGNADA]: { label: "Reasignada", tone: BadgeTone.PRIMARY },
  [EstadoDerivacion.FUERA_COMPETENCIA]: { label: "Fuera de competencia", tone: BadgeTone.DANGER },
};

export const TABS_DERIVACION: readonly { readonly value: EstadoDerivacion; readonly label: string }[] = [
  { value: EstadoDerivacion.PENDIENTE, label: "Pendientes" },
  { value: EstadoDerivacion.REALIZADA, label: "Realizadas" },
  { value: EstadoDerivacion.REASIGNADA, label: "Reasignadas" },
  { value: EstadoDerivacion.FUERA_COMPETENCIA, label: "Fuera de competencia" },
];
