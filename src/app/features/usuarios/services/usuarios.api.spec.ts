import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "@env/environment";
import { IncidenciaError, RespuestaInvalidaError } from "@/features/casos/services/incidencia-error";
import { crearUsuarioDto } from "@/features/usuarios/testing/usuario-builder";
import { RolCodigo } from "@/shared/enums/rol-codigo.enum";
import { UsuariosApi } from "./usuarios.api";

const BASE = `${environment.apiUrl}/usuarios`;
const ID = "11111111-1111-4111-8111-111111111111";

describe("UsuariosApi", () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { api: TestBed.inject(UsuariosApi), http: TestBed.inject(HttpTestingController) };
  }

  it("listar pide la lista con cookies, manda solo los filtros con valor y traduce los usuarios", async () => {
    const { api, http } = setup();
    const resultado = api.listar({ limite: 20, cursor: "abc", q: "rosa", area: "EESS-6206" });
    const peticion = http.expectOne((req) => req.url === BASE);
    expect(peticion.request.method).toBe("GET");
    expect(peticion.request.withCredentials).toBe(true);
    expect(peticion.request.params.get("limite")).toBe("20");
    expect(peticion.request.params.get("cursor")).toBe("abc");
    expect(peticion.request.params.get("q")).toBe("rosa");
    expect(peticion.request.params.get("area")).toBe("EESS-6206");
    peticion.flush({ items: [crearUsuarioDto(), crearUsuarioDto({ id: "2", rol: null, area: null })], siguiente: "c2", hayMas: true });
    const lista = await resultado;
    expect(lista.usuarios[0].rol).toBe(RolCodigo.GESTOR);
    expect(lista.usuarios[1]).toMatchObject({ rol: null, area: null });
    expect(lista.siguiente).toBe("c2");
    expect(lista.hayMas).toBe(true);
  });

  it("listar no manda parámetros vacíos", async () => {
    const { api, http } = setup();
    const resultado = api.listar({ limite: 20, q: "", area: undefined });
    const peticion = http.expectOne((req) => req.url === BASE);
    expect(peticion.request.params.keys()).toEqual(["limite"]);
    peticion.flush({ items: [], siguiente: null, hayMas: false });
    await resultado;
  });

  it("crear manda los datos y devuelve el usuario con la clave inicial", async () => {
    const { api, http } = setup();
    const resultado = api.crear({ nombreCompleto: "Rosa Quispe", correo: "rosa@minsa.gob.pe", rol: RolCodigo.GESTOR, area: "EESS-6206" });
    const peticion = http.expectOne(BASE);
    expect(peticion.request.method).toBe("POST");
    expect(peticion.request.withCredentials).toBe(true);
    expect(peticion.request.body).toEqual({ nombreCompleto: "Rosa Quispe", correo: "rosa@minsa.gob.pe", rol: "GESTOR", area: "EESS-6206" });
    peticion.flush({ usuario: crearUsuarioDto(), claveInicial: "Abc234Def567Ghj89Kmn" }, { status: 201, statusText: "Created" });
    const creado = await resultado;
    expect(creado.usuario.nombreCompleto).toBe("Rosa Quispe");
    expect(creado.claveInicial).toBe("Abc234Def567Ghj89Kmn");
  });

  it("actualizar hace un PATCH con los cambios y devuelve el usuario", async () => {
    const { api, http } = setup();
    const resultado = api.actualizar(ID, { activo: false });
    const peticion = http.expectOne(`${BASE}/${ID}`);
    expect(peticion.request.method).toBe("PATCH");
    expect(peticion.request.body).toEqual({ activo: false });
    peticion.flush({ usuario: crearUsuarioDto({ activo: false }) });
    expect((await resultado).activo).toBe(false);
  });

  it("restablecerClave hace un POST sin cuerpo y devuelve la clave nueva", async () => {
    const { api, http } = setup();
    const resultado = api.restablecerClave(ID);
    const peticion = http.expectOne(`${BASE}/${ID}/restablecer-clave`);
    expect(peticion.request.method).toBe("POST");
    expect(peticion.request.withCredentials).toBe(true);
    peticion.flush({ usuario: crearUsuarioDto(), claveInicial: "Nueva234Clave567Xyz" });
    expect((await resultado).claveInicial).toBe("Nueva234Clave567Xyz");
  });

  it("un error del servidor se traduce con su estado y su código", async () => {
    const { api, http } = setup();
    const resultado = api.crear({ nombreCompleto: "Rosa", correo: "rosa@minsa.gob.pe", rol: RolCodigo.GESTOR });
    http.expectOne(BASE).flush({ errorCode: "CORREO_REPETIDO" }, { status: 409, statusText: "Conflict" });
    await expect(resultado).rejects.toBeInstanceOf(IncidenciaError);
    await expect(resultado).rejects.toMatchObject({ estado: 409, codigo: "CORREO_REPETIDO" });
  });

  it("un rol desconocido se rechaza", async () => {
    const { api, http } = setup();
    const resultado = api.listar({});
    http.expectOne((req) => req.url === BASE).flush({ items: [crearUsuarioDto({ rol: "SUPERMAN" })], siguiente: null, hayMas: false });
    await expect(resultado).rejects.toBeInstanceOf(RespuestaInvalidaError);
  });
});
