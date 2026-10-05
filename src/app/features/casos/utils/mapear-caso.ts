import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import { TipoEvidencia } from "@/features/casos/enums/tipo-evidencia.enum";
import { RespuestaInvalidaError } from "@/features/casos/services/incidencia-error";
import type { Caso, CasoDetalle, EvidenciaCaso, PlazoCaso } from "@/features/casos/types/caso.types";
import type {
  CasoDetalleDto,
  CasoResumenDto,
  EvidenciaDto,
  PlazoDto,
} from "@/features/casos/types/incidencias-api.types";
import { Prioridad } from "@/shared/enums/prioridad.enum";
import type { TimelineItem } from "@/shared/ui/timeline/timeline";

function valorDe<T extends string>(valores: Readonly<Record<string, T>>, valor: string, campo: string): T {
  const encontrado = Object.values(valores).find((candidato) => candidato === valor);
  if (encontrado === undefined) throw new RespuestaInvalidaError(campo);
  return encontrado;
}

function opcional<T extends string>(valores: Readonly<Record<string, T>>, valor: string | null, campo: string): T | null {
  return valor === null ? null : valorDe(valores, valor, campo);
}

function mapearPlazo(dto: PlazoDto): PlazoCaso {
  return {
    tipo: opcional(PlazoTipo, dto.tipo, "plazo.tipo"),
    estado: opcional(PlazoEstado, dto.estado, "plazo.estado"),
    venceEn: dto.venceEn,
    horasRestantes: dto.horasRestantes,
  };
}

function mapearAcciones(acciones: readonly string[]): AccionCaso[] {
  const conocidas = Object.values(AccionCaso) as string[];
  return acciones.filter((accion): accion is AccionCaso => conocidas.includes(accion));
}

function mapearEvidencia(dto: EvidenciaDto): EvidenciaCaso {
  const conocidos = Object.values(TipoEvidencia) as string[];
  const tipo = conocidos.includes(dto.tipo) ? (dto.tipo as TipoEvidencia) : TipoEvidencia.DOCUMENTO;
  return { nombre: dto.nombre, tipo, fecha: dto.fecha, sensible: dto.sensible, verificada: dto.verificada };
}

export function mapearResumen(dto: CasoResumenDto): Caso {
  return {
    codigo: dto.codigo,
    categoria: opcional(CategoriaCaso, dto.categoria, "categoria"),
    categoriaIa: opcional(CategoriaCaso, dto.categoriaIa, "categoriaIa"),
    confianzaIa: dto.confianzaIa,
    etiquetas: dto.etiquetas,
    prioridad: opcional(Prioridad, dto.prioridad, "prioridad"),
    organismo: dto.organismo,
    area: dto.area,
    responsable: dto.responsable,
    estado: valorDe(EstadoCaso, dto.estado, "estado"),
    horasDesdeLlegada: dto.horasDesdeLlegada,
    horasDesdeResolucion: dto.horasDesdeResolucion,
    revisadoPorHumano: dto.revisadoPorHumano,
    corregida: dto.corregida,
    plazo: mapearPlazo(dto.plazo),
    acciones: mapearAcciones(dto.acciones),
  };
}

export function mapearDetalle(dto: CasoDetalleDto): CasoDetalle {
  const historial: TimelineItem[] = dto.historial.map((item) => ({
    titulo: item.titulo,
    detalle: item.detalle,
    hora: item.hora,
  }));
  return {
    ...mapearResumen(dto),
    resolucion: dto.resolucion,
    descripcion: dto.descripcion,
    reclamante: dto.reclamante,
    evidencias: dto.evidencias.map(mapearEvidencia),
    historial,
  };
}
