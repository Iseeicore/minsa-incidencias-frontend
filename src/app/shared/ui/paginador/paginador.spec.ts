import { TestBed } from "@angular/core/testing";
import { Paginador } from "./paginador";

describe("Paginador", () => {
  async function setup(pagina: number, total: number, tamano = 20) {
    const fixture = TestBed.createComponent(Paginador);
    fixture.componentRef.setInput("pagina", pagina);
    fixture.componentRef.setInput("total", total);
    fixture.componentRef.setInput("tamano", tamano);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const cambios: number[] = [];
    fixture.componentInstance.pagina.subscribe((valor) => cambios.push(valor));
    const boton = (etiqueta: string) =>
      element.querySelector<HTMLButtonElement>(`button[aria-label='${etiqueta}']`) as HTMLButtonElement;
    const numeros = () =>
      Array.from(element.querySelectorAll<HTMLButtonElement>("button[data-pagina]")).map((item) => item.textContent?.trim());
    return { fixture, element, cambios, boton, numeros };
  }

  it.each([
    [1, 45, "1-20 de 45"],
    [2, 45, "21-40 de 45"],
    [3, 45, "41-45 de 45"],
    [1, 7, "1-7 de 7"],
  ])("en la página %i de %i casos dice «%s»", async (pagina, total, resumen) => {
    const { element } = await setup(pagina, total);
    expect(element.textContent).toContain(resumen);
  });

  it("es una navegación con nombre accesible", async () => {
    const { element } = await setup(1, 45);
    expect(element.querySelector("nav")?.getAttribute("aria-label")).toBe("Paginación");
  });

  it("marca solo la página actual con aria-current", async () => {
    const { element } = await setup(2, 45);
    const actuales = element.querySelectorAll("[aria-current='page']");
    expect(actuales).toHaveLength(1);
    expect(actuales[0].textContent?.trim()).toBe("2");
  });

  it("en la primera página no se puede retroceder", async () => {
    const { boton } = await setup(1, 45);
    expect(boton("Página anterior").disabled).toBe(true);
    expect(boton("Página siguiente").disabled).toBe(false);
  });

  it("en la última página no se puede avanzar", async () => {
    const { boton } = await setup(3, 45);
    expect(boton("Página anterior").disabled).toBe(false);
    expect(boton("Página siguiente").disabled).toBe(true);
  });

  it("siguiente y anterior mueven una página", async () => {
    const { fixture, boton, cambios } = await setup(2, 100);
    boton("Página siguiente").click();
    await fixture.whenStable();
    boton("Página anterior").click();
    await fixture.whenStable();
    expect(cambios).toEqual([3, 2]);
  });

  it("elegir un número va a esa página", async () => {
    const { fixture, element, cambios } = await setup(1, 45);
    const tres = Array.from(element.querySelectorAll<HTMLButtonElement>("button[data-pagina]")).find(
      (item) => item.textContent?.trim() === "3",
    ) as HTMLButtonElement;
    tres.click();
    await fixture.whenStable();
    expect(cambios).toEqual([3]);
  });

  it("volver a elegir la página actual no hace nada", async () => {
    const { fixture, element, cambios } = await setup(2, 45);
    (element.querySelector("[aria-current='page']") as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(cambios).toEqual([]);
  });

  it("con muchas páginas colapsa con elipsis que los lectores de pantalla no leen", async () => {
    const { element, numeros } = await setup(10, 400);
    expect(numeros()).toEqual(["1", "9", "10", "11", "20"]);
    const elipsis = element.querySelectorAll("[data-elipsis]");
    expect(elipsis).toHaveLength(2);
    expect(elipsis[0].getAttribute("aria-hidden")).toBe("true");
  });

  it("cada número tiene un nombre accesible", async () => {
    const { boton } = await setup(1, 45);
    expect(boton("Página 2")).toBeTruthy();
  });

  it("con una sola página muestra el resumen pero no los botones", async () => {
    const { element } = await setup(1, 5);
    expect(element.textContent).toContain("1-5 de 5");
    expect(element.querySelectorAll("button")).toHaveLength(0);
  });

  it("sin casos no muestra nada", async () => {
    const { element } = await setup(1, 0);
    expect(element.querySelector("nav")).toBeNull();
  });

  it("el resumen se anuncia a los lectores de pantalla al cambiar", async () => {
    const { element } = await setup(1, 45);
    expect(element.querySelector("[aria-live='polite']")?.textContent).toContain("1-20 de 45");
  });
});
