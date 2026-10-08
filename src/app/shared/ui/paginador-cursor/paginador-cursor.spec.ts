import { TestBed } from "@angular/core/testing";
import { PaginadorCursor } from "./paginador-cursor";

describe("PaginadorCursor", () => {
  async function setup(entradas: { pagina?: number; cantidad?: number; hayAnterior?: boolean; hayMas?: boolean; cargando?: boolean }) {
    const fixture = TestBed.createComponent(PaginadorCursor);
    const valores = { pagina: 1, cantidad: 20, hayAnterior: false, hayMas: false, cargando: false, ...entradas };
    for (const [nombre, valor] of Object.entries(valores)) fixture.componentRef.setInput(nombre, valor);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const anterior = vi.fn();
    const siguiente = vi.fn();
    fixture.componentInstance.anterior.subscribe(anterior);
    fixture.componentInstance.siguiente.subscribe(siguiente);
    const botones = () => Array.from(element.querySelectorAll<HTMLButtonElement>("button"));
    return { fixture, element, anterior, siguiente, botones };
  }

  it("dice la página y cuántos casos hay en ella, sin total", async () => {
    const { element } = await setup({ pagina: 2, cantidad: 20, hayAnterior: true, hayMas: true });
    expect(element.textContent).toContain("Página 2 · 20 casos · hay más");
  });

  it("en la última página no dice «hay más» y usa el singular", async () => {
    const { element } = await setup({ cantidad: 1 });
    expect(element.textContent).toContain("Página 1 · 1 caso");
    expect(element.textContent).not.toContain("hay más");
  });

  it("en la primera página Anterior está deshabilitado y Siguiente pide la que sigue", async () => {
    const { botones, anterior, siguiente } = await setup({ hayMas: true });
    const [botonAnterior, botonSiguiente] = botones();
    expect(botonAnterior.disabled).toBe(true);
    expect(botonSiguiente.disabled).toBe(false);
    botonSiguiente.click();
    expect(siguiente).toHaveBeenCalledTimes(1);
    expect(anterior).not.toHaveBeenCalled();
  });

  it("en la última página Siguiente está deshabilitado y Anterior vuelve", async () => {
    const { botones, anterior, siguiente } = await setup({ pagina: 3, hayAnterior: true, hayMas: false });
    const [botonAnterior, botonSiguiente] = botones();
    expect(botonSiguiente.disabled).toBe(true);
    botonAnterior.click();
    expect(anterior).toHaveBeenCalledTimes(1);
    expect(siguiente).not.toHaveBeenCalled();
  });

  it("mientras carga deshabilita los dos botones", async () => {
    const { botones } = await setup({ hayAnterior: true, hayMas: true, cargando: true });
    expect(botones().every((boton) => boton.disabled)).toBe(true);
  });

  it("sin casos ni página anterior no muestra nada, pero con página anterior permite volver", async () => {
    const vacio = await setup({ cantidad: 0 });
    expect(vacio.element.querySelector("nav")).toBeNull();
    TestBed.resetTestingModule();
    const conAnterior = await setup({ cantidad: 0, pagina: 2, hayAnterior: true });
    expect(conAnterior.element.querySelector("nav")).not.toBeNull();
  });

  it("la navegación tiene nombre accesible", async () => {
    const { element } = await setup({});
    expect(element.querySelector("nav")?.getAttribute("aria-label")).toBe("Paginación");
  });
});
