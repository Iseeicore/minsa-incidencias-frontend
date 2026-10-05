import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { Caso } from "@/features/casos/types/caso.types";
import { Prioridad } from "@/shared/enums/prioridad.enum";

const DIRIS = "DIRIS Lima Norte";
const HOSPITAL = "Hospital Nacional";

export const CASOS_DEMO: readonly Caso[] = [
  { codigo: "MINSA-2026-003241", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Cobro indebido", "Farmacia"], prioridad: Prioridad.ALTA, organismo: DIRIS, area: "Atención al ciudadano", responsable: "Lucía Paredes", estado: EstadoCaso.VENCIDO, confianzaIa: 92, vencimiento: "Vencido hace 2 h" },
  { codigo: "MINSA-2026-003230", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Demora en cita"], prioridad: Prioridad.MEDIA, organismo: HOSPITAL, area: "Consulta externa", responsable: "Sofía Rojas", estado: EstadoCaso.NUEVO, confianzaIa: 58, vencimiento: "Mañana" },
  { codigo: "MINSA-2026-003198", categoria: CategoriaCaso.QUEJA, etiquetas: ["Trato del personal"], prioridad: Prioridad.ALTA, organismo: DIRIS, area: "Atención al ciudadano", responsable: "Marco Quispe", estado: EstadoCaso.EN_ATENCION, confianzaIa: 88, vencimiento: "Hoy, 17:00" },
  { codigo: "MINSA-2026-003177", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Falta de medicamento", "Farmacia"], prioridad: Prioridad.MEDIA, organismo: HOSPITAL, area: "Farmacia", responsable: "Sofía Rojas", estado: EstadoCaso.DERIVADO, confianzaIa: 79, vencimiento: "Mañana" },
  { codigo: "MINSA-2026-003152", categoria: CategoriaCaso.CORRUPCION, etiquetas: ["Pago no autorizado"], prioridad: Prioridad.ALTA, organismo: DIRIS, area: "Integridad", responsable: "Jorge Salas", estado: EstadoCaso.EN_ATENCION, confianzaIa: 95, vencimiento: "Mañana" },
  { codigo: "MINSA-2026-003120", categoria: CategoriaCaso.QUEJA, etiquetas: ["Limpieza"], prioridad: Prioridad.BAJA, organismo: HOSPITAL, area: "Servicios generales", responsable: "Marco Quispe", estado: EstadoCaso.NUEVO, confianzaIa: 71, vencimiento: "En 3 días" },
  { codigo: "MINSA-2026-003098", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Resultado de examen"], prioridad: Prioridad.MEDIA, organismo: DIRIS, area: "Laboratorio", responsable: "Elena Torres", estado: EstadoCaso.EN_ATENCION, confianzaIa: 83, vencimiento: "En 2 días" },
  { codigo: "MINSA-2026-003075", categoria: CategoriaCaso.QUEJA, etiquetas: ["Horario de atención"], prioridad: Prioridad.BAJA, organismo: DIRIS, area: "Atención al ciudadano", responsable: "Lucía Paredes", estado: EstadoCaso.CERRADO, confianzaIa: 90, vencimiento: "Cerrado" },
  { codigo: "MINSA-2026-003051", categoria: CategoriaCaso.CORRUPCION, etiquetas: ["Solicitud de dádiva"], prioridad: Prioridad.ALTA, organismo: HOSPITAL, area: "Integridad", responsable: "Jorge Salas", estado: EstadoCaso.DERIVADO, confianzaIa: 97, vencimiento: "En 2 días" },
  { codigo: "MINSA-2026-003033", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Cobro indebido"], prioridad: Prioridad.ALTA, organismo: HOSPITAL, area: "Admisión", responsable: "Elena Torres", estado: EstadoCaso.VENCIDO, confianzaIa: 64, vencimiento: "Vencido hace 1 día" },
  { codigo: "MINSA-2026-003012", categoria: CategoriaCaso.QUEJA, etiquetas: ["Trato del personal", "Emergencia"], prioridad: Prioridad.MEDIA, organismo: HOSPITAL, area: "Emergencia", responsable: "Marco Quispe", estado: EstadoCaso.EN_ATENCION, confianzaIa: 52, vencimiento: "Hoy, 19:00" },
  { codigo: "MINSA-2026-002988", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Historia clínica"], prioridad: Prioridad.BAJA, organismo: DIRIS, area: "Archivo", responsable: "Sofía Rojas", estado: EstadoCaso.CERRADO, confianzaIa: 86, vencimiento: "Cerrado" },
  { codigo: "MINSA-2026-002960", categoria: CategoriaCaso.CORRUPCION, etiquetas: ["Favoritismo en citas"], prioridad: Prioridad.MEDIA, organismo: DIRIS, area: "Integridad", responsable: "Jorge Salas", estado: EstadoCaso.NUEVO, confianzaIa: 74, vencimiento: "En 4 días" },
  { codigo: "MINSA-2026-002941", categoria: CategoriaCaso.QUEJA, etiquetas: ["Infraestructura"], prioridad: Prioridad.BAJA, organismo: HOSPITAL, area: "Servicios generales", responsable: "Elena Torres", estado: EstadoCaso.DERIVADO, confianzaIa: 69, vencimiento: "En 5 días" },
];
