import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { Conteo, Conteos } from "@/features/casos/types/conteos.types";
import type { ConteosDto } from "@/features/casos/types/incidencias-api.types";

export const conteo = (cantidad: number, conMas = false): Conteo => ({ cantidad, conMas });

export function crearConteos(cambios: Partial<Conteos> = {}): Conteos {
  return {
    todos: conteo(50),
    total: conteo(7),
    porEstado: {
      [EstadoCaso.REGISTRADO]: conteo(0),
      [EstadoCaso.CLASIFICADO]: conteo(12),
      [EstadoCaso.DERIVADO]: conteo(3),
      [EstadoCaso.EN_GESTION]: conteo(5),
      [EstadoCaso.RESUELTO]: conteo(1000, true),
      [EstadoCaso.ARCHIVADO]: conteo(9),
    },
    ...cambios,
  };
}

export function crearConteosDto(): ConteosDto {
  return crearConteos();
}
