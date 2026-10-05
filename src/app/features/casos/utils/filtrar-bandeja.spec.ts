import { CASOS_DEMO } from "@/features/casos/data/casos.demo";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { filtrarBandeja, HORAS_PROXIMO_A_VENCER } from "./filtrar-bandeja";

const codigos = (tab: BandejaTab) => filtrarBandeja(CASOS_DEMO, tab).map((caso) => caso.codigo);

describe("filtrarBandeja", () => {
  it("Asignados a mí deja solo lo asignado a la persona", () => {
    const resultado = filtrarBandeja(CASOS_DEMO, BandejaTab.ASIGNADOS);
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every((caso) => caso.asignadoAMi)).toBe(true);
  });

  it("Pendientes son los registrados y los clasificados", () => {
    const resultado = filtrarBandeja(CASOS_DEMO, BandejaTab.PENDIENTES);
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every((caso) => [EstadoCaso.REGISTRADO, EstadoCaso.CLASIFICADO].includes(caso.estado as never))).toBe(true);
  });

  it("Próximos a vencer son los abiertos que vencen dentro del plazo de aviso", () => {
    const resultado = filtrarBandeja(CASOS_DEMO, BandejaTab.PROXIMOS);
    expect(resultado.length).toBeGreaterThan(0);
    for (const caso of resultado) {
      expect(caso.horasParaVencer).toBeGreaterThanOrEqual(0);
      expect(caso.horasParaVencer).toBeLessThanOrEqual(HORAS_PROXIMO_A_VENCER);
      expect([EstadoCaso.RESUELTO, EstadoCaso.ARCHIVADO]).not.toContain(caso.estado);
    }
  });

  it("Vencidos son los abiertos con las horas en negativo", () => {
    const resultado = filtrarBandeja(CASOS_DEMO, BandejaTab.VENCIDOS);
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every((caso) => (caso.horasParaVencer ?? 0) < 0)).toBe(true);
  });

  it("un caso sin plazo nunca está próximo ni vencido", () => {
    const sinPlazo = CASOS_DEMO.filter((caso) => caso.horasParaVencer === null).map((caso) => caso.codigo);
    expect(sinPlazo.length).toBeGreaterThan(0);
    for (const codigo of sinPlazo) {
      expect(codigos(BandejaTab.PROXIMOS)).not.toContain(codigo);
      expect(codigos(BandejaTab.VENCIDOS)).not.toContain(codigo);
    }
  });

  it("un caso resuelto o archivado no aparece como próximo ni vencido aunque tenga horas", () => {
    const abierto = { ...CASOS_DEMO[0], estado: EstadoCaso.RESUELTO, horasParaVencer: -5 };
    expect(filtrarBandeja([abierto], BandejaTab.VENCIDOS)).toEqual([]);
    expect(filtrarBandeja([{ ...abierto, horasParaVencer: 5 }], BandejaTab.PROXIMOS)).toEqual([]);
  });

  it("En revisión IA son los clasificados que ninguna persona ha revisado", () => {
    const resultado = filtrarBandeja(CASOS_DEMO, BandejaTab.REVISION_IA);
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every((caso) => caso.estado === EstadoCaso.CLASIFICADO && !caso.revisadoPorHumano)).toBe(true);
  });

  it("Devueltos son los marcados como devueltos", () => {
    const resultado = filtrarBandeja(CASOS_DEMO, BandejaTab.DEVUELTOS);
    expect(resultado.length).toBeGreaterThan(0);
    expect(resultado.every((caso) => caso.devuelto)).toBe(true);
  });
});
