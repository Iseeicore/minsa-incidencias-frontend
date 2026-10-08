import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "@env/environment";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { MotivoArchivo } from "@/features/casos/enums/motivo-archivo.enum";
import { NivelAtencion } from "@/features/casos/enums/nivel-atencion.enum";
import { ResultadoResolucion } from "@/features/casos/enums/resultado-resolucion.enum";
import { crearDetalleDto, crearResumenDto } from "@/features/casos/testing/caso-builder";
import { crearConteos, crearConteosDto } from "@/features/casos/testing/conteos-builder";
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
        limite: 20,
        cursor: "abc_DEF-1",
        estado: "clasificado",
        categoria: "reclamo",
        texto: "demora",
        establecimiento: "6206",
      });
      const peticion = http.expectOne((req) => req.url === BASE);
      expect(peticion.request.method).toBe("GET");
      expect(peticion.request.withCredentials).toBe(true);
      expect(peticion.request.params.get("limite")).toBe("20");
      expect(peticion.request.params.get("cursor")).toBe("abc_DEF-1");
      expect(peticion.request.params.get("estado")).toBe("clasificado");
      expect(peticion.request.params.get("categoria")).toBe("reclamo");
      expect(peticion.request.params.get("texto")).toBe("demora");
      expect(peticion.request.params.get("establecimiento")).toBe("6206");
      expect(peticion.request.params.has("pagina")).toBe(false);
      peticion.flush({ items: [], siguiente: null, hayMas: false });
      await resultado;
    });

    it("no manda los parámetros vacíos", async () => {
      const { api, http } = setup();
      const resultado = api.listar({ limite: 20, texto: "", estado: undefined, cursor: undefined });
      const peticion = http.expectOne((req) => req.url === BASE);
      expect(peticion.request.params.has("texto")).toBe(false);
      expect(peticion.request.params.has("estado")).toBe(false);
      expect(peticion.request.params.has("cursor")).toBe(false);
      peticion.flush({ items: [], siguiente: null, hayMas: false });
      await resultado;
    });

    it("devuelve los casos ya traducidos al tipo del frontend, con el cursor de la página siguiente", async () => {
      const { api, http } = setup();
      const resultado = api.listar({});
      http.expectOne((req) => req.url === BASE).flush({
        items: [crearResumenDto({ codigo: "MINSA-2026-000007", estado: "derivado", categoria: "queja", acciones: ["tomar"] })],
        siguiente: "cursor-2",
        hayMas: true,
      });
      const lista = await resultado;
      expect(lista.siguiente).toBe("cursor-2");
      expect(lista.hayMas).toBe(true);
      expect(lista.casos[0].codigo).toBe("MINSA-2026-000007");
      expect(lista.casos[0].estado).toBe(EstadoCaso.DERIVADO);
      expect(lista.casos[0].categoria).toBe(CategoriaCaso.QUEJA);
      expect(lista.casos[0].acciones).toEqual([AccionCaso.TOMAR]);
    });

    it("una respuesta con un estado inventado se rechaza", async () => {
      const { api, http } = setup();
      const resultado = api.listar({});
      http.expectOne((req) => req.url === BASE).flush({
        items: [crearResumenDto({ estado: "inventado" })],
        siguiente: null,
        hayMas: false,
      });
      await expect(resultado).rejects.toBeInstanceOf(RespuestaInvalidaError);
    });

    it("traduce el área destino y el establecimiento con su nivel y categoría", async () => {
      const { api, http } = setup();
      const resultado = api.listar({});
      http.expectOne((req) => req.url === BASE).flush({
        items: [
          crearResumenDto({
            area: { codigo: "EESS-5946", nombre: "Hospital Hipólito Unanue" },
            establecimiento: { codigoRenipress: "5946", nombre: "Hospital Hipólito Unanue", nivelAtencion: "III", categoria: "III-1" },
          }),
          crearResumenDto({ area: null, establecimiento: { codigoRenipress: "5614", nombre: "C.S. Bayóvar" } }),
          crearResumenDto({ area: null, establecimiento: null }),
        ],
        siguiente: null,
        hayMas: false,
      });
      const { casos } = await resultado;
      expect(casos[0].area).toEqual({ codigo: "EESS-5946", nombre: "Hospital Hipólito Unanue" });
      expect(casos[0].establecimiento).toEqual({
        codigoRenipress: "5946",
        nombre: "Hospital Hipólito Unanue",
        nivelAtencion: NivelAtencion.III,
        categoria: "III-1",
      });
      expect(casos[1].establecimiento).toMatchObject({ codigoRenipress: "5614", nivelAtencion: null, categoria: null });
      expect(casos[2].area).toBeNull();
      expect(casos[2].establecimiento).toBeNull();
    });

    it("un nivel de atención inventado se rechaza", async () => {
      const { api, http } = setup();
      const resultado = api.listar({});
      http.expectOne((req) => req.url === BASE).flush({
        items: [crearResumenDto({ establecimiento: { codigoRenipress: "1", nombre: "X", nivelAtencion: "IV", categoria: null } })],
        siguiente: null,
        hayMas: false,
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

  describe("conteos", () => {
    it("pide los conteos con los filtros del listado, sin límite ni cursor, y los traduce", async () => {
      const { api, http } = setup();
      const resultado = api.conteos({ estado: "clasificado", categoria: "reclamo", texto: "demora", desde: "2026-10-01" });
      const peticion = http.expectOne((req) => req.url === `${BASE}/conteos`);
      expect(peticion.request.method).toBe("GET");
      expect(peticion.request.withCredentials).toBe(true);
      expect(peticion.request.params.get("estado")).toBe("clasificado");
      expect(peticion.request.params.get("categoria")).toBe("reclamo");
      expect(peticion.request.params.get("texto")).toBe("demora");
      expect(peticion.request.params.get("desde")).toBe("2026-10-01");
      expect(peticion.request.params.has("limite")).toBe(false);
      expect(peticion.request.params.has("cursor")).toBe(false);
      peticion.flush(crearConteosDto());
      expect(await resultado).toEqual(crearConteos());
    });

    it("sin filtros no manda parámetros", async () => {
      const { api, http } = setup();
      const resultado = api.conteos({});
      const peticion = http.expectOne((req) => req.url === `${BASE}/conteos`);
      expect(peticion.request.params.keys()).toEqual([]);
      peticion.flush(crearConteosDto());
      await resultado;
    });

    it("traduce los errores del servidor", async () => {
      const { api, http } = setup();
      const resultado = api.conteos({});
      http.expectOne((req) => req.url === `${BASE}/conteos`).flush({}, { status: 500, statusText: "Error" });
      await expect(resultado).rejects.toBeInstanceOf(IncidenciaError);
    });

    it("rechaza una respuesta incompleta", async () => {
      const { api, http } = setup();
      const resultado = api.conteos({});
      http.expectOne((req) => req.url === `${BASE}/conteos`).flush({ todos: { cantidad: 1, conMas: false } });
      await expect(resultado).rejects.toThrow();
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

    it("derivar manda el código del área de destino", async () => {
      const { api, http } = setup();
      const resultado = api.derivar("MINSA-2026-000001", "EESS-6206");
      const peticion = http.expectOne(`${BASE}/MINSA-2026-000001/derivar`);
      expect(peticion.request.method).toBe("POST");
      expect(peticion.request.body).toEqual({ areaDestino: "EESS-6206" });
      expect(peticion.request.withCredentials).toBe(true);
      peticion.flush({ mensaje: "Derivado", caso: crearDetalleDto({ estado: "derivado" }) });
      await expect(resultado).resolves.toMatchObject({ mensaje: "Derivado" });
    });

    it("corregir manda la categoría nueva", async () => {
      const { api, http } = setup();
      const resultado = api.corregir("MINSA-2026-000001", CategoriaCaso.QUEJA);
      const peticion = http.expectOne(`${BASE}/MINSA-2026-000001/corregir`);
      expect(peticion.request.body).toEqual({ categoria: "queja" });
      peticion.flush({ mensaje: "Corregida", caso: crearDetalleDto({ categoria: "queja" }) });
      await resultado;
    });

    it("derivar sin área manda el cuerpo vacío: una denuncia de corrupción se queda en OTRANS", async () => {
      const { api, http } = setup();
      const resultado = api.derivar("MINSA-2026-000001");
      const peticion = http.expectOne(`${BASE}/MINSA-2026-000001/derivar`);
      expect(peticion.request.body).toEqual({});
      peticion.flush({ mensaje: "Derivado", caso: crearDetalleDto({ estado: "derivado" }) });
      await resultado;
    });

    it("resolver manda las medidas, el fundamento y el resultado, y traduce la resolución", async () => {
      const { api, http } = setup();
      const resultado = api.resolver("MINSA-2026-000001", {
        medidasTomadas: "Se entregó el medicamento",
        fundamento: "Había stock",
        resultado: ResultadoResolucion.ATENDIDO,
      });
      const peticion = http.expectOne(`${BASE}/MINSA-2026-000001/resolver`);
      expect(peticion.request.body).toEqual({
        medidasTomadas: "Se entregó el medicamento",
        fundamento: "Había stock",
        resultado: "ATENDIDO",
      });
      peticion.flush({
        mensaje: "Resuelto",
        caso: crearDetalleDto({
          estado: "resuelto",
          resolucion: { medidasTomadas: "Se entregó el medicamento", fundamento: "Había stock", resultado: "ATENDIDO" },
        }),
      });
      const respuesta = await resultado;
      expect(respuesta.caso?.estado).toBe(EstadoCaso.RESUELTO);
      expect(respuesta.caso?.resolucion).toEqual({
        medidasTomadas: "Se entregó el medicamento",
        fundamento: "Había stock",
        resultado: ResultadoResolucion.ATENDIDO,
      });
    });

    it("archivar manda el motivo y la justificación, y traduce el archivo", async () => {
      const { api, http } = setup();
      const resultado = api.archivar("MINSA-2026-000001", MotivoArchivo.NO_CORRESPONDE, "Es de otra institución");
      const peticion = http.expectOne(`${BASE}/MINSA-2026-000001/archivar`);
      expect(peticion.request.method).toBe("POST");
      expect(peticion.request.body).toEqual({ motivo: "NO_CORRESPONDE", detalle: "Es de otra institución" });
      peticion.flush({
        mensaje: "Archivado",
        caso: crearDetalleDto({
          estado: "archivado",
          archivo: { motivo: "NO_CORRESPONDE", detalle: "Es de otra institución", archivadoEn: "2026-10-08T12:00:00.000Z" },
        }),
      });
      const respuesta = await resultado;
      expect(respuesta.caso?.archivo).toEqual({
        motivo: MotivoArchivo.NO_CORRESPONDE,
        detalle: "Es de otra institución",
        archivadoEn: "2026-10-08T12:00:00.000Z",
      });
    });

    it("reabrir manda el motivo y traduce la última reapertura", async () => {
      const { api, http } = setup();
      const resultado = api.reabrir("MINSA-2026-000001", "Llegó información nueva");
      const peticion = http.expectOne(`${BASE}/MINSA-2026-000001/reabrir`);
      expect(peticion.request.body).toEqual({ motivo: "Llegó información nueva" });
      peticion.flush({
        mensaje: "Reabierto",
        caso: crearDetalleDto({ reapertura: { reabiertoEn: "2026-10-09T08:00:00.000Z", motivo: "Llegó información nueva" } }),
      });
      const respuesta = await resultado;
      expect(respuesta.caso?.reapertura).toEqual({ reabiertoEn: "2026-10-09T08:00:00.000Z", motivo: "Llegó información nueva" });
    });

    it("el listado manda estado y motivoArchivo cuando se piden los archivados", async () => {
      const { api, http } = setup();
      const resultado = api.listar({ estado: "archivado", motivoArchivo: "NO_CORRESPONDE", limite: 20 });
      const peticion = http.expectOne((req) => req.url === BASE);
      expect(peticion.request.params.get("estado")).toBe("archivado");
      expect(peticion.request.params.get("motivoArchivo")).toBe("NO_CORRESPONDE");
      peticion.flush({ items: [], siguiente: null, hayMas: false });
      await resultado;
    });

    it("si la corrección saca el caso de la vista, el caso viene null y el mensaje lo avisa", async () => {
      const { api, http } = setup();
      const resultado = api.corregir("MINSA-2026-000001", CategoriaCaso.DENUNCIA_CORRUPCION);
      http.expectOne(`${BASE}/MINSA-2026-000001/corregir`).flush({ mensaje: "Pasó al área", caso: null });
      await expect(resultado).resolves.toEqual({ mensaje: "Pasó al área", caso: null });
    });

    it("corregir a corrupción desde un establecimiento devuelve la respuesta mínima: sin caso y con el aviso a OTRANS", async () => {
      const { api, http } = setup();
      const resultado = api.corregir("MINSA-2026-000001", CategoriaCaso.DENUNCIA_CORRUPCION);
      http.expectOne(`${BASE}/MINSA-2026-000001/corregir`).flush({ codigo: "MINSA-2026-000001", enviadoAOtrans: true });
      await expect(resultado).resolves.toEqual({
        mensaje: "El caso MINSA-2026-000001 se envió a OTRANS.",
        caso: null,
        enviadoAOtrans: true,
      });
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
