import { TestBed } from "@angular/core/testing";
import { DateField } from "./date-field";

describe("DateField", () => {
  async function setup(valor = "") {
    const fixture = TestBed.createComponent(DateField);
    fixture.componentRef.setInput("label", "Desde");
    fixture.componentRef.setInput("value", valor);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const input = element.querySelector("input") as HTMLInputElement;
    return { fixture, element, input };
  }

  it("muestra la etiqueta visible, un campo de fecha con el estilo del sistema y el icono de calendario", async () => {
    const { element, input } = await setup();
    const etiqueta = element.querySelector("label span");
    expect(etiqueta?.textContent?.trim()).toBe("Desde");
    expect(etiqueta?.classList.contains("sr-only")).toBe(false);
    expect(input.type).toBe("date");
    expect(input.classList.contains("border-2")).toBe(true);
    expect(input.classList.contains("border-gray-200")).toBe(true);
    expect(input.classList.contains("bg-white")).toBe(true);
    expect(input.classList.contains("focus:ring-2")).toBe(true);
    expect(element.querySelector("app-icon")).not.toBeNull();
  });

  it("muestra el valor recibido y avisa lo que la persona elige", async () => {
    const { fixture, input } = await setup("2026-10-01");
    expect(input.value).toBe("2026-10-01");

    input.value = "2026-10-05";
    input.dispatchEvent(new Event("input"));
    expect(fixture.componentInstance.value()).toBe("2026-10-05");
  });

  it("cuando se marca como inválido lo anuncia y cambia el borde", async () => {
    const { fixture, input } = await setup();
    fixture.componentRef.setInput("invalid", true);
    await fixture.whenStable();
    expect(input.getAttribute("aria-invalid")).toBe("true");
    expect(input.classList.contains("border-danger-200")).toBe(true);
  });
});
