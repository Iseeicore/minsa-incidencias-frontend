import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import type { Caso } from "@/features/casos/types/caso.types";

export type CasosPorEstado = Partial<Record<EstadoCaso, readonly Caso[]>>;

const ABIERTOS: readonly EstadoCaso[] = [EstadoCaso.CLASIFICADO, EstadoCaso.DERIVADO, EstadoCaso.EN_GESTION];

function deEstados(porEstado: CasosPorEstado, estados: readonly EstadoCaso[]): Caso[] {
  return estados.flatMap((estado) => porEstado[estado] ?? []);
}

const COINCIDE: Record<BandejaTab, (porEstado: CasosPorEstado) => Caso[]> = {
  [BandejaTab.PARA_ACTUAR]: (porEstado) => deEstados(porEstado, ABIERTOS).filter((caso) => caso.acciones.length > 0),
  [BandejaTab.REVISION_IA]: (porEstado) =>
    deEstados(porEstado, [EstadoCaso.CLASIFICADO]).filter((caso) => !caso.revisadoPorHumano),
  [BandejaTab.POR_DERIVAR]: (porEstado) =>
    deEstados(porEstado, [EstadoCaso.CLASIFICADO]).filter((caso) => caso.revisadoPorHumano),
  [BandejaTab.EN_GESTION]: (porEstado) => deEstados(porEstado, [EstadoCaso.DERIVADO, EstadoCaso.EN_GESTION]),
  [BandejaTab.POR_VENCER]: (porEstado) =>
    deEstados(porEstado, ABIERTOS).filter(
      (caso) => caso.plazo.estado === PlazoEstado.POR_VENCER || caso.plazo.estado === PlazoEstado.VENCIDO,
    ),
  [BandejaTab.RESUELTOS]: (porEstado) => deEstados(porEstado, [EstadoCaso.RESUELTO]),
  [BandejaTab.ARCHIVADOS]: (porEstado) => deEstados(porEstado, [EstadoCaso.ARCHIVADO]),
};

/** Reparte en bandejas los casos ya cargados por estado, con las acciones y los plazos que calculó el servidor. */
export function casosDeBandeja(tab: BandejaTab, porEstado: CasosPorEstado): Caso[] {
  return COINCIDE[tab](porEstado);
}

export function contarBandeja(tab: BandejaTab, porEstado: CasosPorEstado): number {
  return casosDeBandeja(tab, porEstado).length;
}
