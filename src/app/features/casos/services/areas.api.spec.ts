import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "@env/environment";
import { NivelAtencion } from "@/features/casos/enums/nivel-atencion.enum";
import { TipoArea } from "@/shared/enums/tipo-area.enum";
import { AreasApi } from "./areas.api";
import { IncidenciaError, RespuestaInvalidaError } from "./incidencia-error";

const RUTA = `${environment.apiUrl}/areas`;

const HOSPITAL = {
  id: 10,
  codigo: "EESS-6206",
  nombre: "Hospital Dos de Mayo",
  tipoArea: "ESTABLECIMIENTO",
  establecimiento: { codigoRenipress: "6206", nivelAtencion: "III", categoria: "III-1" },
};

describe("AreasApi", () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { api: TestBed.inject(AreasApi), http: TestBed.inject(HttpTestingController) };
  }

  it("pide las áreas con cookies y solo manda los parámetros que tienen valor", async () => {
    const { api, http } = setup();
    const resultado = api.listar({ tipo: TipoArea.ESTABLECIMIENTO, q: "dos de mayo", limite: 8, cursor: undefined });
    const peticion = http.expectOne((req) => req.url === RUTA);
    expect(peticion.request.method).toBe("GET");
    expect(peticion.request.withCredentials).toBe(true);
    expect(peticion.request.params.get("tipo")).toBe("ESTABLECIMIENTO");
    expect(peticion.request.params.get("q")).toBe("dos de mayo");
    expect(peticion.request.params.get("limite")).toBe("8");
    expect(peticion.request.params.has("cursor")).toBe(false);
    peticion.flush({ items: [], siguiente: null, hayMas: false });
    await resultado;
  });

  it("traduce el área con su código, tipo y datos del establecimiento", async () => {
    const { api, http } = setup();
    const resultado = api.listar();
    http.expectOne((req) => req.url === RUTA).flush({ items: [HOSPITAL], siguiente: "c2", hayMas: true });
    const lista = await resultado;
    expect(lista.siguiente).toBe("c2");
    expect(lista.hayMas).toBe(true);
    expect(lista.areas[0]).toEqual({
      id: "10",
      codigo: "EESS-6206",
      nombre: "Hospital Dos de Mayo",
      tipoArea: TipoArea.ESTABLECIMIENTO,
      establecimiento: { codigoRenipress: "6206", nivelAtencion: NivelAtencion.III, categoria: "III-1" },
    });
  });

  it("un área sin establecimiento (OTRANS, DIRIS) lo deja en null", async () => {
    const { api, http } = setup();
    const resultado = api.listar();
    http
      .expectOne((req) => req.url === RUTA)
      .flush({ items: [{ id: "1", codigo: "OTRANS", nombre: "OTRANS", tipoArea: "OTRANS", establecimiento: null }], siguiente: null, hayMas: false });
    expect((await resultado).areas[0].establecimiento).toBeNull();
  });

  it("un tipo de área o un nivel inventado se rechaza", async () => {
    const { api, http } = setup();
    const tipo = api.listar();
    http.expectOne((req) => req.url === RUTA).flush({ items: [{ ...HOSPITAL, tipoArea: "OTRO" }], siguiente: null, hayMas: false });
    await expect(tipo).rejects.toBeInstanceOf(RespuestaInvalidaError);

    const nivel = api.listar();
    http
      .expectOne((req) => req.url === RUTA)
      .flush({ items: [{ ...HOSPITAL, establecimiento: { ...HOSPITAL.establecimiento, nivelAtencion: "V" } }], siguiente: null, hayMas: false });
    await expect(nivel).rejects.toBeInstanceOf(RespuestaInvalidaError);
  });

  it("un fallo se traduce a un IncidenciaError con el estado", async () => {
    const { api, http } = setup();
    const resultado = api.listar();
    http.expectOne((req) => req.url === RUTA).flush(null, { status: 403, statusText: "Forbidden" });
    await expect(resultado).rejects.toBeInstanceOf(IncidenciaError);
    await expect(resultado).rejects.toMatchObject({ estado: 403 });
  });
});
