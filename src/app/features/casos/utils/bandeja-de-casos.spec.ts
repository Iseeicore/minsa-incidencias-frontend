import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import type { Caso } from "@/features/casos/types/caso.types";
import { casosDeBandeja, contarBandeja, type CasosPorEstado } from "./bandeja-de-casos";

function plazo(estado: PlazoEstado) {
  return { tipo: PlazoTipo.ATENCION, estado, venceEn: null, horasRestantes: 5 };
}

const revisarIa = crearCaso({ codigo: "A", estado: EstadoCaso.CLASIFICADO, revisadoPorHumano: false, acciones: [AccionCaso.CONFIRMAR] });
const porDerivar = crearCaso({ codigo: "B", estado: EstadoCaso.CLASIFICADO, revisadoPorHumano: true, acciones: [] });
const derivado = crearCaso({ codigo: "C", estado: EstadoCaso.DERIVADO, acciones: [AccionCaso.TOMAR] });
const enGestion = crearCaso({ codigo: "D", estado: EstadoCaso.EN_GESTION, plazo: plazo(PlazoEstado.POR_VENCER), acciones: [] });
const vencido = crearCaso({ codigo: "E", estado: EstadoCaso.DERIVADO, plazo: plazo(PlazoEstado.VENCIDO), acciones: [] });
const resuelto = crearCaso({ codigo: "F", estado: EstadoCaso.RESUELTO });
const archivado = crearCaso({ codigo: "G", estado: EstadoCaso.ARCHIVADO });

const POR_ESTADO: CasosPorEstado = {
  [EstadoCaso.CLASIFICADO]: [revisarIa, porDerivar],
  [EstadoCaso.DERIVADO]: [derivado, vencido],
  [EstadoCaso.EN_GESTION]: [enGestion],
  [EstadoCaso.RESUELTO]: [resuelto],
  [EstadoCaso.ARCHIVADO]: [archivado],
};

const codigos = (casos: readonly Caso[]) => casos.map((caso) => caso.codigo);

describe("casosDeBandeja", () => {
  it("Para actuar son los abiertos donde el servidor permite alguna acción", () => {
    expect(codigos(casosDeBandeja(BandejaTab.PARA_ACTUAR, POR_ESTADO))).toEqual(["A", "C"]);
  });

  it("En revisión IA son los clasificados que ninguna persona revisó", () => {
    expect(codigos(casosDeBandeja(BandejaTab.REVISION_IA, POR_ESTADO))).toEqual(["A"]);
  });

  it("Por derivar son los clasificados ya revisados", () => {
    expect(codigos(casosDeBandeja(BandejaTab.POR_DERIVAR, POR_ESTADO))).toEqual(["B"]);
  });

  it("En gestión reúne los derivados y los que el área atiende", () => {
    expect(codigos(casosDeBandeja(BandejaTab.EN_GESTION, POR_ESTADO))).toEqual(["C", "E", "D"]);
  });

  it("Por vencer incluye los abiertos por vencer y los ya vencidos que siguen abiertos", () => {
    expect(codigos(casosDeBandeja(BandejaTab.POR_VENCER, POR_ESTADO))).toEqual(["E", "D"]);
  });

  it("Resueltos y Archivados salen de su estado", () => {
    expect(codigos(casosDeBandeja(BandejaTab.RESUELTOS, POR_ESTADO))).toEqual(["F"]);
    expect(codigos(casosDeBandeja(BandejaTab.ARCHIVADOS, POR_ESTADO))).toEqual(["G"]);
  });

  it("un estado que no se cargó cuenta como vacío", () => {
    expect(casosDeBandeja(BandejaTab.PARA_ACTUAR, {})).toEqual([]);
    expect(casosDeBandeja(BandejaTab.ARCHIVADOS, {})).toEqual([]);
  });
});

describe("contarBandeja", () => {
  it("cuenta lo mismo que devuelve cada bandeja", () => {
    expect(contarBandeja(BandejaTab.PARA_ACTUAR, POR_ESTADO)).toBe(2);
    expect(contarBandeja(BandejaTab.EN_GESTION, POR_ESTADO)).toBe(3);
    expect(contarBandeja(BandejaTab.POR_VENCER, POR_ESTADO)).toBe(2);
  });
});
