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

/** Qué casos ve cada rol (gestion.rol_categoria): la corrupción solo la ven el administrador y su área. */
export function visiblePara(caso: Caso, rol: RolDemo): boolean {
  if (rol === RolDemo.ADMINISTRADOR) return true;
  if (rol === RolDemo.GESTOR) return CATEGORIAS_DEL_GESTOR.includes(caso.categoria);
  return caso.categoria !== null && caso.categoria === CATEGORIA_DE_AREA[rol];
}

/** El gestor revisa la categoría una sola vez y, ya revisada, deriva al área si la categoría tiene una. */
function accionesDelGestor(caso: Caso): AccionCaso[] {
  if (caso.estado !== EstadoCaso.CLASIFICADO) return [];
  if (!caso.revisadoPorHumano) return [AccionCaso.CONFIRMAR, AccionCaso.CORREGIR];
  return tieneArea(caso.categoria) ? [AccionCaso.DERIVAR] : [];
}

/**
 * Las áreas atienden lo derivado. El área de corrupción además revisa sus propios casos y los toma directo desde
 * CLASIFICADO, sin derivar, porque la base permite pasar de CLASIFICADO a EN_GESTION.
 */
function accionesDelArea(caso: Caso, rol: RolDemo): AccionCaso[] {
  if (caso.estado === EstadoCaso.CLASIFICADO && rol === RolDemo.AREA_DENUNCIA_CORRUPCION) {
    return caso.revisadoPorHumano ? [AccionCaso.TOMAR] : [AccionCaso.CONFIRMAR, AccionCaso.CORREGIR];
  }
  if (caso.estado === EstadoCaso.DERIVADO) return [AccionCaso.TOMAR, AccionCaso.RESOLVER];
  if (caso.estado === EstadoCaso.EN_GESTION) return [AccionCaso.RESOLVER];
  return [];
}

/**
 * Acciones que la persona puede hacer sobre el caso. En producción las calcula el backend y las manda junto al
 * caso, porque los roles nunca viajan al navegador; aquí se reproduce la misma regla para la demostración.
 */
export function accionesPermitidas(caso: Caso, rol: RolDemo): AccionCaso[] {
  if (!visiblePara(caso, rol)) return [];
  if (rol === RolDemo.ADMINISTRADOR) return [];
  if (rol === RolDemo.GESTOR) return accionesDelGestor(caso);
  return accionesDelArea(caso, rol);
}
