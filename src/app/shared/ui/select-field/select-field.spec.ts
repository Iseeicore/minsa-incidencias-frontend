import { TestBed } from "@angular/core/testing";
import { SelectField } from "./select-field";

describe("SelectField", () => {
  async function setup(valor: string) {
    const fixture = TestBed.createComponent(SelectField);
    fixture.componentRef.setInput("options", [
      { value: "a", label: "Uno" },
      { value: "b", label: "Dos" },
    ]);
    fixture.componentRef.setInput("label", "Elegir");
    fixture.componentRef.setInput("value", valor);
    await fixture.whenStable();
    return { fixture, select: (fixture.nativeElement as HTMLElement).querySelector("select") as HTMLSelectElement };
  }

  it("selecciona la opción que corresponde al valor", async () => {
    const { select } = await setup("b");
    expect(select.value).toBe("b");
  });

  it("al elegir otra opción actualiza el valor", async () => {
    const { fixture, select } = await setup("a");
    select.value = "b";
    select.dispatchEvent(new Event("change"));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe("b");
  });

  it("con etiquetaVisible la etiqueta se ve y deja de ser solo para lectores de pantalla", async () => {
    const { fixture } = await setup("a");
    fixture.componentRef.setInput("etiquetaVisible", true);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    expect(element.querySelector(".sr-only")).toBeNull();
    expect(element.querySelector("label span")?.textContent).toBe("Elegir");
  });

  it("tiene una etiqueta accesible", async () => {
    const { fixture } = await setup("a");
    expect((fixture.nativeElement as HTMLElement).querySelector(".sr-only")?.textContent).toBe("Elegir");
  });
});
