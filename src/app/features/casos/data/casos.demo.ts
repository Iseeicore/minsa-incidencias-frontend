import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { Caso } from "@/features/casos/types/caso.types";
import { Prioridad } from "@/shared/enums/prioridad.enum";

const DIRIS = "DIRIS Lima Norte";
const HOSPITAL = "Hospital Nacional";
const AREA_RECLAMO = "Área de reclamos";
const AREA_QUEJA = "Área de quejas";
const AREA_CORRUPCION = "Área de denuncias por corrupción";
const SIN_AREA = "Sin área";
const SIN_ASIGNAR = "Sin asignar";

export const CASOS_DEMO: readonly Caso[] = [
  { codigo: "MINSA-2026-003241", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Cobro indebido", "Farmacia"], prioridad: Prioridad.ALTA, organismo: DIRIS, area: AREA_RECLAMO, responsable: "Lucía Paredes", estado: EstadoCaso.EN_GESTION, confianzaIa: 92, horasParaVencer: -2, asignadoAMi: true, revisadoPorHumano: true, devuelto: false },
  { codigo: "MINSA-2026-003230", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Demora en cita"], prioridad: Prioridad.MEDIA, organismo: HOSPITAL, area: AREA_RECLAMO, responsable: "Sofía Rojas", estado: EstadoCaso.CLASIFICADO, confianzaIa: 58, horasParaVencer: 20, asignadoAMi: false, revisadoPorHumano: false, devuelto: false },
  { codigo: "MINSA-2026-003198", categoria: CategoriaCaso.QUEJA, etiquetas: ["Trato del personal"], prioridad: Prioridad.ALTA, organismo: DIRIS, area: AREA_QUEJA, responsable: "Marco Quispe", estado: EstadoCaso.EN_GESTION, confianzaIa: 88, horasParaVencer: 8, asignadoAMi: true, revisadoPorHumano: true, devuelto: false },
  { codigo: "MINSA-2026-003177", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Falta de medicamento", "Farmacia"], prioridad: Prioridad.MEDIA, organismo: HOSPITAL, area: AREA_RECLAMO, responsable: "Sofía Rojas", estado: EstadoCaso.DERIVADO, confianzaIa: 79, horasParaVencer: 30, asignadoAMi: false, revisadoPorHumano: true, devuelto: false },
  { codigo: "MINSA-2026-003152", categoria: CategoriaCaso.DENUNCIA_CORRUPCION, etiquetas: ["Pago no autorizado"], prioridad: Prioridad.ALTA, organismo: DIRIS, area: AREA_CORRUPCION, responsable: "Jorge Salas", estado: EstadoCaso.EN_GESTION, confianzaIa: 95, horasParaVencer: 26, asignadoAMi: true, revisadoPorHumano: true, devuelto: false },
  { codigo: "MINSA-2026-003120", categoria: null, etiquetas: [], prioridad: Prioridad.BAJA, organismo: HOSPITAL, area: SIN_AREA, responsable: SIN_ASIGNAR, estado: EstadoCaso.REGISTRADO, confianzaIa: null, horasParaVencer: 72, asignadoAMi: false, revisadoPorHumano: false, devuelto: false },
  { codigo: "MINSA-2026-003098", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Resultado de examen"], prioridad: Prioridad.MEDIA, organismo: DIRIS, area: AREA_RECLAMO, responsable: "Elena Torres", estado: EstadoCaso.EN_GESTION, confianzaIa: 83, horasParaVencer: 40, asignadoAMi: false, revisadoPorHumano: true, devuelto: false },
  { codigo: "MINSA-2026-003075", categoria: CategoriaCaso.QUEJA, etiquetas: ["Horario de atención"], prioridad: Prioridad.BAJA, organismo: DIRIS, area: AREA_QUEJA, responsable: "Lucía Paredes", estado: EstadoCaso.RESUELTO, confianzaIa: 90, horasParaVencer: null, asignadoAMi: true, revisadoPorHumano: true, devuelto: false },
  { codigo: "MINSA-2026-003051", categoria: CategoriaCaso.DENUNCIA_CORRUPCION, etiquetas: ["Solicitud de dádiva"], prioridad: Prioridad.ALTA, organismo: HOSPITAL, area: AREA_CORRUPCION, responsable: "Jorge Salas", estado: EstadoCaso.DERIVADO, confianzaIa: 97, horasParaVencer: 50, asignadoAMi: false, revisadoPorHumano: true, devuelto: false },
  { codigo: "MINSA-2026-003033", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Cobro indebido"], prioridad: Prioridad.ALTA, organismo: HOSPITAL, area: AREA_RECLAMO, responsable: "Elena Torres", estado: EstadoCaso.EN_GESTION, confianzaIa: 64, horasParaVencer: -26, asignadoAMi: true, revisadoPorHumano: true, devuelto: true },
  { codigo: "MINSA-2026-003012", categoria: CategoriaCaso.QUEJA, etiquetas: ["Trato del personal", "Emergencia"], prioridad: Prioridad.MEDIA, organismo: HOSPITAL, area: AREA_QUEJA, responsable: "Marco Quispe", estado: EstadoCaso.CLASIFICADO, confianzaIa: 52, horasParaVencer: 6, asignadoAMi: true, revisadoPorHumano: false, devuelto: false },
  { codigo: "MINSA-2026-002988", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Historia clínica"], prioridad: Prioridad.BAJA, organismo: DIRIS, area: AREA_RECLAMO, responsable: "Sofía Rojas", estado: EstadoCaso.ARCHIVADO, confianzaIa: 86, horasParaVencer: null, asignadoAMi: false, revisadoPorHumano: true, devuelto: false },
  { codigo: "MINSA-2026-002960", categoria: CategoriaCaso.DENUNCIA_CORRUPCION, etiquetas: ["Favoritismo en citas"], prioridad: Prioridad.MEDIA, organismo: DIRIS, area: AREA_CORRUPCION, responsable: "Jorge Salas", estado: EstadoCaso.CLASIFICADO, confianzaIa: 74, horasParaVencer: 90, asignadoAMi: false, revisadoPorHumano: false, devuelto: false },
  { codigo: "MINSA-2026-002941", categoria: CategoriaCaso.QUEJA, etiquetas: ["Infraestructura"], prioridad: Prioridad.BAJA, organismo: HOSPITAL, area: AREA_QUEJA, responsable: "Elena Torres", estado: EstadoCaso.DERIVADO, confianzaIa: 69, horasParaVencer: 120, asignadoAMi: false, revisadoPorHumano: true, devuelto: false },
  { codigo: "MINSA-2026-002930", categoria: CategoriaCaso.OTRO, etiquetas: ["Consulta general"], prioridad: Prioridad.BAJA, organismo: DIRIS, area: SIN_AREA, responsable: SIN_ASIGNAR, estado: EstadoCaso.CLASIFICADO, confianzaIa: 41, horasParaVencer: null, asignadoAMi: false, revisadoPorHumano: false, devuelto: false },
  { codigo: "MINSA-2026-002915", categoria: CategoriaCaso.RECLAMO, etiquetas: ["Demora en cita"], prioridad: Prioridad.MEDIA, organismo: HOSPITAL, area: AREA_RECLAMO, responsable: "Lucía Paredes", estado: EstadoCaso.CLASIFICADO, confianzaIa: 77, horasParaVencer: 15, asignadoAMi: true, revisadoPorHumano: true, devuelto: true },
];
