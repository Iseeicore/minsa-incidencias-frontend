import { PLAZOS_POR_DEFECTO } from "@/core/config/plazos.config";
import { CASOS_DEMO } from "@/features/casos/data/casos.demo";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { RolDemo } from "@/features/casos/enums/rol-demo.enum";
import { aplicarArchivadoAutomatico } from "@/features/casos/utils/plazos-caso";
import { filtrarBandeja } from "./filtrar-bandeja";

const CASOS = aplicarArchivadoAutomatico(CASOS_DEMO, PLAZOS_POR_DEFECTO);
const codigos = (tab: BandejaTab, rol: RolDemo = RolDemo.ADMINISTRADOR) =>
  filtrarBandeja(CASOS, tab, rol, PLAZOS_POR_DEFECTO)
    .map((caso) => caso.codigo)
    .sort();

describe("filtrarBandeja", () => {
  it("En revisión IA son los clasificados que ninguna persona revisó", () => {
    const resultado = filtrarBandeja(CASOS, BandejaTab.REVISION_IA, RolDemo.REVISOR, PLAZOS_POR_DEFECTO);
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every((caso) => caso.estado === EstadoCaso.CLASIFICADO && !caso.revisadoPorHumano)).toBe(true);
  });

  it("Por derivar son los clasificados cuya categoría ya revisó una persona", () => {
    expect(codigos(BandejaTab.POR_DERIVAR)).toEqual(["MINSA-2026-002890", "MINSA-2026-002915"]);
  });

  it("En gestión reúne los derivados y los que el área está atendiendo", () => {
    const resultado = filtrarBandeja(CASOS, BandejaTab.EN_GESTION, RolDemo.ADMINISTRADOR, PLAZOS_POR_DEFECTO);
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every((caso) => [EstadoCaso.DERIVADO, EstadoCaso.EN_GESTION].includes(caso.estado as never))).toBe(true);
  });

  it("Por vencer son los abiertos que están por cumplir los 3 días desde que llegaron", () => {
    expect(codigos(BandejaTab.POR_VENCER)).toEqual(["MINSA-2026-002941", "MINSA-2026-003152", "MINSA-2026-003241"]);
  });

  it("Resueltos son solo las resoluciones vigentes", () => {
    expect(codigos(BandejaTab.RESUELTOS)).toEqual(["MINSA-2026-003075"]);
  });

  it("Archivados incluyen lo que venció y lo resuelto que cumplió su vigencia, no solo lo archivado de origen", () => {
    expect(codigos(BandejaTab.ARCHIVADOS)).toEqual(["MINSA-2026-002850", "MINSA-2026-002988", "MINSA-2026-003033"]);
  });

  it("un caso vencido ya no aparece como abierto en ninguna bandeja de trabajo", () => {
    for (const tab of [BandejaTab.EN_GESTION, BandejaTab.POR_VENCER, BandejaTab.PARA_ACTUAR]) {
      expect(codigos(tab, RolDemo.AREA_RECLAMO)).not.toContain("MINSA-2026-003033");
    }
  });

  describe("Para actuar depende del rol", () => {
    it("el revisor ve lo clasificado sin revisar", () => {
      expect(codigos(BandejaTab.PARA_ACTUAR, RolDemo.REVISOR)).toEqual([
        "MINSA-2026-002930",
        "MINSA-2026-002960",
        "MINSA-2026-003012",
        "MINSA-2026-003230",
      ]);
    });

    it("el gestor ve lo revisado que se puede derivar", () => {
      expect(codigos(BandejaTab.PARA_ACTUAR, RolDemo.GESTOR)).toEqual(["MINSA-2026-002890", "MINSA-2026-002915"]);
    });

    it("el área de reclamos ve sus derivados y en gestión", () => {
      expect(codigos(BandejaTab.PARA_ACTUAR, RolDemo.AREA_RECLAMO)).toEqual([
        "MINSA-2026-003098",
        "MINSA-2026-003177",
        "MINSA-2026-003241",
      ]);
    });

    it("el administrador no tiene casos para actuar", () => {
      expect(codigos(BandejaTab.PARA_ACTUAR, RolDemo.ADMINISTRADOR)).toEqual([]);
    });
  });
});
