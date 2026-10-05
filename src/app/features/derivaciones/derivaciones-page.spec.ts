import { TestBed } from "@angular/core/testing";
import { DERIVACIONES_DEMO } from "@/features/derivaciones/data/derivaciones.demo";
import { EstadoDerivacion } from "@/features/derivaciones/enums/estado-derivacion.enum";
import { DerivacionesPage } from "./derivaciones-page";

describe("DerivacionesPage", () => {
  async function setup() {
    TestBed.configureTestingModule({ imports: [DerivacionesPage] });
    const fixture = TestBed.createComponent(DerivacionesPage);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const pestanas = () => Array.from(element.querySelectorAll<HTMLButtonElement>("[role='tab']"));
    const filas = () => element.querySelectorAll("tbody tr").length;
    const dialogo = () => element.querySelector("[role='dialog']");
    const esperar = async (accion: () => void) => {
      accion();
      await fixture.whenStable();
    };
    return { element, fixture, pestanas, filas, dialogo, esperar };
  }

  const pendientes = DERIVACIONES_DEMO.filter((d) => d.estado === EstadoDerivacion.PENDIENTE);

  it("muestra el título y las cuatro pestañas con su cantidad", async () => {
    const { element, pestanas } = await setup();
    expect(element.querySelector("h1")?.textContent).toContain("Derivaciones");
    const etiquetas = pestanas().map((tab) => tab.textContent?.trim() ?? "");
    expect(etiquetas).toHaveLength(4);
    expect(etiquetas[0]).toMatch(/^Pendientes \(\d+\)$/);
    expect(etiquetas[3]).toMatch(/^Fuera de competencia \(\d+\)$/);
  });

  it("empieza en Pendientes y muestra las siete columnas más la trazabilidad", async () => {
    const { element, filas } = await setup();
    expect(filas()).toBe(pendientes.length);
    const encabezados = Array.from(element.querySelectorAll("thead th")).map((th) => th.textContent?.trim());
    expect(encabezados).toEqual(["Caso", "Origen", "Destino", "Regla aplicada", "Usuario", "Fecha", "Estado", "Trazabilidad"]);
  });

  it("cambiar de pestaña cambia el listado", async () => {
    const { fixture, pestanas, filas } = await setup();
    const realizadas = pestanas().find((tab) => tab.textContent?.includes("Realizadas")) as HTMLButtonElement;
    realizadas.click();
    await fixture.whenStable();
    expect(filas()).toBe(DERIVACIONES_DEMO.filter((d) => d.estado === EstadoDerivacion.REALIZADA).length);
  });

  it("Ver abre el panel con la trazabilidad de cinco pasos de ese caso", async () => {
    const { element, dialogo, esperar } = await setup();
    expect(dialogo()).toBeNull();
    await esperar(() => element.querySelector<HTMLButtonElement>("tbody tr button")?.click());
    const panel = dialogo() as HTMLElement;
    expect(panel).not.toBeNull();
    expect(panel.textContent).toContain(pendientes[0].codigoCaso);
    expect(panel.querySelectorAll("li")).toHaveLength(5);
    expect(panel.textContent).toContain("Motor de competencia");
  });

  it("el panel se cierra con Escape", async () => {
    const { element, dialogo, esperar } = await setup();
    await esperar(() => element.querySelector<HTMLButtonElement>("tbody tr button")?.click());
    await esperar(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(dialogo()).toBeNull();
  });

  it("el botón Ver dice a qué caso corresponde para lectores de pantalla", async () => {
    const { element } = await setup();
    expect(element.querySelector("tbody tr button .sr-only")?.textContent).toContain(pendientes[0].codigoCaso);
  });
});
