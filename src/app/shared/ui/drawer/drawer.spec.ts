import { Component, signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { Drawer } from "./drawer";

@Component({
  selector: "app-drawer-host",
  imports: [Drawer],
  template: `
    <button type="button" id="abrir" (click)="abierto.set(true)">Abrir</button>
    <app-drawer titulo="Detalle" subtitulo="Caso 1" [(abierto)]="abierto">
      <button type="button" id="dentro">Acción</button>
    </app-drawer>
  `,
})
class DrawerHost {
  readonly abierto = signal(false);
}

describe("Drawer", () => {
  async function setup() {
    TestBed.configureTestingModule({ imports: [DrawerHost] });
    const fixture = TestBed.createComponent(DrawerHost);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const dialogo = () => element.querySelector("[role='dialog']");
    const fondo = () => element.querySelector("[aria-hidden='true'].fixed");
    const esperar = async (accion: () => void) => {
      accion();
      await fixture.whenStable();
    };
    return { element, fixture, dialogo, fondo, esperar };
  }

  afterEach(() => document.body.replaceChildren());

  it("cerrado no dibuja nada", async () => {
    const { dialogo, fondo } = await setup();
    expect(dialogo()).toBeNull();
    expect(fondo()).toBeNull();
  });

  it("abierto es un diálogo modal con título, subtítulo y contenido", async () => {
    const { element, dialogo, esperar } = await setup();
    await esperar(() => (element.querySelector("#abrir") as HTMLElement).click());
    const panel = dialogo() as HTMLElement;
    expect(panel.getAttribute("aria-modal")).toBe("true");
    expect(panel.textContent).toContain("Detalle");
    expect(panel.textContent).toContain("Caso 1");
    expect(panel.querySelector("#dentro")).not.toBeNull();
    expect(document.getElementById(panel.getAttribute("aria-labelledby") ?? "")?.textContent).toContain("Detalle");
  });

  it("se cierra con el botón X, el fondo y la tecla Escape", async () => {
    const { element, dialogo, fondo, esperar } = await setup();
    const abrir = () => esperar(() => (element.querySelector("#abrir") as HTMLElement).click());

    await abrir();
    await esperar(() => (element.querySelector("button[aria-label='Cerrar el panel']") as HTMLElement).click());
    expect(dialogo()).toBeNull();

    await abrir();
    await esperar(() => (fondo() as HTMLElement).click());
    expect(dialogo()).toBeNull();

    await abrir();
    await esperar(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(dialogo()).toBeNull();
  });

  it("al abrir manda el foco al panel y al cerrar lo devuelve a quien lo abrió", async () => {
    const { element, esperar, fixture } = await setup();
    const abrir = element.querySelector("#abrir") as HTMLElement;
    abrir.focus();
    await esperar(() => abrir.click());
    await fixture.whenStable();
    expect(element.querySelector("[role='dialog']")?.contains(document.activeElement)).toBe(true);

    await esperar(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    await fixture.whenStable();
    expect(document.activeElement).toBe(abrir);
  });

  it("Tab en el último elemento vuelve al primero para no escapar del panel", async () => {
    const { element, esperar } = await setup();
    await esperar(() => (element.querySelector("#abrir") as HTMLElement).click());
    const dentro = element.querySelector("#dentro") as HTMLElement;
    dentro.focus();
    const evento = new KeyboardEvent("keydown", { key: "Tab", bubbles: true, cancelable: true });
    dentro.dispatchEvent(evento);
    expect(evento.defaultPrevented).toBe(true);
    expect(document.activeElement).toBe(element.querySelector("button[aria-label='Cerrar el panel']"));
  });
});
