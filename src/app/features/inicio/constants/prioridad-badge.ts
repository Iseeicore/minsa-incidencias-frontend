import { BadgeTone } from "@/shared/enums/badge.enum";
import { Prioridad } from "@/shared/enums/prioridad.enum";

export const PRIORIDAD_BADGE: Record<Prioridad, { readonly label: string; readonly tone: BadgeTone }> = {
  [Prioridad.ALTA]: { label: "Alta", tone: BadgeTone.DANGER },
  [Prioridad.MEDIA]: { label: "Media", tone: BadgeTone.WARNING },
  [Prioridad.BAJA]: { label: "Baja", tone: BadgeTone.NEUTRAL },
};
