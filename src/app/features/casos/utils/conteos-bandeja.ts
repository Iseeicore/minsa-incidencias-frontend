import { ESTADO_DE_BANDEJA } from "@/features/casos/constants/casos-constants";
import type { BandejaOpcion } from "@/features/casos/constants/casos-constants";
import type { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import type { Conteo, Conteos } from "@/features/casos/types/conteos.types";
import { textoConteo } from "@/shared/utils/texto-conteo";

/** Cantidad de una pestaña: su estado, o el total sin filtrar por estado en `Todos`. */
export function conteoDeBandeja(conteos: Conteos, bandeja: BandejaTab): Conteo {
  const estado = ESTADO_DE_BANDEJA[bandeja];
  return estado ? conteos.porEstado[estado] : conteos.todos;
}

/** Sin conteos (aún no llegan o fallaron) las pestañas quedan sin número. */
export function bandejasConConteo(bandejas: readonly BandejaOpcion[], conteos: Conteos | null): readonly BandejaOpcion[] {
  if (conteos === null) return bandejas;
  return bandejas.map((bandeja) => {
    const { cantidad, conMas } = conteoDeBandeja(conteos, bandeja.value);
    return { ...bandeja, cantidad, conMas };
  });
}

export function textoTotal(total: Conteo | null): string | null {
  return total === null ? null : textoConteo(total.cantidad, total.conMas);
}

/** Lo que sigue al número de casos mostrados: « de Y casos», o solo «casos» si el conteo no está disponible. */
export function sufijoMostrando(mostrados: number, total: Conteo | null): string {
  if (total === null) return mostrados === 1 ? " caso" : " casos";
  const unico = total.cantidad === 1 && !total.conMas;
  return ` de ${textoConteo(total.cantidad, total.conMas)} ${unico ? "caso" : "casos"}`;
}
