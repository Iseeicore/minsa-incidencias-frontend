import { TestBed } from "@angular/core/testing";
import { ChipQuitable } from "./chip-quitable";

describe("ChipQuitable", () => {
  async function setup(label = "Categoría: Reclamos") {
    const fixture = TestBed.createComponent(ChipQuitable);
    fixture.componentRef.setInput("label", label);
    const alQuitar = vi.fn();
    fixture.componentInstance.quitar.subscribe(alQuitar);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    return { element, alQuitar, boton: element.querySelector("button") as HTMLButtonElement };
  }

  it("muestra el filtro y su botón dice qué se quita", async () => {
    const { boton } = await setup();
    expect(boton.textContent).toContain("Categoría: Reclamos");
    expect(boton.getAttribute("aria-label")).toBe("Quitar filtro: Categoría: Reclamos");
  });

  it("al pulsarlo avisa que se quita", async () => {
    const { boton, alQuitar } = await setup();
    boton.click();
    expect(alQuitar).toHaveBeenCalledTimes(1);
  });

  it("un texto largo se recorta y el nombre completo queda en el título", async () => {
    const largo = "Establecimiento: Hospital Nacional con un nombre extraordinariamente largo";
    const { boton, element } = await setup(largo);
    expect(boton.getAttribute("title")).toBe(largo);
    expect(boton.querySelector("span")?.className).toContain("truncate");
    expect(element.className).toContain("min-w-0");
  });
});
