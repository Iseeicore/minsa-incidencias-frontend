import { ModuloCodigo } from "@/shared/enums/modulo-codigo.enum";

export const MODULO_LABELS: Record<ModuloCodigo, string> = {
  [ModuloCodigo.INCIDENCIAS]: "Incidencias",
  [ModuloCodigo.REVISION]: "Revisión y resolución",
  [ModuloCodigo.INDICADORES]: "Indicadores",
  [ModuloCodigo.ENTRENAMIENTO_IA]: "Entrenamiento de la IA",
  [ModuloCodigo.USUARIOS]: "Usuarios y roles",
};
