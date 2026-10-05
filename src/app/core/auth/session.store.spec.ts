import { TestBed } from "@angular/core/testing";
import { AuthService } from "./auth.service";
import { SessionStore } from "./session.store";

const SESION = { nombreCompleto: "Ana", correo: "ana@minsa.gob.pe", vistas: ["INICIO", "CASOS"] as const };

describe("SessionStore", () => {
  function setup(auth: Partial<AuthService>) {
    TestBed.configureTestingModule({ providers: [{ provide: AuthService, useValue: auth }] });
    return TestBed.inject(SessionStore);
  }

  it("empieza sin sesión", () => {
    const store = setup({});
    expect(store.autenticado()).toBe(false);
    expect(store.sesion()).toBeNull();
  });

  it("cargar() guarda la sesión que devuelve el backend y solo en memoria", async () => {
    const store = setup({ me: async () => ({ ...SESION, vistas: [...SESION.vistas] }) });
    expect(await store.cargar()).toBe(true);
    expect(store.autenticado()).toBe(true);
    expect(store.sesion()?.nombreCompleto).toBe("Ana");
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it("cargar() sin sesión deja el estado vacío", async () => {
    const store = setup({
      me: async () => {
        throw new Error("401");
      },
    });
    expect(await store.cargar()).toBe(false);
    expect(store.autenticado()).toBe(false);
  });

  it("cerrar() llama al backend y limpia la sesión aunque el backend falle", async () => {
    const logout = vi.fn(async () => {
      throw new Error("sin red");
    });
    const store = setup({ me: async () => ({ ...SESION, vistas: [...SESION.vistas] }), logout });
    await store.cargar();

    await expect(store.cerrar()).rejects.toThrow("sin red");
    expect(logout).toHaveBeenCalled();
    expect(store.autenticado()).toBe(false);
  });
});
