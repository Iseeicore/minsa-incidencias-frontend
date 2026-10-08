import { TestBed } from "@angular/core/testing";
import { CasosStore } from "@/features/casos/casos.store";
import { AHORA, BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { FiltroActivoId } from "@/features/casos/enums/filtro-activo.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { BandejaStore } from "@/features/casos/bandeja.store";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import { conteo, crearConteos } from "@/features/casos/testing/conteos-builder";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import type { ListaCasos } from "@/features/casos/types/caso.types";
import type { Conteos } from "@/features/casos/types/conteos.types";
import { TipoArea } from "@/shared/enums/tipo-area.enum";

const LISTA: ListaCasos = { casos: [crearCaso({ codigo: "MINSA-2026-000001" })], siguiente: "c2", hayMas: true };
const HOSPITAL: AreaOpcion = {
  id: "10",
  codigo: "EESS-6206",
  nombre: "Hospital Dos de Mayo",
  tipoArea: TipoArea.ESTABLECIMIENTO,
  establecimiento: { codigoRenipress: "6206", nivelAtencion: null, categoria: null },
};
const esperar = (ms = 15) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("BandejaStore: conteos", () => {
  async function setup() {
    const api = {
      listar: vi.fn().mockResolvedValue(LISTA),
      conteos: vi.fn().mockResolvedValue(crearConteos()),
    };
    TestBed.configureTestingModule({
      providers: [
        BandejaStore,
        { provide: IncidenciasApi, useValue: api },
        { provide: BUSQUEDA_DEBOUNCE_MS, useValue: 0 },
        { provide: AHORA, useValue: () => new Date("2026-10-08T15:00:00Z") },
      ],
    });
    const store = TestBed.inject(BandejaStore);
    await esperar();
    return { api, store, casos: TestBed.inject(CasosStore) };
  }

  const ultima = (api: { conteos: ReturnType<typeof vi.fn> }) => api.conteos.mock.lastCall?.[0];

  it("al crearse pide los conteos una vez, sin límite ni cursor, y los expone", async () => {
    const { api, store } = await setup();
    expect(api.conteos).toHaveBeenCalledTimes(1);
    expect(ultima(api)).toEqual({});
    expect(store.conteos()).toEqual(crearConteos());
    expect(store.total()).toEqual(conteo(7));
  });

  it("cambiar de pestaña vuelve a pedirlos con el estado, porque el total depende de ella", async () => {
    const { api, store } = await setup();
    await store.cambiarBandeja(BandejaTab.POR_REVISAR);
    expect(api.conteos).toHaveBeenCalledTimes(2);
    expect(ultima(api)).toEqual({ estado: "clasificado" });
  });

  it("cambiar categoría, texto, fechas y establecimiento los vuelve a pedir con esos filtros", async () => {
    const { api, store } = await setup();
    await store.cambiarCategoria(FiltroTab.RECLAMOS);
    expect(ultima(api)).toEqual({ categoria: "reclamo" });
    store.escribirTexto("demora");
    await esperar();
    expect(ultima(api)).toEqual({ categoria: "reclamo", texto: "demora" });
    await store.cambiarFechas("2026-10-01", "2026-10-08");
    expect(ultima(api)).toEqual({ categoria: "reclamo", texto: "demora", desde: "2026-10-01", hasta: "2026-10-08" });
    await store.cambiarEstablecimiento(HOSPITAL);
    expect(ultima(api)).toMatchObject({ establecimiento: "6206" });
    expect(api.conteos).toHaveBeenCalledTimes(5);
  });

  it("el motivo del archivo viaja solo en Archivados", async () => {
    const { api, store } = await setup();
    await store.cambiarBandeja(BandejaTab.ARCHIVADOS);
    await store.cambiarMotivoArchivo("no-corresponde");
    expect(ultima(api)).toEqual({ estado: "archivado", motivoArchivo: "no-corresponde" });
  });

  it("quitar un filtro y limpiar todo vuelven a pedirlos", async () => {
    const { api, store } = await setup();
    await store.cambiarCategoria(FiltroTab.QUEJAS);
    await store.quitarFiltro(FiltroActivoId.CATEGORIA);
    expect(ultima(api)).toEqual({});
    await store.cambiarBandeja(BandejaTab.RESUELTOS);
    await store.limpiar();
    expect(ultima(api)).toEqual({});
    expect(api.conteos).toHaveBeenCalledTimes(5);
  });

  it("cambiar de página no los vuelve a pedir", async () => {
    const { api, store } = await setup();
    await store.irASiguiente();
    await store.irAAnterior();
    expect(api.conteos).toHaveBeenCalledTimes(1);
  });

  it("reaplicar las mismas fechas no pide nada nuevo", async () => {
    const { api, store } = await setup();
    await store.cambiarFechas("2026-10-01", "2026-10-08");
    await store.cambiarFechas("2026-10-01", "2026-10-08");
    expect(api.conteos).toHaveBeenCalledTimes(2);
  });

  it("tras una acción que cambia estados los recarga junto con la página", async () => {
    const { api, store, casos } = await setup();
    const antes = api.conteos.mock.calls.length;
    api.conteos.mockResolvedValue(crearConteos({ total: conteo(6) }));
    casos.cambios.update((cantidad) => cantidad + 1);
    TestBed.tick();
    await esperar();
    expect(api.conteos.mock.calls.length).toBe(antes + 1);
    expect(store.total()).toEqual(conteo(6));
  });

  it("una respuesta vieja no pisa a la más nueva", async () => {
    const { api, store } = await setup();
    let soltarVieja: (valor: Conteos) => void = () => undefined;
    api.conteos.mockImplementationOnce(() => new Promise<Conteos>((resolver) => (soltarVieja = resolver)));
    const lenta = store.cambiarCategoria(FiltroTab.QUEJAS);
    api.conteos.mockResolvedValueOnce(crearConteos({ total: conteo(2) }));
    await store.cambiarCategoria(FiltroTab.RECLAMOS);
    await esperar();
    soltarVieja(crearConteos({ total: conteo(99) }));
    await lenta;
    await esperar();
    expect(store.total()).toEqual(conteo(2));
  });

  it("si el conteo falla los números se ocultan y la lista queda intacta, sin error", async () => {
    const { api, store } = await setup();
    api.conteos.mockRejectedValue(new Error("caído"));
    await store.cambiarCategoria(FiltroTab.RECLAMOS);
    await esperar();
    expect(store.conteos()).toBeNull();
    expect(store.total()).toBeNull();
    expect(store.error()).toBeNull();
    expect(store.casos()).toHaveLength(1);
  });

  it("si el cliente de conteos lanza al instante, tampoco rompe la lista", async () => {
    const { api, store } = await setup();
    api.conteos.mockImplementation(() => {
      throw new Error("sin conexión");
    });
    await store.cambiarCategoria(FiltroTab.OTRO);
    await esperar();
    expect(store.conteos()).toBeNull();
    expect(store.casos()).toHaveLength(1);
  });

  it("Reintentar vuelve a pedir los conteos si faltaban", async () => {
    const { api, store } = await setup();
    api.conteos.mockRejectedValueOnce(new Error("caído"));
    await store.cambiarCategoria(FiltroTab.QUEJAS);
    await esperar();
    expect(store.conteos()).toBeNull();
    await store.reintentar();
    await esperar();
    expect(store.conteos()).toEqual(crearConteos());
  });
});
