import { textoConteo } from "./texto-conteo";

describe("textoConteo", () => {
  it("muestra la cantidad tal cual", () => {
    expect(textoConteo(0)).toBe("0");
    expect(textoConteo(12, false)).toBe("12");
  });

  it("agrega + cuando hay más de los que se cuentan", () => {
    expect(textoConteo(1000, true)).toBe("1000+");
  });
});
