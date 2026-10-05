import { ELIPSIS, paginasVisibles } from "./paginas-visibles";

describe("paginasVisibles", () => {
  it("con pocas páginas las muestra todas", () => {
    expect(paginasVisibles(1, 1)).toEqual([1]);
    expect(paginasVisibles(2, 5)).toEqual([1, 2, 3, 4, 5]);
  });

  it("cerca del inicio colapsa el final con una elipsis", () => {
    expect(paginasVisibles(1, 20)).toEqual([1, 2, 3, 4, 5, ELIPSIS, 20]);
  });

  it("en el medio colapsa los dos lados", () => {
    expect(paginasVisibles(10, 20)).toEqual([1, ELIPSIS, 9, 10, 11, ELIPSIS, 20]);
  });

  it("cerca del final colapsa el inicio", () => {
    expect(paginasVisibles(20, 20)).toEqual([1, ELIPSIS, 16, 17, 18, 19, 20]);
  });

  it("no pone una elipsis donde solo faltaría una página", () => {
    expect(paginasVisibles(4, 8)).toEqual([1, 2, 3, 4, 5, ELIPSIS, 8]);
    expect(paginasVisibles(5, 8)).toEqual([1, ELIPSIS, 4, 5, 6, 7, 8]);
  });

  it("una página fuera de rango se ajusta a los extremos", () => {
    expect(paginasVisibles(0, 3)).toEqual([1, 2, 3]);
    expect(paginasVisibles(99, 3)).toEqual([1, 2, 3]);
  });

  it("sin páginas no devuelve nada", () => {
    expect(paginasVisibles(1, 0)).toEqual([]);
  });
});
