import { TestBed } from "@angular/core/testing";
import { provideRouter, Router, type UrlTree } from "@angular/router";
import { ROUTE } from "@/shared/constants/routes";
import { authGuard } from "./auth.guard";
import { SessionStore } from "./session.store";

describe("authGuard", () => {
  function setup(store: Partial<SessionStore>) {
    TestBed.configureTestingModule({
      providers: [provideRouter([]), { provide: SessionStore, useValue: store }],
    });
    return () => TestBed.runInInjectionContext(() => authGuard({} as never, {} as never)) as Promise<boolean | UrlTree>;
  }

  it("deja pasar si ya hay sesión en memoria, sin volver a preguntar al backend", async () => {
    const cargar = vi.fn();
    const run = setup({ autenticado: (() => true) as never, cargar });
    expect(await run()).toBe(true);
    expect(cargar).not.toHaveBeenCalled();
  });

  it("si no hay sesión en memoria la pide al backend y deja pasar si existe", async () => {
    const cargar = vi.fn(async () => true);
    const run = setup({ autenticado: (() => false) as never, cargar });
    expect(await run()).toBe(true);
    expect(cargar).toHaveBeenCalledTimes(1);
  });

  it("sin sesión redirige al login", async () => {
    const run = setup({ autenticado: (() => false) as never, cargar: async () => false });
    const resultado = await run();
    expect(TestBed.inject(Router).serializeUrl(resultado as UrlTree)).toBe(ROUTE.LOGIN);
  });
});
