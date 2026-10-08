import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { IconName } from "@/shared/enums/icon-name.enum";
import { ButtonSize } from "@/shared/enums/button.enum";
import { Button } from "./button";

@Component({
  imports: [Button],
  template: `<app-button [loading]="loading()" [tone]="tone()" [icon]="icon()" [size]="size()">Guardar</app-button>`,
})
class HostComponent {
  readonly loading = signal(false);
  readonly tone = signal<"primary" | "danger">("primary");
  readonly icon = signal<IconName | null>(null);
  readonly size = signal<ButtonSize>(ButtonSize.MD);
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

  it("sin icono no dibuja ninguno", async () => {
    const { button } = await setup();
    expect(button().querySelector("svg")).toBeNull();
  });

  it("con icono lo dibuja a la izquierda del texto", async () => {
    const { fixture, button } = await setup();
    fixture.componentInstance.icon.set(IconName.ARCHIVE);
    await fixture.whenStable();
    expect(button().firstElementChild?.tagName).toBe("APP-ICON");
    expect(button().querySelector("app-icon svg")).not.toBeNull();
    expect(button().textContent).toContain("Guardar");
  });

  it("cada icono nuevo del panel de revisión está en el registro y se dibuja", async () => {
    const { fixture, button } = await setup();
    const dibujos = new Set<string>();
    for (const nombre of [
      IconName.CONFIRM,
      IconName.EDIT,
      IconName.TAKE,
      IconName.RESOLVE,
      IconName.SEND,
      IconName.ARCHIVE,
      IconName.REOPEN,
      IconName.SHIELD_ALERT,
    ]) {
      fixture.componentInstance.icon.set(nombre);
      await fixture.whenStable();
      const dibujo = button().querySelector("app-icon svg")?.innerHTML ?? "";
      expect(dibujo, nombre).not.toBe("");
      dibujos.add(dibujo);
    }
    expect(dibujos.size).toBe(8);
  });

  it("el icono es más chico en el botón pequeño", async () => {
    const { fixture, button } = await setup();
    fixture.componentInstance.icon.set(IconName.EDIT);
    await fixture.whenStable();
    const grande = button().querySelector("app-icon svg")?.getAttribute("width");
    fixture.componentInstance.size.set(ButtonSize.SM);
    await fixture.whenStable();
    const chico = button().querySelector("app-icon svg")?.getAttribute("width");
    expect(Number(chico)).toBeLessThan(Number(grande));
  });

  it("al cargar el indicador reemplaza al icono", async () => {
    const { fixture, button } = await setup();
    fixture.componentInstance.icon.set(IconName.EDIT);
    fixture.componentInstance.loading.set(true);
    await fixture.whenStable();
    expect(button().querySelectorAll("app-icon")).toHaveLength(1);
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
