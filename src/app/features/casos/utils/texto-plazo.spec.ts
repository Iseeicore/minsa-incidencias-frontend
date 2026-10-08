import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import { crearCaso, crearDetalle } from "@/features/casos/testing/caso-builder";
import { duracionCorta, estaVencido, textoPlazo, textoReapertura } from "./texto-plazo";

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

describe("estaVencido", () => {
  const plazo = (estado: PlazoEstado, horasRestantes: number | null, tipo: PlazoTipo = PlazoTipo.ATENCION) => ({
    tipo,
    estado,
    venceEn: null,
    horasRestantes,
  });

  it("vence cuando el servidor lo dice o las horas son negativas", () => {
    expect(estaVencido(crearCaso({ plazo: plazo(PlazoEstado.VENCIDO, 5) }))).toBe(true);
    expect(estaVencido(crearCaso({ plazo: plazo(PlazoEstado.EN_PLAZO, -1) }))).toBe(true);
  });

  it("en plazo, sin plazo, archivado o con vigencia no se marca vencido", () => {
    expect(estaVencido(crearCaso({ plazo: plazo(PlazoEstado.EN_PLAZO, 10) }))).toBe(false);
    expect(estaVencido(crearCaso({ plazo: SIN_PLAZO }))).toBe(false);
    expect(estaVencido(crearCaso({ estado: EstadoCaso.ARCHIVADO, plazo: plazo(PlazoEstado.VENCIDO, -4) }))).toBe(false);
    expect(estaVencido(crearCaso({ estado: EstadoCaso.RESUELTO, plazo: plazo(PlazoEstado.EN_PLAZO, -2, PlazoTipo.VIGENCIA) }))).toBe(false);
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

describe("textoReapertura", () => {
  it("un caso nunca reabierto no dice nada", () => {
    expect(textoReapertura(crearDetalle())).toBeNull();
  });

  it("un caso reabierto dice cuándo y cuánto le queda del plazo nuevo", () => {
    const caso = crearDetalle({
      reapertura: { reabiertoEn: "2026-10-08T12:00:00.000Z", motivo: "Llegó información nueva" },
      plazo: { tipo: PlazoTipo.ATENCION, estado: PlazoEstado.EN_PLAZO, venceEn: null, horasRestantes: 72 },
    });
    expect(textoReapertura(caso)).toMatch(/^Reabierto el .+; vence en 3 días$/);
  });
});
