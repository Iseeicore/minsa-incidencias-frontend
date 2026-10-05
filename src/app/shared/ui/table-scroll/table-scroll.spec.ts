import { TestBed } from "@angular/core/testing";
import { TableScroll } from "./table-scroll";

describe("TableScroll", () => {
  async function setup() {
    const fixture = TestBed.createComponent(TableScroll);
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

  it("desplaza en los dos ejes y limita la altura", async () => {
    const element = await setup();
    expect(element.className).toContain("overflow-auto");
    expect(element.className).toContain("max-h-128");
  });
});
