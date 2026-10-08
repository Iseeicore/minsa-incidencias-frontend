import { TestBed } from "@angular/core/testing";
import { AuthService } from "./auth.service";
import { SessionStore } from "./session.store";

const SESION = { nombreCompleto: "Ana", correo: "ana@minsa.gob.pe", vistas: ["INICIO", "CASOS"] as const, roles: ["GESTOR"] as const };
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
    const store = setup({ me: async () => ({ ...SESION, vistas: [...SESION.vistas], roles: [...SESION.roles], area: null }) });
    expect(await store.cargar()).toBe(true);
    expect(store.autenticado()).toBe(true);
    expect(store.sesion()?.nombreCompleto).toBe("Ana");
    expect(localStorage.length).toBe(0);
    expect(sessionStorage.length).toBe(0);
  });

  it("sin área (administrador) ve las áreas de todos; con área, solo la suya", async () => {
    const sinArea = setup({ me: async () => ({ ...SESION, vistas: [...SESION.vistas], roles: [...SESION.roles], area: null }) });
    expect(sinArea.veTodasLasAreas()).toBe(false);
    await sinArea.cargar();
    expect(sinArea.veTodasLasAreas()).toBe(true);
    expect(sinArea.area()).toBeNull();

    TestBed.resetTestingModule();
    const conArea = setup({ me: async () => ({ ...SESION, vistas: [...SESION.vistas], roles: [...SESION.roles], area: HOSPITAL }) });
    await conArea.cargar();
    expect(conArea.veTodasLasAreas()).toBe(false);
    expect(conArea.area()).toEqual(HOSPITAL);
  });

  it("esAdministrador solo es verdadero con el rol ADMINISTRADOR en la sesión", async () => {
    const admin = setup({ me: async () => ({ ...SESION, vistas: [...SESION.vistas], roles: ["ADMINISTRADOR"], area: null }) });
    expect(admin.esAdministrador()).toBe(false);
    await admin.cargar();
    expect(admin.esAdministrador()).toBe(true);

    TestBed.resetTestingModule();
    const gestor = setup({ me: async () => ({ ...SESION, vistas: [...SESION.vistas], roles: [...SESION.roles], area: null }) });
    await gestor.cargar();
    expect(gestor.esAdministrador()).toBe(false);
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
    const store = setup({ me: async () => ({ ...SESION, vistas: [...SESION.vistas], roles: [...SESION.roles], area: null }), logout });
    await store.cargar();

    await expect(store.cerrar()).rejects.toThrow("sin red");
    expect(logout).toHaveBeenCalled();
    expect(store.autenticado()).toBe(false);
  });
});
