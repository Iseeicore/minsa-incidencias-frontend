import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import type { Caso, CasoDetalle } from "@/features/casos/types/caso.types";
import type { CasoDetalleDto, CasoResumenDto } from "@/features/casos/types/incidencias-api.types";

export function crearCaso(parcial: Partial<Caso> = {}): Caso {
  return {
    codigo: "MINSA-2026-000001",
    categoria: CategoriaCaso.RECLAMO,
    categoriaIa: CategoriaCaso.RECLAMO,
    confianzaIa: 80,
    etiquetas: [],
    prioridad: null,
    organismo: null,
    area: "Área de reclamos",
    responsable: null,
    estado: EstadoCaso.CLASIFICADO,
    horasDesdeLlegada: 10,
    horasDesdeResolucion: null,
    revisadoPorHumano: false,
    corregida: false,
    plazo: { tipo: PlazoTipo.ATENCION, estado: PlazoEstado.EN_PLAZO, venceEn: "2026-10-08T10:00:00.000Z", horasRestantes: 62 },
    acciones: [],
    ...parcial,
  };
}

export function crearDetalle(parcial: Partial<CasoDetalle> = {}): CasoDetalle {
  return {
    ...crearCaso(),
    resolucion: null,
    descripcion: "Texto de prueba",
    reclamante: "Anónimo",
    evidencias: [],
    historial: [],
    ...parcial,
  };
}

export function crearResumenDto(parcial: Partial<CasoResumenDto> = {}): CasoResumenDto {
  return {
    codigo: "MINSA-2026-000001",
    categoria: "reclamo",
    categoriaIa: "reclamo",
    confianzaIa: 80,
    etiquetas: [],
    prioridad: null,
    organismo: null,
    area: "Área de reclamos",
    responsable: null,
    estado: "clasificado",
    horasDesdeLlegada: 10,
    horasDesdeResolucion: null,
    revisadoPorHumano: false,
    corregida: false,
    plazo: { tipo: "atencion", estado: "en-plazo", venceEn: "2026-10-08T10:00:00.000Z", horasRestantes: 62 },
    acciones: [],
    ...parcial,
  };
}

export function crearDetalleDto(parcial: Partial<CasoDetalleDto> = {}): CasoDetalleDto {
  return {
    ...crearResumenDto(),
    resolucion: null,
    descripcion: "Texto de prueba",
    reclamante: "Anónimo",
    evidencias: [],
    historial: [],
    ...parcial,
  };
}
