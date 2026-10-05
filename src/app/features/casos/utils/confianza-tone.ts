import { BadgeTone } from "@/shared/enums/badge.enum";

const UMBRAL_ALTA = 85;
const UMBRAL_MEDIA = 60;

export function tonoConfianza(confianza: number): BadgeTone {
  if (confianza >= UMBRAL_ALTA) return BadgeTone.SUCCESS;
  if (confianza >= UMBRAL_MEDIA) return BadgeTone.WARNING;
  return BadgeTone.DANGER;
}
