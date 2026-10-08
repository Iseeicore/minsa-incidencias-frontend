import { provideHttpClient } from "@angular/common/http";
import { provideHttpClientTesting } from "@angular/common/http/testing";
import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import type { SesionUsuario } from "@/core/auth/auth.types";
import { SessionStore } from "@/core/auth/session.store";
import { AppShell } from "./app-shell";

describe("AppShell en pantalla chica", () => {
  let alCambiarPantalla: ((evento: { matches: boolean }) => void) | undefined;

  beforeEach(() => {
    alCambiarPantalla = undefined;
    vi.stubGlobal("matchMedia", () => ({
      matches: true,
      addEventListener: (_tipo: string, funcion: (evento: { matches: boolean }) => void) => {
        alCambiarPantalla = funcion;
      },
      removeEventListener: vi.fn(),
    }));
  });

  afterEach(() => vi.unstubAllGlobals());

  const ana: SesionUsuario = { nombreCompleto: "Ana Prueba", correo: "ana@minsa.gob.pe", vistas: ["INICIO", "CASOS"], area: null };

  async function setup() {
    TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [
        provideRouter([{ path: "**", children: [] }]),
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: SessionStore, useValue: { sesion: signal(ana), cerrar: vi.fn() } },
      ],
    });
    const fixture = TestBed.createComponent(AppShell);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const sidebar = () => element.querySelector("app-sidebar") as HTMLElement;
    const boton = (label: string) => element.querySelector<HTMLButtonElement>(`button[aria-label='${label}']`);
    const fondo = () => element.querySelector("[aria-hidden='true'].fixed");
    const pulsar = async (accion: () => void) => {
      accion();
      await fixture.whenStable();
    };
    return { element, fixture, sidebar, boton, fondo, pulsar };
  }

  it("empieza con el menú cerrado y oculto, sin fondo oscuro", async () => {
    const { sidebar, boton, fondo } = await setup();
    expect(sidebar().className).toContain("invisible");
    expect(sidebar().className).toContain("fixed");
    expect(fondo()).toBeNull();
    expect(boton("Abrir el menú")).not.toBeNull();
  });

  it("el botón del menú abre el cajón y aparece el fondo oscuro", async () => {
    const { sidebar, boton, fondo, pulsar } = await setup();
    await pulsar(() => boton("Abrir el menú")?.click());
    expect(sidebar().className).toContain("translate-x-0");
    expect(sidebar().className).not.toContain("invisible");
    expect(fondo()).not.toBeNull();
  });

  it("el cajón abierto tiene un botón para cerrarlo y funciona", async () => {
    const { sidebar, boton, fondo, pulsar } = await setup();
    await pulsar(() => boton("Abrir el menú")?.click());
    const cerrar = boton("Cerrar el menú");
    expect(cerrar).not.toBeNull();
    await pulsar(() => cerrar?.click());
    expect(sidebar().className).toContain("invisible");
    expect(fondo()).toBeNull();
  });

  it("hacer clic en el fondo oscuro cierra el cajón", async () => {
    const { sidebar, boton, fondo, pulsar } = await setup();
    await pulsar(() => boton("Abrir el menú")?.click());
    await pulsar(() => (fondo() as HTMLElement).click());
    expect(sidebar().className).toContain("invisible");
  });

  it("la tecla Escape cierra el cajón", async () => {
    const { sidebar, boton, pulsar } = await setup();
    await pulsar(() => boton("Abrir el menú")?.click());
    await pulsar(() => document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" })));
    expect(sidebar().className).toContain("invisible");
  });

  it("elegir una entrada del menú cierra el cajón", async () => {
    const { element, sidebar, boton, pulsar } = await setup();
    await pulsar(() => boton("Abrir el menú")?.click());
    await pulsar(() => element.querySelector<HTMLAnchorElement>("nav a")?.click());
    expect(sidebar().className).toContain("invisible");
  });

  it("al agrandar la ventana vuelve el menú fijo y se cierra el cajón", async () => {
    const { sidebar, boton, fondo, pulsar } = await setup();
    await pulsar(() => boton("Abrir el menú")?.click());
    await pulsar(() => alCambiarPantalla?.({ matches: false }));
    expect(sidebar().className).toContain("sticky");
    expect(fondo()).toBeNull();
    expect(boton("Contraer el menú")).not.toBeNull();
  });
});
