import { indiceDeTecla } from "./indice-de-tecla";

describe("indiceDeTecla", () => {
  it("avanza y retrocede de forma circular", () => {
    expect(indiceDeTecla("ArrowRight", 0, 3)).toBe(1);
    expect(indiceDeTecla("ArrowRight", 2, 3)).toBe(0);
    expect(indiceDeTecla("ArrowLeft", 0, 3)).toBe(2);
    expect(indiceDeTecla("ArrowLeft", 2, 3)).toBe(1);
  });

  it("Inicio y Fin van a los extremos", () => {
    expect(indiceDeTecla("Home", 2, 3)).toBe(0);
    expect(indiceDeTecla("End", 0, 3)).toBe(2);
  });

  it("ignora otras teclas y las listas vacías", () => {
    expect(indiceDeTecla("Enter", 0, 3)).toBeNull();
    expect(indiceDeTecla("ArrowRight", 0, 0)).toBeNull();
  });
});
