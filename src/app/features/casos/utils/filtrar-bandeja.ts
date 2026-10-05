import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { Caso } from "@/features/casos/types/caso.types";

export const HORAS_PROXIMO_A_VENCER = 48;

const ESTADOS_CERRADOS: readonly EstadoCaso[] = [EstadoCaso.RESUELTO, EstadoCaso.ARCHIVADO];
const ESTADOS_PENDIENTES: readonly EstadoCaso[] = [EstadoCaso.REGISTRADO, EstadoCaso.CLASIFICADO];

function estaAbierto(caso: Caso): boolean {
  return !ESTADOS_CERRADOS.includes(caso.estado);
}

const COINCIDE_BANDEJA: Record<BandejaTab, (caso: Caso) => boolean> = {
  [BandejaTab.ASIGNADOS]: (caso) => caso.asignadoAMi,
  [BandejaTab.PENDIENTES]: (caso) => ESTADOS_PENDIENTES.includes(caso.estado),
  [BandejaTab.PROXIMOS]: (caso) =>
    estaAbierto(caso) &&
    caso.horasParaVencer !== null &&
    caso.horasParaVencer >= 0 &&
    caso.horasParaVencer <= HORAS_PROXIMO_A_VENCER,
  [BandejaTab.VENCIDOS]: (caso) => estaAbierto(caso) && caso.horasParaVencer !== null && caso.horasParaVencer < 0,
  [BandejaTab.DEVUELTOS]: (caso) => caso.devuelto,
  [BandejaTab.REVISION_IA]: (caso) => caso.estado === EstadoCaso.CLASIFICADO && !caso.revisadoPorHumano,
};

export function filtrarBandeja(casos: readonly Caso[], tab: BandejaTab): Caso[] {
  return casos.filter(COINCIDE_BANDEJA[tab]);
}
