import { BadgeTone } from "@/shared/enums/badge.enum";
import { Prioridad } from "@/shared/enums/prioridad.enum";
import type { BarDatum } from "@/shared/ui/bar-chart/bar-chart";
import { Periodo } from "@/features/inicio/enums/periodo.enum";
import type { AlertaResumen, CasoAtencion, CategoriaCasos, Kpi, ResumenFila } from "@/features/inicio/types/dashboard.types";

export const KPIS_DEMO: readonly Kpi[] = [
  { id: "recibidos", label: "Casos recibidos", value: "1 248", delta: "+8 % vs. mes anterior", tone: BadgeTone.PRIMARY },
  { id: "pendientes", label: "Casos pendientes", value: "312", delta: "-3 % vs. mes anterior", tone: BadgeTone.SUCCESS },
  { id: "atencion", label: "En atención", value: "187", delta: "+12 % vs. mes anterior", tone: BadgeTone.NEUTRAL },
  { id: "vencidos", label: "Casos vencidos", value: "24", delta: "+5 casos esta semana", tone: BadgeTone.DANGER },
  { id: "tiempo", label: "Tiempo promedio", value: "2,4 días", delta: "-0,3 días", tone: BadgeTone.SUCCESS },
];

export const EVOLUCION_DEMO: Record<Periodo, readonly BarDatum[]> = {
  [Periodo.SIETE_DIAS]: [
    { label: "Lun", value: 38 },
    { label: "Mar", value: 52 },
    { label: "Mié", value: 47 },
    { label: "Jue", value: 61 },
    { label: "Vie", value: 44 },
    { label: "Sáb", value: 19 },
    { label: "Dom", value: 12 },
  ],
  [Periodo.TREINTA_DIAS]: [
    { label: "S1", value: 248 },
    { label: "S2", value: 281 },
    { label: "S3", value: 305 },
    { label: "S4", value: 264 },
  ],
  [Periodo.NOVENTA_DIAS]: [
    { label: "Ene", value: 890 },
    { label: "Feb", value: 1010 },
    { label: "Mar", value: 1248 },
  ],
};

export const CATEGORIAS_DEMO: readonly CategoriaCasos[] = [
  { label: "Reclamos", casos: 604, porcentaje: 48 },
  { label: "Quejas", casos: 386, porcentaje: 31 },
  { label: "Consultas", casos: 187, porcentaje: 15 },
  { label: "Corrupción", casos: 71, porcentaje: 6 },
];

export const CASOS_ATENCION_DEMO: readonly CasoAtencion[] = [
  { codigo: "MINSA-2026-003241", categoria: "Reclamo", prioridad: Prioridad.ALTA, responsable: "Lucía Paredes", vencimiento: "Vencido hace 2 h" },
  { codigo: "MINSA-2026-003198", categoria: "Queja", prioridad: Prioridad.ALTA, responsable: "Marco Quispe", vencimiento: "Hoy, 17:00" },
  { codigo: "MINSA-2026-003177", categoria: "Reclamo", prioridad: Prioridad.MEDIA, responsable: "Sofía Rojas", vencimiento: "Mañana" },
  { codigo: "MINSA-2026-003152", categoria: "Corrupción", prioridad: Prioridad.ALTA, responsable: "Jorge Salas", vencimiento: "Mañana" },
  { codigo: "MINSA-2026-003120", categoria: "Queja", prioridad: Prioridad.BAJA, responsable: "Marco Quispe", vencimiento: "En 3 días" },
];

export const DERIVACIONES_DEMO: readonly ResumenFila[] = [
  { label: "Pendientes de derivar", valor: "12" },
  { label: "Derivadas hoy", valor: "38" },
  { label: "Reasignadas", valor: "7" },
  { label: "Fuera de competencia", valor: "4" },
];

export const ALERTAS_DEMO: readonly AlertaResumen[] = [
  { id: "a1", titulo: "Caso vencido", detalle: "MINSA-2026-003241 · Atención al ciudadano", tone: BadgeTone.DANGER, etiqueta: "Hace 2 h" },
  { id: "a2", titulo: "Baja confianza de la IA", detalle: "MINSA-2026-003230 · Pendiente de revisión", tone: BadgeTone.WARNING, etiqueta: "Hace 5 h" },
  { id: "a3", titulo: "Próximo a vencer", detalle: "MINSA-2026-003198 · Hoy, 17:00", tone: BadgeTone.WARNING, etiqueta: "Hoy" },
];
