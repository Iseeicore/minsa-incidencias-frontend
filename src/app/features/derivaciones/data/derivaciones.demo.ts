import { EstadoDerivacion } from "@/features/derivaciones/enums/estado-derivacion.enum";
import type { Derivacion } from "@/features/derivaciones/types/derivacion.types";

const GESTOR = "Gestor";
const AREA_RECLAMO = "Área de reclamos";
const AREA_QUEJA = "Área de quejas";
const AREA_CORRUPCION = "Área de denuncias por corrupción";
const CLASIFICADOR = "clasificador v0.3";

export const DERIVACIONES_DEMO: readonly Derivacion[] = [
  {
    id: "d-003177",
    codigoCaso: "MINSA-2026-003177",
    origen: GESTOR,
    destino: AREA_RECLAMO,
    regla: "Reclamo → Área de reclamos",
    usuario: "Elena Torres",
    fecha: "4 oct 2026, 09:42",
    estado: EstadoDerivacion.REALIZADA,
    pasos: [
      { titulo: "La IA clasificó el caso", detalle: `Reclamo con 79 % de confianza (${CLASIFICADOR}).`, hora: "09:12" },
      { titulo: "Motor de competencia", detalle: "Aplicó la regla: Reclamo → Área de reclamos.", hora: "09:41" },
      { titulo: "Área destino", detalle: `${AREA_RECLAMO} · Hospital Nacional.` },
      { titulo: "Derivado por", detalle: "Elena Torres (Gestor).", hora: "09:42" },
      { titulo: "Revisión humana", detalle: "Categoría confirmada por Sofía Rojas, sin cambios.", hora: "09:30" },
    ],
  },
  {
    id: "d-003051",
    codigoCaso: "MINSA-2026-003051",
    origen: GESTOR,
    destino: AREA_CORRUPCION,
    regla: "Denuncia por corrupción → Área de denuncias por corrupción",
    usuario: "Elena Torres",
    fecha: "4 oct 2026, 08:50",
    estado: EstadoDerivacion.REALIZADA,
    pasos: [
      { titulo: "La IA clasificó el caso", detalle: `Denuncia por corrupción con 97 % de confianza (${CLASIFICADOR}).`, hora: "08:20" },
      { titulo: "Motor de competencia", detalle: "Aplicó la regla: Denuncia por corrupción → Área de denuncias por corrupción.", hora: "08:49" },
      { titulo: "Área destino", detalle: `${AREA_CORRUPCION} · Hospital Nacional.` },
      { titulo: "Derivado por", detalle: "Elena Torres (Gestor).", hora: "08:50" },
      { titulo: "Revisión humana", detalle: "Categoría confirmada por Sofía Rojas. Es sensible: siempre pasa por revisión.", hora: "08:41" },
    ],
  },
  {
    id: "d-002941",
    codigoCaso: "MINSA-2026-002941",
    origen: GESTOR,
    destino: AREA_QUEJA,
    regla: "Queja → Área de quejas",
    usuario: "Marco Quispe",
    fecha: "3 oct 2026, 17:05",
    estado: EstadoDerivacion.REALIZADA,
    pasos: [
      { titulo: "La IA clasificó el caso", detalle: `Queja con 69 % de confianza (${CLASIFICADOR}).`, hora: "16:30" },
      { titulo: "Motor de competencia", detalle: "Aplicó la regla: Queja → Área de quejas.", hora: "17:04" },
      { titulo: "Área destino", detalle: `${AREA_QUEJA} · Hospital Nacional.` },
      { titulo: "Derivado por", detalle: "Marco Quispe (Gestor).", hora: "17:05" },
      { titulo: "Revisión humana", detalle: "Categoría confirmada por Sofía Rojas, sin cambios.", hora: "16:55" },
    ],
  },
  {
    id: "d-002915",
    codigoCaso: "MINSA-2026-002915",
    origen: GESTOR,
    destino: `${AREA_RECLAMO} (propuesta)`,
    regla: "Reclamo → Área de reclamos",
    usuario: "Sin derivar",
    fecha: "—",
    estado: EstadoDerivacion.PENDIENTE,
    pasos: [
      { titulo: "La IA clasificó el caso", detalle: `Reclamo con 77 % de confianza (${CLASIFICADOR}).`, hora: "10:02" },
      { titulo: "Motor de competencia", detalle: "Propone: Reclamo → Área de reclamos.", hora: "10:20" },
      { titulo: "Área destino", detalle: "Falta que el gestor derive el caso.", pendiente: true },
      { titulo: "Derivado por", detalle: "Aún nadie.", pendiente: true },
      { titulo: "Revisión humana", detalle: "Categoría confirmada por Sofía Rojas, sin cambios.", hora: "10:20" },
    ],
  },
  {
    id: "d-003098",
    codigoCaso: "MINSA-2026-003098",
    origen: AREA_QUEJA,
    destino: AREA_RECLAMO,
    regla: "Reasignación manual del gestor",
    usuario: "Elena Torres",
    fecha: "3 oct 2026, 16:20",
    estado: EstadoDerivacion.REASIGNADA,
    pasos: [
      { titulo: "La IA clasificó el caso", detalle: `Queja con 61 % de confianza (${CLASIFICADOR}).`, hora: "14:10" },
      { titulo: "Motor de competencia", detalle: "Aplicó la regla: Queja → Área de quejas.", hora: "14:40" },
      { titulo: "Área destino", detalle: `Reasignado a ${AREA_RECLAMO}.` },
      { titulo: "Reasignado por", detalle: "Elena Torres (Gestor).", hora: "16:20" },
      { titulo: "Corrección humana", detalle: "Categoría corregida de Queja a Reclamo por Sofía Rojas.", hora: "16:15" },
    ],
  },
  {
    id: "d-002930",
    codigoCaso: "MINSA-2026-002930",
    origen: GESTOR,
    destino: "Sin área competente",
    regla: "La categoría Otro no tiene área asignada",
    usuario: "Elena Torres",
    fecha: "4 oct 2026, 08:15",
    estado: EstadoDerivacion.FUERA_COMPETENCIA,
    pasos: [
      { titulo: "La IA clasificó el caso", detalle: `Otro con 41 % de confianza (${CLASIFICADOR}). La confianza baja pide decisión humana.`, hora: "07:58" },
      { titulo: "Motor de competencia", detalle: "Ninguna área atiende la categoría Otro.", hora: "08:14" },
      { titulo: "Área destino", detalle: "Fuera de competencia: no hay área a la que derivar.", pendiente: true },
      { titulo: "Marcado por", detalle: "Elena Torres (Gestor).", hora: "08:15" },
      { titulo: "Revisión humana", detalle: "Aún sin revisar.", pendiente: true },
    ],
  },
];
