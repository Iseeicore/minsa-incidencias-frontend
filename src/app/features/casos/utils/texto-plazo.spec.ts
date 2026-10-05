import { PLAZOS_POR_DEFECTO } from "@/core/config/plazos.config";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import { duracionCorta, textoPlazo } from "./texto-plazo";

describe("duracionCorta", () => {
  it("antes de un día usa horas", () => {
    expect(duracionCorta(6)).toBe("6 h");
    expect(duracionCorta(0)).toBe("0 h");
  });

  it("desde un día usa días, con singular", () => {
    expect(duracionCorta(24)).toBe("1 día");
    expect(duracionCorta(72)).toBe("3 días");
  });
});

describe("textoPlazo", () => {
  const plazos = PLAZOS_POR_DEFECTO;

  it("un caso abierto dice cuánto falta para vencer", () => {
    expect(textoPlazo(crearCaso({ horasDesdeLlegada: 50 }), plazos)).toBe("Vence en 22 h");
    expect(textoPlazo(crearCaso({ horasDesdeLlegada: 20 }), plazos)).toBe("Vence en 2 días");
  });

  it("un caso abierto con el plazo pasado dice que venció", () => {
    expect(textoPlazo(crearCaso({ horasDesdeLlegada: 80 }), plazos)).toBe("Vencido");
  });

  it("un caso resuelto dice cuándo se archiva", () => {
    const resuelto = crearCaso({ estado: EstadoCaso.RESUELTO, horasDesdeResolucion: 60 });
    expect(textoPlazo(resuelto, plazos)).toBe("Se archiva en 12 h");
    expect(textoPlazo({ ...resuelto, horasDesdeResolucion: 20 }, plazos)).toBe("Se archiva en 2 días");
  });

  it("un caso archivado lo dice", () => {
    expect(textoPlazo(crearCaso({ estado: EstadoCaso.ARCHIVADO }), plazos)).toBe("Archivado");
  });
});
