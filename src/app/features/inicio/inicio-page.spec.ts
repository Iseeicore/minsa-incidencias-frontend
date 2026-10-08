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

  it("la tabla y las alertas están en regiones desplazables con nombre", async () => {
    const { element } = await setup();
    const nombres = Array.from(element.querySelectorAll("app-scroll-area[role='region']")).map((region) =>
      region.getAttribute("aria-label"),
    );
    expect(nombres).toEqual(
      expect.arrayContaining(["Casos que requieren atención", "Alertas"]),
    );
    expect(element.querySelector("app-bar-chart app-scroll-area")).not.toBeNull();
  });

  it("la distribución por categoría y las derivaciones se dibujan como barras horizontales", async () => {
    const { element } = await setup();
    const listas = Array.from(element.querySelectorAll("app-hbar-list")).map((lista) =>
      lista.querySelector("ul")?.getAttribute("aria-label"),
    );
    expect(listas).toEqual(["Casos por categoría", "Derivaciones por estado"]);
    expect(element.querySelectorAll("app-hbar-list [role='meter']")).toHaveLength(8);
  });

  it("las pestañas de periodo se desplazan en lugar de romper el diseño", async () => {
    const { element } = await setup();
    const tabs = element.querySelector("app-tabs") as HTMLElement;
    expect(tabs.className).toContain("overflow-x-auto");
    expect(tabs.className).toContain("max-w-full");
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
