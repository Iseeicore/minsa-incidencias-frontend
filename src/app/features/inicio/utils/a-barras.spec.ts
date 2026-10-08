import { categoriasABarras, resumenABarras } from "./a-barras";

describe("a-barras", () => {
  it("las categorías llevan su porcentaje como detalle", () => {
    expect(categoriasABarras([{ label: "Reclamos", casos: 604, porcentaje: 48 }])).toEqual([
      { label: "Reclamos", valor: 604, detalle: "48 %" },
    ]);
  });

  it("un resumen conserva etiqueta y valor, sin detalle", () => {
    expect(resumenABarras([{ label: "Reasignadas", valor: 0 }])).toEqual([{ label: "Reasignadas", valor: 0 }]);
  });

  it("una lista vacía da una lista vacía", () => {
    expect(categoriasABarras([])).toEqual([]);
    expect(resumenABarras([])).toEqual([]);
  });
});
