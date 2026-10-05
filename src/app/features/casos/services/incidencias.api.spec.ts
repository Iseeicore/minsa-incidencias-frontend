import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "@env/environment";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { DireccionOrden, OrdenCaso } from "@/features/casos/enums/orden-caso.enum";
import { crearDetalleDto, crearResumenDto } from "@/features/casos/testing/caso-builder";
import { IncidenciaError, RespuestaInvalidaError } from "./incidencia-error";
import { IncidenciasApi } from "./incidencias.api";

const BASE = `${environment.apiUrl}/incidencias`;

describe("IncidenciasApi", () => {
  function setup() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { api: TestBed.inject(IncidenciasApi), http: TestBed.inject(HttpTestingController) };
  }

  describe("listar", () => {
    it("pide la lista con cookies y solo manda los filtros que tienen valor", async () => {
      const { api, http } = setup();
      const resultado = api.listar({
        pagina: 2,
        tamano: 20,
        estado: "clasificado",
        categoria: "reclamo",
        texto: "demora",
        orden: OrdenCaso.CONFIANZA,
        direccion: DireccionOrden.DESCENDENTE,
      });
      const peticion = http.expectOne((req) => req.url === BASE);
      expect(peticion.request.method).toBe("GET");
      expect(peticion.request.withCredentials).toBe(true);
      expect(peticion.request.params.get("pagina")).toBe("2");
      expect(peticion.request.params.get("tamano")).toBe("20");
      expect(peticion.request.params.get("estado")).toBe("clasificado");
      expect(peticion.request.params.get("categoria")).toBe("reclamo");
      expect(peticion.request.params.get("texto")).toBe("demora");
      expect(peticion.request.params.get("orden")).toBe("confianza");
      expect(peticion.request.params.get("direccion")).toBe("desc");
      peticion.flush({ casos: [], pagina: 2, tamano: 20, total: 0 });
      await resultado;
    });

    it("no manda los parámetros vacíos", async () => {
      const { api, http } = setup();
      const resultado = api.listar({ pagina: 1, texto: "", estado: undefined });
      const peticion = http.expectOne((req) => req.url === BASE);
      expect(peticion.request.params.has("texto")).toBe(false);
      expect(peticion.request.params.has("estado")).toBe(false);
      peticion.flush({ casos: [], pagina: 1, tamano: 20, total: 0 });
      await resultado;
    });

    it("devuelve los casos ya traducidos al tipo del frontend, con la página y el total", async () => {
      const { api, http } = setup();
      const resultado = api.listar({});
      http.expectOne((req) => req.url === BASE).flush({
        casos: [crearResumenDto({ codigo: "MINSA-2026-000007", estado: "derivado", categoria: "queja", acciones: ["tomar"] })],
        pagina: 1,
        tamano: 20,
        total: 41,
      });
      const lista = await resultado;
      expect(lista.total).toBe(41);
      expect(lista.pagina).toBe(1);
      expect(lista.tamano).toBe(20);
      expect(lista.casos[0].codigo).toBe("MINSA-2026-000007");
      expect(lista.casos[0].estado).toBe(EstadoCaso.DERIVADO);
      expect(lista.casos[0].categoria).toBe(CategoriaCaso.QUEJA);
      expect(lista.casos[0].acciones).toEqual([AccionCaso.TOMAR]);
    });

    it("una respuesta con un estado inventado se rechaza", async () => {
      const { api, http } = setup();
      const resultado = api.listar({});
      http.expectOne((req) => req.url === BASE).flush({
        casos: [crearResumenDto({ estado: "inventado" })],
        pagina: 1,
        tamano: 20,
        total: 1,
      });
      await expect(resultado).rejects.toBeInstanceOf(RespuestaInvalidaError);
    });
  });

  describe("detalle", () => {
    it("pide un caso por su código con cookies", async () => {
      const { api, http } = setup();
      const resultado = api.detalle("MINSA-2026-000001");
      const peticion = http.expectOne(`${BASE}/MINSA-2026-000001`);
      expect(peticion.request.method).toBe("GET");
      expect(peticion.request.withCredentials).toBe(true);
      peticion.flush(crearDetalleDto({ descripcion: "Relato", reclamante: "Luis A. · DNI ••••1907" }));
      const caso = await resultado;
      expect(caso.descripcion).toBe("Relato");
      expect(caso.reclamante).toBe("Luis A. · DNI ••••1907");
    });

    it("escapa el código para que no altere la ruta", async () => {
      const { api, http } = setup();
      const resultado = api.detalle("a/b?c");
      const peticion = http.expectOne(`${BASE}/a%2Fb%3Fc`);
      peticion.flush(null, { status: 404, statusText: "Not Found" });
      await expect(resultado).rejects.toMatchObject({ estado: 404 });
    });

    it("un 404 se traduce a un IncidenciaError con ese estado", async () => {
      const { api, http } = setup();
      const resultado = api.detalle("MINSA-2026-000009");
      http.expectOne(`${BASE}/MINSA-2026-000009`).flush(
        { success: false, statusCode: 404, errorCode: "NOT_FOUND" },
        { status: 404, statusText: "Not Found" },
      );
      await expect(resultado).rejects.toBeInstanceOf(IncidenciaError);
      await expect(resultado).rejects.toMatchObject({ estado: 404, codigo: "NOT_FOUND" });
    });

    it("un fallo de red se traduce a estado 0", async () => {
      const { api, http } = setup();
      const resultado = api.detalle("MINSA-2026-000001");
      http.expectOne(`${BASE}/MINSA-2026-000001`).error(new ProgressEvent("error"));
      await expect(resultado).rejects.toMatchObject({ estado: 0 });
    });
  });

  describe("porVencer", () => {
    it("pide el resumen de la campana y traduce sus casos", async () => {
      const { api, http } = setup();
      const resultado = api.porVencer();
      const peticion = http.expectOne(`${BASE}/por-vencer`);
      expect(peticion.request.method).toBe("GET");
      expect(peticion.request.withCredentials).toBe(true);
      peticion.flush({ total: 3, porVencer: 2, vencidos: 1, casos: [crearResumenDto({ codigo: "MINSA-2026-000004" })] });
      const aviso = await resultado;
      expect(aviso.total).toBe(3);
      expect(aviso.porVencer).toBe(2);
      expect(aviso.vencidos).toBe(1);
      expect(aviso.casos[0].codigo).toBe("MINSA-2026-000004");
    });
  });

  describe("acciones", () => {
    it.each([
      ["confirmar", (api: IncidenciasApi) => api.confirmar("MINSA-2026-000001")],
      ["derivar", (api: IncidenciasApi) => api.derivar("MINSA-2026-000001")],
      ["tomar", (api: IncidenciasApi) => api.tomar("MINSA-2026-000001")],
    ])("%s hace un POST con cuerpo vacío y cookies", async (nombre, llamar) => {
      const { api, http } = setup();
      const resultado = llamar(api);
      const peticion = http.expectOne(`${BASE}/MINSA-2026-000001/${nombre}`);
      expect(peticion.request.method).toBe("POST");
      expect(peticion.request.body).toEqual({});
      expect(peticion.request.withCredentials).toBe(true);
      peticion.flush({ mensaje: "Hecho", caso: crearDetalleDto() });
      await expect(resultado).resolves.toMatchObject({ mensaje: "Hecho" });
    });

    it("corregir manda la categoría nueva", async () => {
      const { api, http } = setup();
      const resultado = api.corregir("MINSA-2026-000001", CategoriaCaso.QUEJA);
      const peticion = http.expectOne(`${BASE}/MINSA-2026-000001/corregir`);
      expect(peticion.request.body).toEqual({ categoria: "queja" });
      peticion.flush({ mensaje: "Corregida", caso: crearDetalleDto({ categoria: "queja" }) });
      await resultado;
    });

    it("resolver manda el texto de la resolución", async () => {
      const { api, http } = setup();
      const resultado = api.resolver("MINSA-2026-000001", "Se atendió");
      const peticion = http.expectOne(`${BASE}/MINSA-2026-000001/resolver`);
      expect(peticion.request.body).toEqual({ resolucion: "Se atendió" });
      peticion.flush({ mensaje: "Resuelto", caso: crearDetalleDto({ estado: "resuelto", resolucion: "Se atendió" }) });
      const respuesta = await resultado;
      expect(respuesta.caso?.estado).toBe(EstadoCaso.RESUELTO);
      expect(respuesta.caso?.resolucion).toBe("Se atendió");
    });

    it("si la corrección saca el caso de la vista, el caso viene null y el mensaje lo avisa", async () => {
      const { api, http } = setup();
      const resultado = api.corregir("MINSA-2026-000001", CategoriaCaso.DENUNCIA_CORRUPCION);
      http.expectOne(`${BASE}/MINSA-2026-000001/corregir`).flush({ mensaje: "Pasó al área", caso: null });
      await expect(resultado).resolves.toEqual({ mensaje: "Pasó al área", caso: null });
    });

    it("un 409 de la base se traduce a un error con ese estado", async () => {
      const { api, http } = setup();
      const resultado = api.confirmar("MINSA-2026-000001");
      http.expectOne(`${BASE}/MINSA-2026-000001/confirmar`).flush(
        { errorCode: "CONFLICT" },
        { status: 409, statusText: "Conflict" },
      );
      await expect(resultado).rejects.toMatchObject({ estado: 409, codigo: "CONFLICT" });
    });
  });
});
