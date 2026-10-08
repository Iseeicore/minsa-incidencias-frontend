import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { MotivoArchivo } from "@/features/casos/enums/motivo-archivo.enum";
import { NivelAtencion } from "@/features/casos/enums/nivel-atencion.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import { ResultadoResolucion } from "@/features/casos/enums/resultado-resolucion.enum";
import { TipoEvidencia } from "@/features/casos/enums/tipo-evidencia.enum";
import { RespuestaInvalidaError } from "@/features/casos/services/incidencia-error";
import type {
  ArchivoCaso,
  AreaCaso,
  Caso,
  CasoDetalle,
  DatosResolucion,
  EstablecimientoCaso,
  EvidenciaCaso,
  PlazoCaso,
  ReaperturaCaso,
} from "@/features/casos/types/caso.types";
import type {
  ArchivoDto,
  AreaDto,
  CasoDetalleDto,
  CasoResumenDto,
  EstablecimientoDto,
  EvidenciaDto,
  PlazoDto,
  ReaperturaDto,
  ResolucionDto,
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

function mapearArea(dto: AreaDto | null): AreaCaso | null {
  return dto === null ? null : { codigo: dto.codigo, nombre: dto.nombre };
}

function mapearEstablecimiento(dto: EstablecimientoDto | null): EstablecimientoCaso | null {
  if (dto === null) return null;
  return {
    codigoRenipress: dto.codigoRenipress,
    nombre: dto.nombre,
    nivelAtencion: opcional(NivelAtencion, dto.nivelAtencion ?? null, "establecimiento.nivelAtencion"),
    categoria: dto.categoria ?? null,
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
    area: mapearArea(dto.area),
    establecimiento: mapearEstablecimiento(dto.establecimiento),
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

function mapearResolucion(dto: ResolucionDto | null): DatosResolucion | null {
  if (dto === null) return null;
  return {
    medidasTomadas: dto.medidasTomadas,
    fundamento: dto.fundamento,
    resultado: valorDe(ResultadoResolucion, dto.resultado, "resolucion.resultado"),
  };
}

function mapearArchivo(dto: ArchivoDto | null): ArchivoCaso | null {
  if (dto === null) return null;
  return { motivo: valorDe(MotivoArchivo, dto.motivo, "archivo.motivo"), detalle: dto.detalle, archivadoEn: dto.archivadoEn };
}

function mapearReapertura(dto: ReaperturaDto | null): ReaperturaCaso | null {
  return dto === null ? null : { reabiertoEn: dto.reabiertoEn, motivo: dto.motivo };
}

export function mapearDetalle(dto: CasoDetalleDto): CasoDetalle {
  const historial: TimelineItem[] = dto.historial.map((item) => ({
    titulo: item.titulo,
    detalle: item.detalle,
    hora: item.hora,
  }));
  return {
    ...mapearResumen(dto),
    resolucion: mapearResolucion(dto.resolucion),
    archivo: mapearArchivo(dto.archivo),
    reapertura: mapearReapertura(dto.reapertura),
    descripcion: dto.descripcion,
    reclamante: dto.reclamante,
    evidencias: dto.evidencias.map(mapearEvidencia),
    historial,
  };
}
