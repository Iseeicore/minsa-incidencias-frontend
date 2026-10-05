import type { TabOption } from "@/shared/ui/tabs/tabs";
import { Periodo } from "@/features/inicio/enums/periodo.enum";

export const PERIODO_OPCIONES: readonly TabOption[] = [
  { value: Periodo.SIETE_DIAS, label: "7 días" },
  { value: Periodo.TREINTA_DIAS, label: "30 días" },
  { value: Periodo.NOVENTA_DIAS, label: "90 días" },
];
