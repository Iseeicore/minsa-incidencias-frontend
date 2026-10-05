import { ROUTE } from "@/shared/constants/routes";
import { IconName } from "@/shared/enums/icon-name.enum";
import { ModuloCodigo } from "@/shared/enums/modulo-codigo.enum";
import type { NavSection } from "./nav.types";

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    id: "operacion",
    label: "Operación",
    entries: [
      { id: "dashboard", label: "Dashboard", icon: IconName.DASHBOARD, path: ROUTE.INICIO },
      { id: "casos", label: "Casos", icon: IconName.CASES, path: ROUTE.CASOS, modulo: ModuloCodigo.INCIDENCIAS },
      { id: "bandejas", label: "Mis bandejas", icon: IconName.INBOX, path: ROUTE.BANDEJAS, modulo: ModuloCodigo.INCIDENCIAS },
      { id: "derivaciones", label: "Derivaciones", icon: IconName.DERIVATIONS, path: ROUTE.DERIVACIONES, modulo: ModuloCodigo.INCIDENCIAS },
    ],
  },
  {
    id: "ia",
    label: "Inteligencia IA",
    entries: [
      { id: "revision-ia", label: "Revisión IA", icon: IconName.AI_REVIEW, modulo: ModuloCodigo.REVISION },
      { id: "dataset", label: "Dataset", icon: IconName.DATASET, modulo: ModuloCodigo.ENTRENAMIENTO_IA },
      { id: "modelos", label: "Modelos", icon: IconName.MODELS, modulo: ModuloCodigo.ENTRENAMIENTO_IA },
    ],
  },
  {
    id: "configuracion",
    label: "Configuración",
    entries: [
      { id: "etiquetas", label: "Etiquetas", icon: IconName.LABELS },
      { id: "competencias", label: "Competencias", icon: IconName.COMPETENCIES },
      { id: "organismos", label: "Organismos y áreas", icon: IconName.ORGANIZATIONS, modulo: ModuloCodigo.USUARIOS },
      { id: "usuarios", label: "Usuarios", icon: IconName.USERS, modulo: ModuloCodigo.USUARIOS },
    ],
  },
  {
    id: "seguridad",
    label: "Seguridad",
    entries: [
      { id: "evidencias", label: "Evidencias", icon: IconName.EVIDENCE },
      { id: "alertas", label: "Alertas", icon: IconName.BELL },
      { id: "auditoria", label: "Auditoría", icon: IconName.AUDIT },
    ],
  },
];
