import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router, type UrlTree } from "@angular/router";
import { ROUTE } from "@/shared/constants/routes";
import { VistaCodigo } from "@/shared/enums/vista-codigo.enum";
import { SessionStore } from "./session.store";
import { vistaGuard } from "./vista.guard";

describe("vistaGuard", () => {
  function setup(vistas: VistaCodigo[] | null, pedida: VistaCodigo = VistaCodigo.CASOS) {
    const sesion = signal(vistas ? { nombreCompleto: "Ana", correo: "ana@minsa.gob.pe", vistas } : null);
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SessionStore, useValue: { sesion } }],
    });
    return () => TestBed.runInInjectionContext(() => vistaGuard(pedida)({} as never, {} as never)) as boolean | UrlTree;
  }

  const destino = (resultado: boolean | UrlTree) => TestBed.inject(Router).serializeUrl(resultado as UrlTree);

  it("deja pasar si el usuario tiene la vista", () => {
    expect(setup([VistaCodigo.CASOS])()).toBe(true);
  });

  it("sin la vista redirige a la primera vista que sí tiene", () => {
    expect(destino(setup([VistaCodigo.CASOS, VistaCodigo.DERIVACIONES], VistaCodigo.QR)())).toBe(ROUTE.BANDEJA);
  });

  it("prefiere el inicio si el usuario lo tiene", () => {
    expect(destino(setup([VistaCodigo.INICIO, VistaCodigo.DERIVACIONES], VistaCodigo.CASOS)())).toBe(ROUTE.INICIO);
  });

  it("el gestor, sin la vista DERIVACIONES, no entra a /derivaciones y vuelve a su primera vista", () => {
    expect(destino(setup([VistaCodigo.INICIO, VistaCodigo.CASOS], VistaCodigo.DERIVACIONES)())).toBe(ROUTE.INICIO);
  });

  it("la vista QR deja pasar a quien la tiene", () => {
    expect(setup([VistaCodigo.INICIO, VistaCodigo.QR], VistaCodigo.QR)()).toBe(true);
  });

  it("sin la vista QR (gestor, OTRANS) redirige a su primera vista", () => {
    expect(destino(setup([VistaCodigo.INICIO, VistaCodigo.CASOS], VistaCodigo.QR)())).toBe(ROUTE.INICIO);
  });

  it("la vista USUARIOS deja pasar a quien la tiene", () => {
    expect(setup([VistaCodigo.INICIO, VistaCodigo.USUARIOS], VistaCodigo.USUARIOS)()).toBe(true);
  });

  it("sin la vista USUARIOS (gestor, OTRANS) redirige a su primera vista", () => {
    expect(destino(setup([VistaCodigo.CASOS], VistaCodigo.USUARIOS)())).toBe(ROUTE.BANDEJA);
  });

  it("si el servidor sigue mandando la vista BANDEJAS, la ignora y no se queda dando vueltas", () => {
    const vistas = ["BANDEJAS", "DERIVACIONES"] as unknown as VistaCodigo[];
    expect(destino(setup(vistas, VistaCodigo.CASOS)())).toBe(ROUTE.DERIVACIONES);
  });

  it("sin ninguna vista redirige a la página de sin acceso, sin dar vueltas", () => {
    expect(destino(setup([], VistaCodigo.INICIO)())).toBe(ROUTE.SIN_ACCESO);
  });

  it("sin sesión redirige al ingreso", () => {
    expect(destino(setup(null)())).toBe(ROUTE.LOGIN);
  });
});
