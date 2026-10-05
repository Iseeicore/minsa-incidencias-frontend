import { TestBed } from "@angular/core/testing";
import { InicioPage } from "./inicio-page";

describe("InicioPage", () => {
  async function setup() {
    TestBed.configureTestingModule({ imports: [InicioPage] });
    const fixture = TestBed.createComponent(InicioPage);
    await fixture.whenStable();
    return { element: fixture.nativeElement as HTMLElement, fixture };
  }

  it("muestra el título y avisa que los datos son de demostración", async () => {
    const { element } = await setup();
    expect(element.querySelector("h1")?.textContent).toContain("Dashboard");
    expect(element.textContent).toContain("Datos de demostración");
  });

  it("muestra cinco indicadores principales", async () => {
    const { element } = await setup();
    expect(element.querySelectorAll("app-stat-card")).toHaveLength(5);
  });

  it("lista los casos que requieren atención", async () => {
    const { element } = await setup();
    expect(element.querySelectorAll("tbody tr").length).toBeGreaterThan(0);
    expect(element.textContent).toContain("Casos que requieren atención");
  });

  it("cambiar el periodo cambia las barras del gráfico", async () => {
    const { element, fixture } = await setup();
    const contarBarras = () => element.querySelectorAll("app-bar-chart [role='img'] [title]").length;
    expect(contarBarras()).toBe(7);

    const treintaDias = Array.from(element.querySelectorAll<HTMLButtonElement>("[role='tab']")).find((tab) =>
      tab.textContent?.includes("30 días"),
    );
    treintaDias?.click();
    await fixture.whenStable();

    expect(contarBarras()).toBe(4);
  });
});
