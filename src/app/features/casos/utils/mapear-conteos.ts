import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { Conteo, Conteos } from "@/features/casos/types/conteos.types";
import type { ConteoDto, ConteosDto } from "@/features/casos/types/incidencias-api.types";

function mapearConteo(dto: ConteoDto | undefined): Conteo {
  if (!dto || typeof dto.cantidad !== "number" || !Number.isFinite(dto.cantidad)) {
    throw new Error("Respuesta de conteos inválida.");
  }
  return { cantidad: dto.cantidad, conMas: dto.conMas === true };
}

/** Una respuesta incompleta se rechaza entera: mostrar ceros inventados engañaría más que no mostrar nada. */
export function mapearConteos(dto: ConteosDto): Conteos {
  const porEstado = Object.fromEntries(
    Object.values(EstadoCaso).map((estado) => [estado, mapearConteo(dto.porEstado?.[estado])]),
  ) as Conteos["porEstado"];
  return { todos: mapearConteo(dto.todos), total: mapearConteo(dto.total), porEstado };
}
