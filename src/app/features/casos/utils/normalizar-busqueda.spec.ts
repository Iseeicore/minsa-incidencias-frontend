import { normalizarBusqueda } from "@/features/casos/utils/normalizar-busqueda";

describe("normalizarBusqueda", () => {
  it("deja el código completo como está", () => {
    expect(normalizarBusqueda("MINSA-2026-000017")).toBe("MINSA-2026-000017");
  });

  it("completa con ceros un código pegado sin ellos y lo pasa a mayúsculas", () => {
    expect(normalizarBusqueda("MINSA-2026-17")).toBe("MINSA-2026-000017");
    expect(normalizarBusqueda("minsa-2026-0017")).toBe("MINSA-2026-000017");
  });

  it("quita los espacios de los bordes", () => {
    expect(normalizarBusqueda("  MINSA-2026-000017  ")).toBe("MINSA-2026-000017");
  });

  it("el número suelto con ceros y el relato se envían tal cual", () => {
    expect(normalizarBusqueda("000017")).toBe("000017");
    expect(normalizarBusqueda("demora en la atención")).toBe("demora en la atención");
  });

  it("un código con más de seis dígitos no se toca", () => {
    expect(normalizarBusqueda("MINSA-2026-1234567")).toBe("MINSA-2026-1234567");
  });
});
