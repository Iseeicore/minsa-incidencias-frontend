import type { Plazos } from "@/core/config/plazos.config";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import type { RolDemo } from "@/features/casos/enums/rol-demo.enum";
import type { Caso } from "@/features/casos/types/caso.types";
import { accionesPermitidas } from "@/features/casos/utils/acciones-caso";
import { estaPorVencer } from "@/features/casos/utils/plazos-caso";

type Regla = (caso: Caso, rol: RolDemo, plazos: Plazos) => boolean;

const COINCIDE_BANDEJA: Record<BandejaTab, Regla> = {
  [BandejaTab.PARA_ACTUAR]: (caso, rol) => accionesPermitidas(caso, rol).length > 0,
  [BandejaTab.REVISION_IA]: (caso) => caso.estado === EstadoCaso.CLASIFICADO && !caso.revisadoPorHumano,
  [BandejaTab.POR_DERIVAR]: (caso) => caso.estado === EstadoCaso.CLASIFICADO && caso.revisadoPorHumano,
  [BandejaTab.EN_GESTION]: (caso) => caso.estado === EstadoCaso.DERIVADO || caso.estado === EstadoCaso.EN_GESTION,
  [BandejaTab.POR_VENCER]: (caso, _rol, plazos) => estaPorVencer(caso, plazos),
  [BandejaTab.RESUELTOS]: (caso) => caso.estado === EstadoCaso.RESUELTO,
  [BandejaTab.ARCHIVADOS]: (caso) => caso.estado === EstadoCaso.ARCHIVADO,
};

export function filtrarBandeja(casos: readonly Caso[], tab: BandejaTab, rol: RolDemo, plazos: Plazos): Caso[] {
  return casos.filter((caso) => COINCIDE_BANDEJA[tab](caso, rol, plazos));
}
