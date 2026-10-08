import { TestBed } from "@angular/core/testing";
import { CasosStore } from "@/features/casos/casos.store";
import { BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { FILTRO_TODOS } from "@/features/casos/constants/casos-constants";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { ListaCasosStore } from "@/features/casos/lista-casos.store";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import type { ListaCasos } from "@/features/casos/types/caso.types";
import { TipoArea } from "@/shared/enums/tipo-area.enum";

function lista(cantidad: number, siguiente: string | null = null): ListaCasos {
  return {
    casos: Array.from({ length: cantidad }, (_, indice) => crearCaso({ codigo: `MINSA-2026-${String(indice + 1).padStart(6, "0")}` })),
    siguiente,
    hayMas: siguiente !== null,
  };
}

const HOSPITAL: AreaOpcion = {
  id: "10",
  codigo: "EESS-6206",
  nombre: "Hospital Dos de Mayo",
  tipoArea: TipoArea.ESTABLECIMIENTO,
  establecimiento: { codigoRenipress: "6206", nivelAtencion: null, categoria: null },
};

const esperar = (ms = 15) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("ListaCasosStore", () => {
  async function setup(respuesta: ListaCasos = lista(20, "c2")) {
    const api = { listar: vi.fn().mockResolvedValue(respuesta) };
    TestBed.configureTestingModule({
      providers: [
        ListaCasosStore,
        { provide: IncidenciasApi, useValue: api },
        { provide: BUSQUEDA_DEBOUNCE_MS, useValue: 0 },
      ],
    });
    const store = TestBed.inject(ListaCasosStore);
    await esperar();
    return { api, store, casos: TestBed.inject(CasosStore) };
  }

  const ultimaConsulta = (api: { listar: ReturnType<typeof vi.fn> }) => api.listar.mock.lastCall?.[0];

  it("al crearse carga la primera página: 20 casos y sin cursor", async () => {
    const { api } = await setup();
    expect(api.listar).toHaveBeenCalledTimes(1);
    expect(ultimaConsulta(api)).toEqual({ limite: 20 });
  });

  it("expone los casos, el cursor siguiente y si hay más, sin total", async () => {
    const { store } = await setup(lista(20, "c2"));
    expect(store.estadoCarga()).toBe(CargaEstado.LISTO);
    expect(store.casos()).toHaveLength(20);
    expect(store.siguiente()).toBe("c2");
    expect(store.hayMas()).toBe(true);
    expect(store.pagina()).toBe(1);
    expect(store.hayAnterior()).toBe(false);
    expect(store.vacio()).toBe(false);
  });

  it("sin casos queda vacío y sin más páginas", async () => {
    const { store } = await setup(lista(0));
    expect(store.vacio()).toBe(true);
    expect(store.hayMas()).toBe(false);
  });

  it("irASiguiente pide el cursor que mandó el servidor y guarda el anterior en la pila", async () => {
    const { api, store } = await setup(lista(20, "c2"));
    api.listar.mockResolvedValueOnce(lista(20, "c3"));
    await store.irASiguiente();
    expect(ultimaConsulta(api)).toEqual({ limite: 20, cursor: "c2" });
    expect(store.pagina()).toBe(2);
    expect(store.hayAnterior()).toBe(true);

    api.listar.mockResolvedValueOnce(lista(5));
    await store.irASiguiente();
    expect(ultimaConsulta(api)).toEqual({ limite: 20, cursor: "c3" });
    expect(store.pagina()).toBe(3);
    expect(store.hayMas()).toBe(false);
  });

  it("irAAnterior vuelve por la pila: primero a c2 y luego a la primera página, sin cursor", async () => {
    const { api, store } = await setup(lista(20, "c2"));
    api.listar.mockResolvedValueOnce(lista(20, "c3"));
    await store.irASiguiente();
    api.listar.mockResolvedValueOnce(lista(20, "c4"));
    await store.irASiguiente();

    api.listar.mockResolvedValueOnce(lista(20, "c3"));
    await store.irAAnterior();
    expect(ultimaConsulta(api)).toEqual({ limite: 20, cursor: "c2" });
    expect(store.pagina()).toBe(2);

    api.listar.mockResolvedValueOnce(lista(20, "c2"));
    await store.irAAnterior();
    expect(ultimaConsulta(api)).toEqual({ limite: 20 });
    expect(store.pagina()).toBe(1);
    expect(store.hayAnterior()).toBe(false);
  });

  it("sin siguiente o sin anterior no pide nada", async () => {
    const { api, store } = await setup(lista(3));
    const antes = api.listar.mock.calls.length;
    await store.irASiguiente();
    await store.irAAnterior();
    expect(api.listar.mock.calls.length).toBe(antes);
  });

  it.each([
    [FiltroTab.RECLAMOS, "reclamo"],
    [FiltroTab.QUEJAS, "queja"],
    [FiltroTab.CORRUPCION, "denuncia-corrupcion"],
    [FiltroTab.OTRO, "otro"],
    [FiltroTab.SIN_CATEGORIA, "sin-categoria"],
  ])("la pestaña %s pide la categoría «%s» y vuelve a la primera página", async (tab, categoria) => {
    const { api, store } = await setup();
    await store.irASiguiente();
    await store.cambiarTab(tab);
    expect(ultimaConsulta(api)).toEqual({ limite: 20, categoria });
    expect(store.pagina()).toBe(1);
  });

  it("la pestaña Todos no manda categoría", async () => {
    const { api, store } = await setup();
    await store.cambiarTab(FiltroTab.RECLAMOS);
    await store.cambiarTab(FiltroTab.TODOS);
    expect(ultimaConsulta(api)).not.toHaveProperty("categoria");
  });

  it("filtrar por estado lo manda al servidor, vuelve al principio, y Todo estado lo quita", async () => {
    const { api, store } = await setup();
    await store.irASiguiente();
    await store.cambiarEstado("clasificado");
    expect(ultimaConsulta(api)).toEqual({ limite: 20, estado: "clasificado" });
    expect(store.pagina()).toBe(1);
    await store.cambiarEstado(FILTRO_TODOS);
    expect(ultimaConsulta(api)).not.toHaveProperty("estado");
  });

  it("los archivados se filtran por motivo en el servidor; otro estado no manda motivo", async () => {
    const { api, store } = await setup();
    await store.cambiarEstado("archivado");
    expect(store.verArchivados()).toBe(true);
    expect(ultimaConsulta(api)).toEqual({ limite: 20, estado: "archivado" });

    await store.cambiarMotivoArchivo("NO_CORRESPONDE");
    expect(ultimaConsulta(api)).toEqual({ limite: 20, estado: "archivado", motivoArchivo: "NO_CORRESPONDE" });
    expect(store.hayFiltros()).toBe(true);

    await store.cambiarEstado("resuelto");
    expect(store.verArchivados()).toBe(false);
    expect(store.motivoArchivo()).toBe(FILTRO_TODOS);
    expect(ultimaConsulta(api)).toEqual({ limite: 20, estado: "resuelto" });
  });

  it("limpiar también quita el motivo del archivo", async () => {
    const { api, store } = await setup();
    await store.cambiarEstado("archivado");
    await store.cambiarMotivoArchivo("DATOS_INSUFICIENTES");
    await store.limpiar();
    expect(store.motivoArchivo()).toBe(FILTRO_TODOS);
    expect(ultimaConsulta(api)).toEqual({ limite: 20 });
  });

  it("filtrar por establecimiento manda su código RENIPRESS, vuelve al principio y se quita con null", async () => {
    const { api, store } = await setup();
    await store.irASiguiente();
    await store.cambiarEstablecimiento(HOSPITAL);
    expect(ultimaConsulta(api)).toEqual({ limite: 20, establecimiento: "6206" });
    expect(store.pagina()).toBe(1);
    expect(store.hayFiltros()).toBe(true);
    await store.cambiarEstablecimiento(null);
    expect(ultimaConsulta(api)).toEqual({ limite: 20 });
    expect(store.hayFiltros()).toBe(false);
  });

  it("escribir en el buscador espera a que la persona termine y manda una sola consulta desde el principio", async () => {
    const { api, store } = await setup();
    await store.irASiguiente();
    const antes = api.listar.mock.calls.length;
    store.escribirTexto("d");
    store.escribirTexto("de");
    store.escribirTexto("demora");
    await esperar();
    expect(api.listar.mock.calls.length).toBe(antes + 1);
    expect(ultimaConsulta(api)).toEqual({ limite: 20, texto: "demora" });
    expect(store.pagina()).toBe(1);
  });

  it("el texto no cambia entre dos escrituras iguales: no repite la consulta", async () => {
    const { api, store } = await setup();
    store.escribirTexto("demora");
    await esperar();
    const antes = api.listar.mock.calls.length;
    store.escribirTexto("demora ");
    await esperar();
    expect(api.listar.mock.calls.length).toBe(antes);
  });

  it("limpiar quita pestaña, estado, establecimiento y texto y vuelve a pedir una vez", async () => {
    const { api, store } = await setup();
    await store.cambiarTab(FiltroTab.QUEJAS);
    await store.cambiarEstado("derivado");
    await store.cambiarEstablecimiento(HOSPITAL);
    store.escribirTexto("demora");
    await esperar();
    expect(store.hayFiltros()).toBe(true);

    const antes = api.listar.mock.calls.length;
    await store.limpiar();
    await esperar();
    expect(store.hayFiltros()).toBe(false);
    expect(store.texto()).toBe("");
    expect(store.establecimiento()).toBeNull();
    expect(api.listar.mock.calls.length).toBe(antes + 1);
    expect(ultimaConsulta(api)).toEqual({ limite: 20 });
  });

  it("un fallo al pasar de página deja el mensaje, sigue en la página anterior y permite reintentar", async () => {
    const { api, store } = await setup(lista(20, "c2"));
    api.listar.mockRejectedValueOnce(new IncidenciaError(0, null));
    await store.irASiguiente();
    expect(store.estadoCarga()).toBe(CargaEstado.ERROR);
    expect(store.error()).toContain("conectar");
    expect(store.casos()).toHaveLength(20);
    expect(store.pagina()).toBe(1);

    await store.reintentar();
    expect(ultimaConsulta(api)).toEqual({ limite: 20 });
    expect(store.estadoCarga()).toBe(CargaEstado.LISTO);
    expect(store.error()).toBeNull();
  });

  it("la respuesta lenta de una consulta anterior no pisa a la más reciente", async () => {
    const { api, store } = await setup();
    let soltar!: (valor: ListaCasos) => void;
    api.listar.mockReturnValueOnce(new Promise<ListaCasos>((resolver) => (soltar = resolver)));
    api.listar.mockResolvedValueOnce({ casos: [crearCaso({ codigo: "MINSA-2026-000099" })], siguiente: null, hayMas: false });

    const lenta = store.cambiarTab(FiltroTab.QUEJAS);
    await store.cambiarTab(FiltroTab.RECLAMOS);
    soltar(lista(20, "c2"));
    await lenta;

    expect(store.casos().map((caso) => caso.codigo)).toEqual(["MINSA-2026-000099"]);
  });

  it("cuando una acción cambia algo, vuelve a pedir la página en la que está", async () => {
    const { api, store, casos } = await setup();
    api.listar.mockResolvedValueOnce(lista(20, "c3"));
    await store.irASiguiente();
    const antes = api.listar.mock.calls.length;
    casos.cambios.update((cantidad) => cantidad + 1);
    TestBed.tick();
    await esperar();
    expect(api.listar.mock.calls.length).toBe(antes + 1);
    expect(ultimaConsulta(api)).toEqual({ limite: 20, cursor: "c2" });
  });

  it("si la página quedó vacía porque se vaciaron casos, retrocede a la anterior", async () => {
    const { api, store } = await setup(lista(20, "c2"));
    api.listar.mockResolvedValueOnce({ casos: [], siguiente: null, hayMas: false });
    api.listar.mockResolvedValueOnce(lista(20));
    await store.irASiguiente();
    await esperar();
    expect(ultimaConsulta(api)).toEqual({ limite: 20 });
    expect(store.pagina()).toBe(1);
    expect(store.casos()).toHaveLength(20);
  });
});
