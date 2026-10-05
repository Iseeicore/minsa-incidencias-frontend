import { TestBed } from "@angular/core/testing";
import { BarChart, type BarDatum } from "./bar-chart";

describe("BarChart", () => {
  async function setup(data: readonly BarDatum[]) {
    const fixture = TestBed.createComponent(BarChart);
    fixture.componentRef.setInput("data", data);
    fixture.componentRef.setInput("description", "Casos por día");
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const barras = (element: HTMLElement) => Array.from(element.querySelectorAll<HTMLElement>("[title]"));

  it("escala las alturas respecto del valor máximo y resalta la mayor", async () => {
    const element = await setup([
      { label: "A", value: 50 },
      { label: "B", value: 100 },
    ]);
    const [a, b] = barras(element);
    expect(a.style.height).toBe("50%");
    expect(b.style.height).toBe("100%");
    expect(b.className).toContain("bg-primary-500");
    expect(a.className).not.toContain("bg-primary-500");
  });

  it("con todos los valores en cero no resalta ni dibuja alto", async () => {
    const element = await setup([{ label: "A", value: 0 }]);
    const [a] = barras(element);
    expect(a.style.height).toBe("0%");
    expect(a.className).not.toContain("bg-primary-500");
  });

  it("describe el gráfico para lectores de pantalla", async () => {
    const element = await setup([{ label: "A", value: 1 }]);
    expect(element.querySelector("[role='img']")?.getAttribute("aria-label")).toBe("Casos por día");
  });
});
