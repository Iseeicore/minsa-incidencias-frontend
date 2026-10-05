import { ROUTE } from "@/shared/constants/routes";
import { IconName } from "@/shared/enums/icon-name.enum";
import { VistaCodigo } from "@/shared/enums/vista-codigo.enum";
import type { NavSection } from "./nav.types";

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    id: "operacion",
    label: "Operación",
    entries: [
      { id: "dashboard", label: "Dashboard", icon: IconName.DASHBOARD, path: ROUTE.INICIO, vista: VistaCodigo.INICIO },
      { id: "casos", label: "Casos", icon: IconName.CASES, path: ROUTE.CASOS, vista: VistaCodigo.CASOS },
      { id: "bandejas", label: "Mis bandejas", icon: IconName.INBOX, path: ROUTE.BANDEJAS, vista: VistaCodigo.BANDEJAS },
      {
        id: "derivaciones",
        label: "Derivaciones",
        icon: IconName.DERIVATIONS,
        path: ROUTE.DERIVACIONES,
        vista: VistaCodigo.DERIVACIONES,
      },
    ],
  },
  {
    id: "ia",
    label: "Inteligencia IA",
    entries: [
      { id: "revision-ia", label: "Revisión IA", icon: IconName.AI_REVIEW },
      { id: "dataset", label: "Dataset", icon: IconName.DATASET },
      { id: "modelos", label: "Modelos", icon: IconName.MODELS },
    ],
  },
  {
    id: "configuracion",
    label: "Configuración",
    entries: [
      { id: "etiquetas", label: "Etiquetas", icon: IconName.LABELS },
      { id: "competencias", label: "Competencias", icon: IconName.COMPETENCIES },
      { id: "organismos", label: "Organismos y áreas", icon: IconName.ORGANIZATIONS },
      { id: "usuarios", label: "Usuarios", icon: IconName.USERS },
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
