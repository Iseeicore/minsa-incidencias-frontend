import { CATEGORIA_LABEL } from "@/features/casos/constants/casos-constants";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { Caso } from "@/features/casos/types/caso.types";
import { areaDe, tieneArea } from "@/features/casos/utils/area-de-categoria";
import { duracionCorta } from "@/features/casos/utils/texto-plazo";
import type { TimelineItem } from "@/shared/ui/timeline/timeline";

const YA_DERIVADOS: readonly EstadoCaso[] = [
  EstadoCaso.DERIVADO,
  EstadoCaso.EN_GESTION,
  EstadoCaso.RESUELTO,
  EstadoCaso.ARCHIVADO,
];

/** Arma el historial de un caso de demostración a partir de sus datos, como lo haría la auditoría de la base. */
export function historialInicial(caso: Omit<Caso, "historial">): TimelineItem[] {
  const pasos: TimelineItem[] = [
    {
      titulo: "Recibido por WhatsApp",
      detalle: "Registrado como incidencia.",
      hora: `hace ${duracionCorta(caso.horasDesdeLlegada)}`,
    },
  ];

  if (caso.categoriaIa) {
    pasos.push({
      titulo: "La IA clasificó el caso",
      detalle: `${CATEGORIA_LABEL[caso.categoriaIa]} con ${caso.confianzaIa} % de confianza (clasificador v0.3).`,
    });
  }

  if (caso.revisadoPorHumano) {
    pasos.push(
      caso.corregida && caso.categoriaIa && caso.categoria
        ? {
            titulo: "Categoría corregida",
            detalle: `De ${CATEGORIA_LABEL[caso.categoriaIa]} a ${CATEGORIA_LABEL[caso.categoria]}.`,
          }
        : { titulo: "Categoría confirmada", detalle: "Una persona revisó la propuesta de la IA." },
    );
  }

  if (YA_DERIVADOS.includes(caso.estado) && tieneArea(caso.categoria)) {
    pasos.push({ titulo: "Derivado", detalle: `Al ${areaDe(caso.categoria)}.` });
  }

  if (caso.estado === EstadoCaso.EN_GESTION) {
    pasos.push({ titulo: "En gestión", detalle: "El área está atendiendo el caso." });
  }

  if (caso.resolucion && caso.horasDesdeResolucion !== null) {
    pasos.push({
      titulo: "Resuelto",
      detalle: caso.resolucion,
      hora: `hace ${duracionCorta(caso.horasDesdeResolucion)}`,
    });
  }

  if (caso.estado === EstadoCaso.ARCHIVADO) {
    pasos.push({ titulo: "Archivado", detalle: "Pasó el tiempo de vigencia de la resolución." });
  }

  return pasos;
}
