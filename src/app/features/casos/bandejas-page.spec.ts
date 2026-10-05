import { TestBed } from "@angular/core/testing";
import { BandejasPage } from "./bandejas-page";

describe("BandejasPage", () => {
  async function setup() {
    TestBed.configureTestingModule({ imports: [BandejasPage] });
    const fixture = TestBed.createComponent(BandejasPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const pestanas = () => Array.from(element.querySelectorAll<HTMLButtonElement>("[role='tab']"));
    const filas = () => element.querySelectorAll("tbody tr").length;
    return { element, fixture, pestanas, filas };
  }

  it("muestra el título y las seis bandejas con su cantidad", async () => {
    const { element, pestanas } = await setup();
    expect(element.querySelector("h1")?.textContent).toContain("Mis bandejas");
    const etiquetas = pestanas().map((tab) => tab.textContent?.trim() ?? "");
    expect(etiquetas).toHaveLength(6);
    expect(etiquetas[0]).toMatch(/^Asignados a mí \(\d+\)$/);
    expect(etiquetas[5]).toMatch(/^En revisión IA \(\d+\)$/);
  });

  it("empieza en Asignados a mí y la cantidad de la pestaña coincide con las filas", async () => {
    const { pestanas, filas } = await setup();
    expect(pestanas()[0].getAttribute("aria-selected")).toBe("true");
    const cantidad = Number(/\((\d+)\)/.exec(pestanas()[0].textContent ?? "")?.[1]);
    expect(filas()).toBe(cantidad);
  });

  it("cambiar de bandeja cambia el listado y el título", async () => {
    const { element, fixture, pestanas, filas } = await setup();
    const vencidos = pestanas().find((tab) => tab.textContent?.includes("Vencidos")) as HTMLButtonElement;
    const cantidad = Number(/\((\d+)\)/.exec(vencidos.textContent ?? "")?.[1]);
    vencidos.click();
    await fixture.whenStable();
    expect(filas()).toBe(cantidad);
    expect(element.querySelector("app-card h2")?.textContent).toContain("Vencidos");
  });

  it("la tabla de cada bandeja tiene un nombre accesible que dice cuál es", async () => {
    const { element } = await setup();
    expect(element.querySelector("app-scroll-area")?.getAttribute("aria-label")).toBe("Casos de la bandeja Asignados a mí");
  });
});
