import { niceScale } from "./nice-scale";

describe("niceScale", () => {
  it("redondea el máximo hacia arriba a un paso redondo", () => {
    expect(niceScale(61).max).toBe(80);
    expect(niceScale(1248).max).toBe(2000);
  });

  it("devuelve cinco marcas de mayor a menor que terminan en cero", () => {
    expect(niceScale(61).ticks).toEqual([80, 60, 40, 20, 0]);
  });

  it("el máximo nunca queda por debajo del valor", () => {
    for (const valor of [1, 7, 19, 33, 99, 305, 890, 1010, 4999]) {
      expect(niceScale(valor).max).toBeGreaterThanOrEqual(valor);
    }
  });

  it("con cero o un valor inválido devuelve una escala base", () => {
    expect(niceScale(0).ticks).toEqual([4, 3, 2, 1, 0]);
    expect(niceScale(Number.NaN).max).toBe(4);
  });
});
