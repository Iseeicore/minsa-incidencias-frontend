import { ROUTE } from "@/shared/constants/routes";
import { IconName } from "@/shared/enums/icon-name.enum";
import { VistaCodigo } from "@/shared/enums/vista-codigo.enum";
import type { NavSection } from "./nav.types";

export const NAV_SECTIONS: readonly NavSection[] = [
  {
    id: "operacion",
    label: "Operación",
    entries: [
      { id: "dashboard", label: "Dashboard", icon: IconName.DASHBOARD, path: ROUTE.INICIO, vista: VistaCodigo.INICIO, implementada: true },
      { id: "casos", label: "Casos", icon: IconName.CASES, path: ROUTE.CASOS, vista: VistaCodigo.CASOS, implementada: true },
      { id: "bandejas", label: "Mis bandejas", icon: IconName.INBOX, path: ROUTE.BANDEJAS, vista: VistaCodigo.BANDEJAS, implementada: true },
      {
        id: "derivaciones",
        label: "Derivaciones",
        icon: IconName.DERIVATIONS,
        path: ROUTE.DERIVACIONES,
        vista: VistaCodigo.DERIVACIONES,
        implementada: true,
      },
    ],
  },
  {
    id: "ia",
    label: "Inteligencia IA",
    entries: [
      { id: "revision-ia", label: "Revisión IA", icon: IconName.AI_REVIEW, implementada: false },
      { id: "dataset", label: "Dataset", icon: IconName.DATASET, implementada: false },
      { id: "modelos", label: "Modelos", icon: IconName.MODELS, implementada: false },
    ],
  },
  {
    id: "configuracion",
    label: "Configuración",
    entries: [
      { id: "etiquetas", label: "Etiquetas", icon: IconName.LABELS, implementada: false },
      { id: "competencias", label: "Competencias", icon: IconName.COMPETENCIES, implementada: false },
      { id: "organismos", label: "Organismos y áreas", icon: IconName.ORGANIZATIONS, implementada: false },
      { id: "usuarios", label: "Usuarios", icon: IconName.USERS, implementada: false },
    ],
  },
  {
    id: "seguridad",
    label: "Seguridad",
    entries: [
      { id: "evidencias", label: "Evidencias", icon: IconName.EVIDENCE, implementada: false },
      { id: "alertas", label: "Alertas", icon: IconName.BELL, implementada: false },
      { id: "auditoria", label: "Auditoría", icon: IconName.AUDIT, implementada: false },
    ],
  },
];
