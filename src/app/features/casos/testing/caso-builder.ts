import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { Caso } from "@/features/casos/types/caso.types";
import { Prioridad } from "@/shared/enums/prioridad.enum";

export function crearCaso(parcial: Partial<Caso> = {}): Caso {
  return {
    codigo: "MINSA-TEST-0001",
    categoria: CategoriaCaso.RECLAMO,
    categoriaIa: CategoriaCaso.RECLAMO,
    confianzaIa: 80,
    etiquetas: [],
    prioridad: Prioridad.MEDIA,
    organismo: "Organismo de prueba",
    responsable: "Responsable de prueba",
    estado: EstadoCaso.CLASIFICADO,
    horasDesdeLlegada: 10,
    horasDesdeResolucion: null,
    revisadoPorHumano: false,
    corregida: false,
    resolucion: null,
    descripcion: "Texto de prueba",
    reclamante: "Anónimo",
    evidencias: [],
    historial: [],
    ...parcial,
  };
}
