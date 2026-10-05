import { CATEGORIA_DE_AREA } from "@/features/casos/constants/casos-constants";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { RolDemo } from "@/features/casos/enums/rol-demo.enum";
import type { Caso } from "@/features/casos/types/caso.types";
import { tieneArea } from "@/features/casos/utils/area-de-categoria";

const CATEGORIAS_DEL_GESTOR: readonly (CategoriaCaso | null)[] = [
  CategoriaCaso.QUEJA,
  CategoriaCaso.RECLAMO,
  CategoriaCaso.OTRO,
  null,
];

/** Qué casos ve cada rol (gestion.rol_categoria): la corrupción solo la ven el administrador, el revisor y su área. */
export function visiblePara(caso: Caso, rol: RolDemo): boolean {
  if (rol === RolDemo.ADMINISTRADOR || rol === RolDemo.REVISOR) return true;
  if (rol === RolDemo.GESTOR) return CATEGORIAS_DEL_GESTOR.includes(caso.categoria);
  return caso.categoria !== null && caso.categoria === CATEGORIA_DE_AREA[rol];
}

/**
 * Acciones que la persona puede hacer sobre el caso. En producción las calcula el backend y las manda junto al
 * caso, porque los roles nunca viajan al navegador; aquí se reproduce la misma regla para la demostración.
 */
export function accionesPermitidas(caso: Caso, rol: RolDemo): AccionCaso[] {
  if (!visiblePara(caso, rol)) return [];

  if (rol === RolDemo.REVISOR) {
    return caso.estado === EstadoCaso.CLASIFICADO && !caso.revisadoPorHumano
      ? [AccionCaso.CONFIRMAR, AccionCaso.CORREGIR]
      : [];
  }

  if (rol === RolDemo.GESTOR) {
    return caso.estado === EstadoCaso.CLASIFICADO && caso.revisadoPorHumano && tieneArea(caso.categoria)
      ? [AccionCaso.DERIVAR]
      : [];
  }

  if (rol === RolDemo.ADMINISTRADOR) return [];

  if (caso.estado === EstadoCaso.DERIVADO) return [AccionCaso.TOMAR, AccionCaso.RESOLVER];
  if (caso.estado === EstadoCaso.EN_GESTION) return [AccionCaso.RESOLVER];
  return [];
}
