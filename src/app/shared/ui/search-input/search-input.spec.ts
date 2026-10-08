import { TestBed } from "@angular/core/testing";
import { SearchInput } from "./search-input";

describe("SearchInput", () => {
  async function setup(valor = "") {
    const fixture = TestBed.createComponent(SearchInput);
    fixture.componentRef.setInput("label", "Buscar caso");
    fixture.componentRef.setInput("placeholder", "Buscar por código");
    fixture.componentRef.setInput("value", valor);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, element, input: element.querySelector("input") as HTMLInputElement };
  }

  it("tiene lupa, el texto de ayuda y el estilo de campo con borde visible", async () => {
    const { element, input } = await setup();
    expect(element.querySelector("app-icon")).not.toBeNull();
    expect(input.placeholder).toBe("Buscar por código");
    expect(input.classList.contains("border-2")).toBe(true);
    expect(input.classList.contains("bg-white")).toBe(true);
  });

  it("sin texto no muestra el botón de limpiar", async () => {
    const { element } = await setup();
    expect(element.querySelector("button")).toBeNull();
  });

  it("con texto muestra el botón, que vacía el campo", async () => {
    const { fixture, element } = await setup("demora");
    const limpiar = element.querySelector<HTMLButtonElement>("button");
    expect(limpiar?.getAttribute("aria-label")).toBe("Limpiar buscar caso");
    limpiar?.click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe("");
    expect(element.querySelector("button")).toBeNull();
  });
});
