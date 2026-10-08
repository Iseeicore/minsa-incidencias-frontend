import { formatearNumero } from "./formatear-numero";

describe("formatearNumero", () => {
  it("escribe cero y los números pequeños sin separadores", () => {
    expect(formatearNumero(0)).toBe("0");
    expect(formatearNumero(48)).toBe("48");
  });

  it("separa los miles según es-PE", () => {
    expect(formatearNumero(1248)).toMatch(/^1\D248$/);
  });
});
