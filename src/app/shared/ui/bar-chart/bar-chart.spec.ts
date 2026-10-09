import { TestBed } from "@angular/core/testing";
import { BarChart, type BarDatum } from "./bar-chart";

describe("BarChart", () => {
  async function setup(data: readonly BarDatum[]) {
    const fixture = TestBed.createComponent(BarChart);
    fixture.componentRef.setInput("data", data);
    fixture.componentRef.setInput("description", "Casos por día");
    fixture.componentRef.setInput("baseLabel", "Atendidos");
    fixture.componentRef.setInput("extraLabel", "Pendientes");
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const pilas = (element: HTMLElement) => Array.from(element.querySelectorAll<HTMLElement>("[title]"));

  it("escala el alto de cada pila respecto del máximo redondeado del eje", async () => {
    const element = await setup([
      { label: "A", base: 20, extra: 10 },
      { label: "B", base: 40, extra: 20 },
    ]);
    const [a, b] = pilas(element);
    expect(b.style.height).toBe("75%");
    expect(a.style.height).toBe("38%");
  });

  it("reparte cada pila en proporción a sus dos series", async () => {
    const element = await setup([{ label: "A", base: 30, extra: 10 }]);
    const [base, extra] = Array.from(pilas(element)[0].children) as HTMLElement[];
    expect(base.style.flexGrow).toBe("30");
    expect(extra.style.flexGrow).toBe("10");
  });

  it("dibuja las marcas del eje y la leyenda de las dos series", async () => {
    const element = await setup([{ label: "A", base: 30, extra: 30 }]);
    expect(element.textContent).toContain("Atendidos");
    expect(element.textContent).toContain("Pendientes");
    expect(element.textContent).toContain("80");
    expect(element.textContent).toContain("0");
  });

  it("describe el gráfico y cada barra con su valor para lectores de pantalla", async () => {
    const element = await setup([{ label: "A", base: 3, extra: 2 }]);
    expect(element.querySelector("[role='img']")?.getAttribute("aria-label")).toBe("Casos por día");
    expect(pilas(element)[0].getAttribute("title")).toContain("A: 5");
  });

  it("escribe el total sobre cada barra, también cuando es cero", async () => {
    const element = await setup([
      { label: "A", base: 30, extra: 12 },
      { label: "B", base: 0, extra: 0 },
    ]);
    const totales = pilas(element).map((pila) => pila.querySelector("span[aria-hidden='true']")?.textContent?.trim());
    expect(totales).toEqual(["42", "0"]);
  });

  it("sin datos no falla y no dibuja pilas", async () => {
    const element = await setup([]);
    expect(pilas(element)).toHaveLength(0);
  });
});
