import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import { duracionCorta, textoPlazo } from "./texto-plazo";

const SIN_PLAZO = { tipo: null, estado: null, venceEn: null, horasRestantes: null };

describe("duracionCorta", () => {
  it.each([
    [0, "0 h"],
    [5, "5 h"],
    [23, "23 h"],
    [24, "1 día"],
    [48, "2 días"],
    [60, "3 días"],
  ])("%i horas se dicen «%s»", (horas, esperado) => {
    expect(duracionCorta(horas)).toBe(esperado);
  });
});

describe("textoPlazo", () => {
  it("un caso abierto dice cuánto falta para vencer, según el servidor", () => {
    const caso = crearCaso({ plazo: { tipo: PlazoTipo.ATENCION, estado: PlazoEstado.EN_PLAZO, venceEn: null, horasRestantes: 50 } });
    expect(textoPlazo(caso)).toBe("Vence en 2 días");
  });

  it("un caso por vencer muestra las horas que quedan", () => {
    const caso = crearCaso({ plazo: { tipo: PlazoTipo.ATENCION, estado: PlazoEstado.POR_VENCER, venceEn: null, horasRestantes: 8 } });
    expect(textoPlazo(caso)).toBe("Vence en 8 h");
  });

  it("un caso vencido dice Vencido", () => {
    const caso = crearCaso({ plazo: { tipo: PlazoTipo.ATENCION, estado: PlazoEstado.VENCIDO, venceEn: null, horasRestantes: -3 } });
    expect(textoPlazo(caso)).toBe("Vencido");
  });

  it("un caso resuelto dice en cuánto se archiva", () => {
    const caso = crearCaso({
      estado: EstadoCaso.RESUELTO,
      plazo: { tipo: PlazoTipo.VIGENCIA, estado: PlazoEstado.EN_PLAZO, venceEn: null, horasRestantes: 30 },
    });
    expect(textoPlazo(caso)).toBe("Se archiva en 1 día");
  });

  it("una resolución con la vigencia cumplida no muestra horas negativas", () => {
    const caso = crearCaso({
      estado: EstadoCaso.RESUELTO,
      plazo: { tipo: PlazoTipo.VIGENCIA, estado: PlazoEstado.VENCIDO, venceEn: null, horasRestantes: -4 },
    });
    expect(textoPlazo(caso)).toBe("Se archiva en 0 h");
  });

  it("un caso archivado dice Archivado", () => {
    expect(textoPlazo(crearCaso({ estado: EstadoCaso.ARCHIVADO, plazo: SIN_PLAZO }))).toBe("Archivado");
  });

  it("un caso sin plazo calculado muestra el guion", () => {
    expect(textoPlazo(crearCaso({ plazo: SIN_PLAZO }))).toBe("—");
  });
});
