import { textoVencimiento } from "./texto-vencimiento";

describe("textoVencimiento", () => {
  it("sin plazo definido lo dice", () => {
    expect(textoVencimiento(null)).toBe("Sin plazo");
  });

  it("antes de un día usa horas", () => {
    expect(textoVencimiento(6)).toBe("En 6 h");
    expect(textoVencimiento(0)).toBe("En 0 h");
  });

  it("desde un día usa días, con singular", () => {
    expect(textoVencimiento(24)).toBe("En 1 día");
    expect(textoVencimiento(72)).toBe("En 3 días");
  });

  it("lo vencido usa horas o días según cuánto pasó", () => {
    expect(textoVencimiento(-2)).toBe("Vencido hace 2 h");
    expect(textoVencimiento(-26)).toBe("Vencido hace 1 día");
    expect(textoVencimiento(-72)).toBe("Vencido hace 3 días");
  });
});
