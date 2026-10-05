import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router, type UrlTree } from "@angular/router";
import { ROUTE } from "@/shared/constants/routes";
import { ModuloCodigo } from "@/shared/enums/modulo-codigo.enum";
import { moduloGuard } from "./modulo.guard";
import { SessionStore } from "./session.store";

describe("moduloGuard", () => {
  function setup(modulos: ModuloCodigo[] | null) {
    const sesion = signal(modulos ? { nombreCompleto: "Ana", correo: "ana@minsa.gob.pe", modulos } : null);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SessionStore, useValue: { sesion } }],
    });
    return () =>
      TestBed.runInInjectionContext(() => moduloGuard(ModuloCodigo.INCIDENCIAS)({} as never, {} as never)) as
        | boolean
        | UrlTree;
  }

  it("deja pasar si el usuario tiene el módulo", () => {
    expect(setup([ModuloCodigo.INCIDENCIAS])()).toBe(true);
  });

  it("sin el módulo redirige al inicio", () => {
    const resultado = setup([ModuloCodigo.REVISION])();
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe(ROUTE.INICIO);
  });

  it("sin sesión redirige al inicio", () => {
    const resultado = setup(null)();
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe(ROUTE.INICIO);
  });
});
