import { TestBed } from "@angular/core/testing";
import { SortHeader } from "./sort-header";

describe("SortHeader", () => {
  async function setup(activo: boolean, direccion: "asc" | "desc" = "asc") {
    const fixture = TestBed.createComponent(SortHeader);
    fixture.componentRef.setInput("label", "Código");
    fixture.componentRef.setInput("activo", activo);
    fixture.componentRef.setInput("direccion", direccion);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const ordenar = vi.fn();
    fixture.componentInstance.ordenar.subscribe(ordenar);
    return { fixture, element, ordenar, boton: element.querySelector("button") as HTMLButtonElement };
  }

  it("muestra el nombre de la columna en un botón", async () => {
    const { boton } = await setup(false);
    expect(boton.textContent).toContain("Código");
  });

  it("al pulsarlo pide ordenar por esa columna", async () => {
    const { boton, ordenar, fixture } = await setup(false);
    boton.click();
    await fixture.whenStable();
    expect(ordenar).toHaveBeenCalledTimes(1);
  });

  it("dice a los lectores de pantalla cómo está ordenada la columna", async () => {
    const inactiva = await setup(false);
    expect(inactiva.boton.getAttribute("aria-label")).toContain("Ordenar por Código");
    TestBed.resetTestingModule();
    const ascendente = await setup(true, "asc");
    expect(ascendente.boton.getAttribute("aria-label")).toContain("ascendente");
    TestBed.resetTestingModule();
    const descendente = await setup(true, "desc");
    expect(descendente.boton.getAttribute("aria-label")).toContain("descendente");
  });

  it("solo la columna activa muestra una flecha de dirección", async () => {
    const inactiva = await setup(false);
    expect(inactiva.element.querySelector("app-icon")).not.toBeNull();
    expect(inactiva.element.querySelector("[data-direccion]")).toBeNull();
    TestBed.resetTestingModule();
    const activa = await setup(true, "desc");
    expect(activa.element.querySelector("[data-direccion='desc']")).not.toBeNull();
  });
});
