import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import type { SesionUsuario } from "@/core/auth/auth.types";
import { SessionStore } from "@/core/auth/session.store";
import { ROUTE } from "@/shared/constants/routes";
import { AppShell } from "./app-shell";

describe("AppShell", () => {
  async function setup(sesion: SesionUsuario) {
    const cerrar = vi.fn(async () => undefined);
    TestBed.configureTestingModule({
      imports: [AppShell],
      providers: [provideRouter([]), { provide: SessionStore, useValue: { sesion: signal(sesion), cerrar } }],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    const fixture = TestBed.createComponent(AppShell);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const boton = (label: string) => element.querySelector<HTMLButtonElement>(`button[aria-label='${label}']`);
    return { element, fixture, cerrar, navigate, boton };
  }

  const ana: SesionUsuario = { nombreCompleto: "Ana Prueba", correo: "ana@minsa.gob.pe", modulos: ["INCIDENCIAS"] };

  it("muestra el nombre y solo el menú de los módulos del usuario", async () => {
    const { element } = await setup(ana);
    expect(element.textContent).toContain("Ana Prueba");
    expect(element.textContent).toContain("Casos");
    expect(element.textContent).not.toContain("Revisión IA");
  });

  it("solo las entradas con pantalla son enlace y el resto queda deshabilitado", async () => {
    const { element } = await setup(ana);
    const enlaces = Array.from(element.querySelectorAll("nav a")).map((a) => a.textContent?.trim());
    expect(enlaces).toEqual(["Dashboard", "Casos"]);
    expect(element.querySelectorAll("nav [aria-disabled='true']").length).toBeGreaterThan(0);
  });

  it("contraer el menú oculta las etiquetas y deja los iconos", async () => {
    const { element, fixture, boton } = await setup(ana);
    boton("Contraer el menú")?.click();
    await fixture.whenStable();

    expect(element.querySelector("nav a")?.textContent?.trim()).toBe("");
    expect(element.querySelector("nav a")?.getAttribute("aria-label")).toBe("Dashboard");
    expect(boton("Expandir el menú")).not.toBeNull();
  });

  it("un grupo se pliega y se despliega", async () => {
    const { element, fixture } = await setup(ana);
    const grupo = element.querySelector<HTMLButtonElement>("app-sidebar-group button");
    expect(grupo?.getAttribute("aria-expanded")).toBe("true");
    grupo?.click();
    await fixture.whenStable();
    expect(grupo?.getAttribute("aria-expanded")).toBe("false");
  });

  it("la fecha es solo un icono y el texto completo va en el tooltip", async () => {
    const { element } = await setup(ana);
    const fecha = element.querySelector("app-topbar [role='img']");
    expect(fecha?.textContent?.trim()).toBe("");
    expect(fecha?.getAttribute("title")).toContain(String(new Date().getFullYear()));
    expect(fecha?.getAttribute("aria-label")).toBe(fecha?.getAttribute("title"));
  });

  it("el saludo usa solo el primer nombre", async () => {
    const { element } = await setup(ana);
    expect(element.querySelector("app-topbar p")?.textContent?.trim()).toBe("Hola, Ana");
  });

  it("cerrar sesión llama al store y vuelve al login", async () => {
    const { fixture, cerrar, navigate, boton } = await setup(ana);
    boton("Cerrar sesión")?.click();
    await fixture.whenStable();
    expect(cerrar).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(ROUTE.LOGIN);
  });
});
