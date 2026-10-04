import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Button } from "./button";

@Component({
  imports: [Button],
  template: `<app-button [loading]="loading()" [tone]="tone()">Guardar</app-button>`,
})
class HostComponent {
  readonly loading = signal(false);
  readonly tone = signal<"primary" | "danger">("primary");
}

describe("Button", () => {
  async function setup() {
    const fixture = TestBed.createComponent(HostComponent);
    await fixture.whenStable();
    const button = () => fixture.nativeElement.querySelector("button") as HTMLButtonElement;
    return { fixture, button };
  }

  it("muestra el contenido y usa el tono primario por defecto", async () => {
    const { button } = await setup();
    expect(button().textContent).toContain("Guardar");
    expect(button().className).toContain("bg-primary-500");
  });

  it("cambia las clases según el tono", async () => {
    const { fixture, button } = await setup();
    fixture.componentInstance.tone.set("danger");
    await fixture.whenStable();
    expect(button().className).toContain("bg-danger-500");
  });

  it("al cargar se deshabilita, anuncia el estado y muestra el indicador", async () => {
    const { fixture, button } = await setup();
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    expect(button().disabled).toBe(true);
    expect(button().getAttribute("aria-busy")).toBe("true");
    expect(button().querySelector("svg")).not.toBeNull();
  });
});
