import type { AreaOpcion } from "@/features/casos/types/area.types";
import type { EstablecimientoQr } from "@/features/qr/types/establecimiento-qr.types";

/** Solo las áreas que son un establecimiento (con código RENIPRESS) tienen QR; las demás se descartan. */
export function aEstablecimientoQr(area: AreaOpcion): EstablecimientoQr | null {
  const datos = area.establecimiento;
  if (datos === null) return null;
  return {
    id: area.id,
    nombre: area.nombre,
    codigoRenipress: datos.codigoRenipress,
    nivelAtencion: datos.nivelAtencion,
    categoria: datos.categoria,
  };
}

export function aEstablecimientosQr(areas: readonly AreaOpcion[]): readonly EstablecimientoQr[] {
  return areas.flatMap((area) => aEstablecimientoQr(area) ?? []);
}
