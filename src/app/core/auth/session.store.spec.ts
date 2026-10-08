import { TestBed } from "@angular/core/testing";
import { AuthService } from "./auth.service";
import { SessionStore } from "./session.store";

const SESION = { nombreCompleto: "Ana", correo: "ana@minsa.gob.pe", vistas: ["INICIO", "CASOS"] as const };
const HOSPITAL = { codigo: "EESS-6206", nombre: "Hospital Dos de Mayo", tipo: "ESTABLECIMIENTO" } as const;

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
    const store = setup({ me: async () => ({ ...SESION, vistas: [...SESION.vistas], area: null }) });
    expect(await store.cargar()).toBe(true);
    expect(store.autenticado()).toBe(true);
    expect(store.sesion()?.nombreCompleto).toBe("Ana");
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it("sin área (administrador o gestor) ve las áreas de todos; con área, solo la suya", async () => {
    const sinArea = setup({ me: async () => ({ ...SESION, vistas: [...SESION.vistas], area: null }) });
    expect(sinArea.veTodasLasAreas()).toBe(false);
    await sinArea.cargar();
    expect(sinArea.veTodasLasAreas()).toBe(true);
    expect(sinArea.area()).toBeNull();

    TestBed.resetTestingModule();
    const conArea = setup({ me: async () => ({ ...SESION, vistas: [...SESION.vistas], area: HOSPITAL }) });
    await conArea.cargar();
    expect(conArea.veTodasLasAreas()).toBe(false);
    expect(conArea.area()).toEqual(HOSPITAL);
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
    const store = setup({ me: async () => ({ ...SESION, vistas: [...SESION.vistas], area: null }), logout });
    await store.cargar();

    await expect(store.cerrar()).rejects.toThrow("sin red");
    expect(logout).toHaveBeenCalled();
    expect(store.autenticado()).toBe(false);
  });
});
