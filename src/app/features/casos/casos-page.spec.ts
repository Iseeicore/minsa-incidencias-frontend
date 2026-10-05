import { TestBed } from "@angular/core/testing";
import { CasosStore } from "@/features/casos/casos.store";
import { CASOS_DEMO } from "@/features/casos/data/casos.demo";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { RolDemo } from "@/features/casos/enums/rol-demo.enum";
import { CasosPage } from "./casos-page";

describe("CasosPage", () => {
  async function setup() {
    TestBed.configureTestingModule({ imports: [CasosPage] });
    const fixture = TestBed.createComponent(CasosPage);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const filas = () => element.querySelectorAll("tbody tr").length;
    const pestana = (texto: string) =>
      Array.from(element.querySelectorAll<HTMLButtonElement>("[role='tab']")).find((tab) => tab.textContent?.includes(texto));
    const escribir = async (texto: string) => {
      const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
      input.value = texto;
      input.dispatchEvent(new Event("input"));
      await fixture.whenStable();
    };
    return { element, fixture, filas, pestana, escribir, store: TestBed.inject(CasosStore) };
  }

  afterEach(() => document.body.replaceChildren());

  it("muestra el título, el aviso de demostración y todos los casos", async () => {
    const { element, filas } = await setup();
    expect(element.querySelector("h1")?.textContent).toContain("Casos");
    expect(element.textContent).toContain("Datos de demostración");
    expect(filas()).toBe(CASOS_DEMO.length);
  });

  it("muestra todas las columnas dentro de una región desplazable, sin ocultar ninguna", async () => {
    const { element } = await setup();
    const encabezados = Array.from(element.querySelectorAll("thead th"));
    expect(encabezados.map((th) => th.textContent?.trim())).toEqual([
      "Código",
      "Categoría",
      "Etiquetas",
      "Prioridad",
      "Área",
      "Responsable",
      "Estado",
      "Confianza IA",
      "Plazo",
      "Acciones",
    ]);
    expect(encabezados.some((th) => th.className.includes("hidden"))).toBe(false);
    expect(element.querySelector("app-scroll-area[role='region']")).not.toBeNull();
  });

  it("tiene las cinco pestañas", async () => {
    const { element } = await setup();
    const etiquetas = Array.from(element.querySelectorAll("[role='tab']")).map((tab) => tab.textContent?.trim());
    expect(etiquetas).toEqual(["Todos", "Reclamos", "Quejas", "Corrupción", "Críticos"]);
  });

  it("cambiar de pestaña filtra la tabla", async () => {
    const { fixture, filas, pestana } = await setup();
    pestana("Corrupción")?.click();
    await fixture.whenStable();
    expect(filas()).toBeGreaterThan(0);
    expect(filas()).toBeLessThan(CASOS_DEMO.length);
  });

  it("buscar filtra y sin resultados ofrece limpiar los filtros", async () => {
    const { element, fixture, filas, escribir } = await setup();
    await escribir("zzzz-no-existe");
    expect(filas()).toBe(0);
    expect(element.textContent).toContain("No hay casos con estos filtros");

    const limpiar = Array.from(element.querySelectorAll<HTMLButtonElement>("button")).find((boton) =>
      boton.textContent?.includes("Limpiar filtros"),
    );
    limpiar?.click();
    await fixture.whenStable();
    expect(filas()).toBe(CASOS_DEMO.length);
  });

  it("el contador refleja la cantidad de casos visibles", async () => {
    const { element, escribir } = await setup();
    await escribir("003241");
    expect(element.querySelector("[aria-live='polite']")?.textContent).toContain("1 casos");
  });

  it("cada fila tiene un botón: Revisar si el rol puede actuar y Ver si no", async () => {
    const { element } = await setup();
    const etiquetas = Array.from(element.querySelectorAll("tbody tr")).map((fila) =>
      fila.querySelector("button")?.textContent?.trim().split(" ")[0],
    );
    expect(etiquetas.filter((texto) => texto === "Revisar")).toHaveLength(4);
    expect(etiquetas.filter((texto) => texto === "Ver")).toHaveLength(CASOS_DEMO.length - 4);
  });

  it("Revisar abre el panel del caso elegido", async () => {
    const { element, fixture } = await setup();
    const revisar = Array.from(element.querySelectorAll<HTMLButtonElement>("tbody button")).find((boton) =>
      boton.textContent?.includes("Revisar"),
    ) as HTMLButtonElement;
    revisar.click();
    await fixture.whenStable();
    const panel = element.querySelector("[role='dialog']");
    expect(panel?.textContent).toContain("Revisar caso");
    expect(panel?.textContent).toContain("Confirmar categoría");
  });

  it("al cambiar el rol de demostración solo quedan los casos que ese rol puede ver", async () => {
    const { fixture, filas, store } = await setup();
    store.cambiarRol(RolDemo.AREA_QUEJA);
    await fixture.whenStable();
    const quejas = CASOS_DEMO.filter((caso) => caso.categoria === CategoriaCaso.QUEJA).length;
    expect(filas()).toBe(quejas);
  });
});
