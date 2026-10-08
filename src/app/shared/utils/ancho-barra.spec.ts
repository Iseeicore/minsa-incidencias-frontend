import { anchoBarra } from "./ancho-barra";

describe("anchoBarra", () => {
  it("mide el valor contra el máximo", () => {
    expect(anchoBarra(100, 200)).toBe(50);
    expect(anchoBarra(200, 200)).toBe(100);
  });

  it("cero, negativo o sin máximo no dibujan barra", () => {
    expect(anchoBarra(0, 200)).toBe(0);
    expect(anchoBarra(-5, 200)).toBe(0);
    expect(anchoBarra(0, 0)).toBe(0);
    expect(anchoBarra(Number.NaN, 10)).toBe(0);
  });

  it("un valor positivo muy pequeño conserva un ancho visible", () => {
    expect(anchoBarra(5, 1000)).toBe(3);
  });

  it("nunca pasa de 100", () => {
    expect(anchoBarra(500, 100)).toBe(100);
  });
});
