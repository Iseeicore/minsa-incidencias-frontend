import { TestBed } from "@angular/core/testing";
import { TextareaField } from "./textarea-field";

describe("TextareaField", () => {
  it("se ve como un campo: borde gris, fondo blanco y anillo de foco", async () => {
    const fixture = TestBed.createComponent(TextareaField);
    fixture.componentRef.setInput("label", "Motivo");
    await fixture.whenStable();
    const area = (fixture.nativeElement as HTMLElement).querySelector("textarea") as HTMLTextAreaElement;
    for (const clase of ["border-2", "border-gray-200", "bg-white", "focus:ring-2", "focus:border-primary-500"]) {
      expect(area.classList.contains(clase), clase).toBe(true);
    }
  });

  async function setup(maxlength?: number) {
    const fixture = TestBed.createComponent(TextareaField);
    fixture.componentRef.setInput("label", "Resolución");
    if (maxlength) fixture.componentRef.setInput("maxlength", maxlength);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, element, area: element.querySelector("textarea") as HTMLTextAreaElement };
  }

  it("tiene una etiqueta visible asociada al campo", async () => {
    const { element } = await setup();
    expect(element.querySelector("label")?.textContent).toContain("Resolución");
  });

  it("al escribir actualiza el valor y el contador", async () => {
    const { fixture, element, area } = await setup(100);
    area.value = "Se atendió al paciente";
    area.dispatchEvent(new Event("input"));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe("Se atendió al paciente");
    expect(element.textContent).toContain("22 / 100");
    expect(area.getAttribute("maxlength")).toBe("100");
  });

  it("con minlength avisa el mínimo y lo marca en rojo mientras falten caracteres", async () => {
    const { fixture, element, area } = await setup(100);
    fixture.componentRef.setInput("minlength", 10);
    await fixture.whenStable();
    expect(element.textContent).toContain("Mínimo 10 caracteres");
    expect(element.querySelector(".text-danger-600")).not.toBeNull();

    area.value = "Texto con más de diez";
    area.dispatchEvent(new Event("input"));
    await fixture.whenStable();
    expect(element.querySelector(".text-danger-600")).toBeNull();
  });

  it("marca el campo como inválido para lectores de pantalla", async () => {
    const { fixture, area } = await setup();
    fixture.componentRef.setInput("invalid", true);
    await fixture.whenStable();
    expect(area.getAttribute("aria-invalid")).toBe("true");
  });
});
