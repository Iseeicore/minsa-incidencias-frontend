import { TestBed } from "@angular/core/testing";
import { CasosStore } from "@/features/casos/casos.store";
import { RolDemo } from "@/features/casos/enums/rol-demo.enum";
import { BandejasPage } from "./bandejas-page";

describe("BandejasPage", () => {
  async function setup() {
    TestBed.configureTestingModule({ imports: [BandejasPage] });
    const fixture = TestBed.createComponent(BandejasPage);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const pestanas = () => Array.from(element.querySelectorAll<HTMLButtonElement>("[role='tab']"));
    const pestana = (texto: string) => pestanas().find((tab) => tab.textContent?.includes(texto)) as HTMLButtonElement;
    const escribir = async (valor: string) => {
      const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
      input.value = valor;
      input.dispatchEvent(new Event("input"));
      await fixture.whenStable();
    };
    const filas = () => element.querySelectorAll("tbody tr").length;
    const cantidad = (tab: HTMLButtonElement) => Number(tab.dataset["cantidad"]);
    return { element, fixture, pestanas, pestana, filas, cantidad, escribir, store: TestBed.inject(CasosStore) };
  }

  afterEach(() => document.body.replaceChildren());

  it("muestra el título y las siete bandejas con su cantidad", async () => {
    const { element, pestanas } = await setup();
    expect(element.querySelector("h1")?.textContent).toContain("Mis bandejas");
    const etiquetas = pestanas().map((tab) => tab.querySelector("span")?.textContent?.trim());
    expect(etiquetas).toEqual([
      "Para actuar",
      "En revisión IA",
      "Por derivar",
      "En gestión",
      "Por vencer",
      "Resueltos",
      "Archivados",
    ]);
  });

  it("ya no ofrece las bandejas que la base no respalda (asignados, devueltos, vencidos)", async () => {
    const { element } = await setup();
    const texto = element.textContent ?? "";
    expect(texto).not.toContain("Asignados a mí");
    expect(texto).not.toContain("Devueltos");
    expect(texto).not.toContain("Vencidos");
  });

  it("empieza en Para actuar y su cantidad coincide con las filas", async () => {
    const { pestanas, filas, cantidad } = await setup();
    expect(pestanas()[0].getAttribute("aria-selected")).toBe("true");
    expect(filas()).toBe(cantidad(pestanas()[0]));
    expect(filas()).toBeGreaterThan(0);
  });

  it("Para actuar cambia con el rol", async () => {
    const { fixture, pestana, filas, cantidad, store } = await setup();
    store.cambiarRol(RolDemo.GESTOR);
    await fixture.whenStable();
    expect(cantidad(pestana("Para actuar"))).toBe(5);
    expect(filas()).toBe(5);

    store.cambiarRol(RolDemo.AREA_DENUNCIA_CORRUPCION);
    await fixture.whenStable();
    expect(cantidad(pestana("Para actuar"))).toBe(3);
    expect(filas()).toBe(3);

    store.cambiarRol(RolDemo.ADMINISTRADOR);
    await fixture.whenStable();
    expect(cantidad(pestana("Para actuar"))).toBe(0);
    expect(element(fixture).textContent).toContain("No hay casos en esta bandeja");
  });

  it("los vencidos aparecen en Archivados", async () => {
    const { element, fixture, pestana, filas, cantidad } = await setup();
    const archivados = pestana("Archivados");
    archivados.click();
    await fixture.whenStable();
    expect(filas()).toBe(cantidad(archivados));
    expect(element.textContent).toContain("MINSA-2026-003033");
    expect(element.textContent).toContain("vencieron sin atenderse");
  });

  it("filtra por texto dentro de la bandeja y avisa cuántos casos muestra", async () => {
    const { element, filas, pestanas, cantidad, escribir } = await setup();
    const total = cantidad(pestanas()[0]);
    await escribir("zzz-no-existe");
    expect(filas()).toBe(0);
    expect(element.textContent).toContain("Ningún caso de esta bandeja coincide con los filtros");
    expect(element.textContent).toContain(`Mostrando 0 de ${total}`);
  });

  it("Limpiar filtros devuelve todos los casos de la bandeja", async () => {
    const { element, fixture, filas, pestanas, cantidad, escribir } = await setup();
    const total = cantidad(pestanas()[0]);
    await escribir("zzz-no-existe");
    const limpiar = Array.from(element.querySelectorAll<HTMLButtonElement>("button")).find((boton) =>
      boton.textContent?.includes("Limpiar filtros"),
    ) as HTMLButtonElement;
    limpiar.click();
    await fixture.whenStable();
    expect(filas()).toBe(total);
    expect(element.textContent).not.toContain("Limpiar filtros");
  });

  it("el filtro de categoría reduce las filas y muestra su chip activo", async () => {
    const { element, fixture, filas, pestana } = await setup();
    pestana("En gestión").click();
    await fixture.whenStable();
    const antes = filas();
    const quejas = Array.from(element.querySelectorAll<HTMLButtonElement>("[aria-pressed]")).find((boton) =>
      boton.textContent?.includes("Quejas"),
    ) as HTMLButtonElement;
    quejas.click();
    await fixture.whenStable();
    expect(filas()).toBeLessThanOrEqual(antes);
    expect(quejas.getAttribute("aria-pressed")).toBe("true");
    expect(element.textContent).toContain("Categoría: Quejas");
  });

  it("explica el plazo configurado", async () => {
    const { element } = await setup();
    expect(element.textContent).toContain("Plazo de atención: 3 días desde que llega el caso");
    expect(element.textContent).toContain("Una resolución dura 3 días");
  });

  it("Revisar abre el panel del caso", async () => {
    const { element, fixture } = await setup();
    const revisar = Array.from(element.querySelectorAll<HTMLButtonElement>("tbody button")).find((boton) =>
      boton.textContent?.includes("Revisar"),
    ) as HTMLButtonElement;
    revisar.click();
    await fixture.whenStable();
    expect(element.querySelector("[role='dialog']")?.textContent).toContain("Revisar caso");
  });

  function element(fixture: { nativeElement: unknown }): HTMLElement {
    return fixture.nativeElement as HTMLElement;
  }
});
