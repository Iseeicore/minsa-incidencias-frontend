import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { SessionStore } from "@/core/auth/session.store";
import type { SesionUsuario } from "@/core/auth/auth.types";
import { ROUTE } from "@/shared/constants/routes";
import { InicioPage } from "./inicio-page";

describe("InicioPage", () => {
  async function setup(sesion: SesionUsuario | null) {
    const cerrar = vi.fn(async () => undefined);
    TestBed.configureTestingModule({
      imports: [InicioPage],
      providers: [provideRouter([]), { provide: SessionStore, useValue: { sesion: signal(sesion), cerrar } }],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    const fixture = TestBed.createComponent(InicioPage);
    await fixture.whenStable();
    return { element: fixture.nativeElement as HTMLElement, fixture, cerrar, navigate };
  }

  it("muestra el nombre, el correo y los módulos de la sesión con sus etiquetas", async () => {
    const { element } = await setup({ nombreCompleto: "Ana Prueba", correo: "ana@minsa.gob.pe", modulos: ["INCIDENCIAS", "REVISION"] });
    expect(element.textContent).toContain("Ana Prueba");
    expect(element.textContent).toContain("ana@minsa.gob.pe");
    expect(element.textContent).toContain("Incidencias");
    expect(element.textContent).toContain("Revisión y resolución");
    expect(element.textContent).not.toContain("Indicadores");
  });

  it("avisa si el usuario no tiene módulos", async () => {
    const { element } = await setup({ nombreCompleto: "Ana", correo: "ana@minsa.gob.pe", modulos: [] });
    expect(element.textContent).toContain("todavía no tiene módulos");
  });

  it("cerrar sesión llama al store y vuelve al login", async () => {
    const { element, fixture, cerrar, navigate } = await setup({ nombreCompleto: "Ana", correo: "ana@minsa.gob.pe", modulos: [] });
    (element.querySelector("button") as HTMLButtonElement).click();
    await fixture.whenStable();
    expect(cerrar).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(ROUTE.LOGIN);
  });
});
