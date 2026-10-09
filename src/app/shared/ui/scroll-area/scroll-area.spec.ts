import { TestBed } from "@angular/core/testing";
import { ScrollArea } from "./scroll-area";

describe("ScrollArea", () => {
  async function setup() {
    const fixture = TestBed.createComponent(ScrollArea);
    fixture.componentRef.setInput("label", "Listado de casos");
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it("es una región con nombre, enfocable con teclado, para poder desplazarla", async () => {
    const element = await setup();
    expect(element.getAttribute("role")).toBe("region");
    expect(element.getAttribute("aria-label")).toBe("Listado de casos");
    expect(element.getAttribute("tabindex")).toBe("0");
  });

  it("desplaza solo en horizontal, crece con su contenido y nunca excede a su contenedor", async () => {
    const element = await setup();
    expect(element.className).toContain("overflow-x-auto");
    expect(element.className).not.toContain("max-h-");
    expect(element.className).toContain("max-w-full");
  });

  it("es el bloque contenedor de lo que lleva dentro, para que los sr-only absolutos de las filas no ensanchen la pagina", async () => {
    const element = await setup();
    expect(element.classList.contains("relative")).toBe(true);
  });
});
