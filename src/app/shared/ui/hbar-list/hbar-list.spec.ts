import { TestBed } from "@angular/core/testing";
import { HBarList, type HBarDatum } from "./hbar-list";

describe("HBarList", () => {
  async function setup(data: readonly HBarDatum[]) {
    const fixture = TestBed.createComponent(HBarList);
    fixture.componentRef.setInput("data", data);
    fixture.componentRef.setInput("label", "Casos por categoría");
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const barras = (element: HTMLElement) => Array.from(element.querySelectorAll<HTMLElement>("[role='progressbar']"));

  it("mide cada barra contra el valor mayor de la lista", async () => {
    const element = await setup([
      { label: "Reclamos", valor: 200 },
      { label: "Quejas", valor: 100 },
    ]);
    const [reclamos, quejas] = barras(element);
    expect(reclamos.style.width).toBe("100%");
    expect(quejas.style.width).toBe("50%");
  });

  it("muestra el valor y el detalle de cada fila", async () => {
    const element = await setup([{ label: "Reclamos", valor: 604, detalle: "48 %" }]);
    expect(element.textContent).toContain("Reclamos");
    expect(element.textContent).toContain("48 %");
    expect(barras(element)[0].getAttribute("aria-valuenow")).toBe("604");
  });

  it("un valor cero no dibuja barra y un valor pequeño sigue visible", async () => {
    const element = await setup([
      { label: "A", valor: 1000 },
      { label: "B", valor: 5 },
      { label: "C", valor: 0 },
    ]);
    const [, b, c] = barras(element);
    expect(b.style.width).toBe("3%");
    expect(c.style.width).toBe("0%");
  });

  it("sin datos no falla", async () => {
    const element = await setup([]);
    expect(barras(element)).toHaveLength(0);
  });
});
