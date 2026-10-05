import { TestBed } from "@angular/core/testing";
import { CasosStore } from "@/features/casos/casos.store";
import { BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { FILTRO_TODOS } from "@/features/casos/constants/casos-constants";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { DireccionOrden, OrdenCaso } from "@/features/casos/enums/orden-caso.enum";
import { ListaCasosStore } from "@/features/casos/lista-casos.store";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import type { ListaCasos } from "@/features/casos/types/caso.types";

function lista(total: number, pagina = 1, cantidad = Math.min(total, 20)): ListaCasos {
  return {
    casos: Array.from({ length: cantidad }, (_, indice) => crearCaso({ codigo: `MINSA-2026-${String(indice + 1).padStart(6, "0")}` })),
    pagina,
    tamano: 20,
    total,
  };
}

const esperar = (ms = 15) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("ListaCasosStore", () => {
  async function setup(respuesta: ListaCasos = lista(45)) {
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

  it("al crearse carga la primera página: 20 por página y lo más antiguo primero", async () => {
    const { api } = await setup();
    expect(api.listar).toHaveBeenCalledTimes(1);
    expect(ultimaConsulta(api)).toEqual({ pagina: 1, tamano: 20, orden: OrdenCaso.FECHA, direccion: DireccionOrden.ASCENDENTE });
  });

  it("expone los casos, el total y las páginas", async () => {
    const { store } = await setup(lista(45));
    expect(store.estadoCarga()).toBe(CargaEstado.LISTO);
    expect(store.casos()).toHaveLength(20);
    expect(store.total()).toBe(45);
    expect(store.totalPaginas()).toBe(3);
    expect(store.vacio()).toBe(false);
  });

  it("sin casos queda vacío y sin páginas", async () => {
    const { store } = await setup(lista(0));
    expect(store.vacio()).toBe(true);
    expect(store.totalPaginas()).toBe(0);
  });

  it("irAPagina pide esa página", async () => {
    const { api, store } = await setup();
    await store.irAPagina(2);
    expect(ultimaConsulta(api).pagina).toBe(2);
    expect(store.pagina()).toBe(2);
  });

  it("una página fuera de rango se ajusta a los extremos", async () => {
    const { api, store } = await setup(lista(45));
    await store.irAPagina(0);
    expect(ultimaConsulta(api).pagina).toBe(1);
    await store.irAPagina(99);
    expect(ultimaConsulta(api).pagina).toBe(3);
  });

  it("ordenar por una columna sube; repetirla baja; otra columna vuelve a subir y regresa a la primera página", async () => {
    const { api, store } = await setup();
    await store.irAPagina(2);
    await store.ordenarPor(OrdenCaso.CODIGO);
    expect(ultimaConsulta(api)).toMatchObject({ orden: "codigo", direccion: "asc", pagina: 1 });
    await store.ordenarPor(OrdenCaso.CODIGO);
    expect(ultimaConsulta(api)).toMatchObject({ orden: "codigo", direccion: "desc" });
    await store.ordenarPor(OrdenCaso.ESTADO);
    expect(ultimaConsulta(api)).toMatchObject({ orden: "estado", direccion: "asc" });
  });

  it.each([
    [FiltroTab.RECLAMOS, "reclamo"],
    [FiltroTab.QUEJAS, "queja"],
    [FiltroTab.CORRUPCION, "denuncia-corrupcion"],
    [FiltroTab.OTRO, "otro"],
    [FiltroTab.SIN_CATEGORIA, "sin-categoria"],
  ])("la pestaña %s pide la categoría «%s» y vuelve a la primera página", async (tab, categoria) => {
    const { api, store } = await setup();
    await store.irAPagina(2);
    await store.cambiarTab(tab);
    expect(ultimaConsulta(api)).toMatchObject({ categoria, pagina: 1 });
  });

  it("la pestaña Todos no manda categoría", async () => {
    const { api, store } = await setup();
    await store.cambiarTab(FiltroTab.RECLAMOS);
    await store.cambiarTab(FiltroTab.TODOS);
    expect(ultimaConsulta(api)).not.toHaveProperty("categoria");
  });

  it("filtrar por estado lo manda al servidor y Todo estado lo quita", async () => {
    const { api, store } = await setup();
    await store.cambiarEstado("clasificado");
    expect(ultimaConsulta(api)).toMatchObject({ estado: "clasificado", pagina: 1 });
    await store.cambiarEstado(FILTRO_TODOS);
    expect(ultimaConsulta(api)).not.toHaveProperty("estado");
  });

  it("escribir en el buscador espera a que la persona termine y manda una sola consulta", async () => {
    const { api, store } = await setup();
    const antes = api.listar.mock.calls.length;
    store.escribirTexto("d");
    store.escribirTexto("de");
    store.escribirTexto("demora");
    await esperar();
    expect(api.listar.mock.calls.length).toBe(antes + 1);
    expect(ultimaConsulta(api)).toMatchObject({ texto: "demora", pagina: 1 });
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

  it("limpiar quita pestaña, estado y texto y vuelve a pedir una vez", async () => {
    const { api, store } = await setup();
    await store.cambiarTab(FiltroTab.QUEJAS);
    await store.cambiarEstado("derivado");
    store.escribirTexto("demora");
    await esperar();
    expect(store.hayFiltros()).toBe(true);

    const antes = api.listar.mock.calls.length;
    await store.limpiar();
    await esperar();
    expect(store.hayFiltros()).toBe(false);
    expect(store.texto()).toBe("");
    expect(api.listar.mock.calls.length).toBe(antes + 1);
    expect(ultimaConsulta(api)).toEqual({ pagina: 1, tamano: 20, orden: "fecha", direccion: "asc" });
  });

  it("un fallo deja el mensaje, conserva lo que había y permite reintentar", async () => {
    const { api, store } = await setup(lista(45));
    api.listar.mockRejectedValueOnce(new IncidenciaError(0, null));
    await store.irAPagina(2);
    expect(store.estadoCarga()).toBe(CargaEstado.ERROR);
    expect(store.error()).toContain("conectar");
    expect(store.casos()).toHaveLength(20);

    api.listar.mockResolvedValueOnce(lista(45, 2));
    await store.reintentar();
    expect(store.estadoCarga()).toBe(CargaEstado.LISTO);
    expect(store.error()).toBeNull();
  });

  it("la respuesta lenta de una consulta anterior no pisa a la más reciente", async () => {
    const { api, store } = await setup();
    let soltar!: (valor: ListaCasos) => void;
    api.listar.mockReturnValueOnce(new Promise<ListaCasos>((resolver) => (soltar = resolver)));
    api.listar.mockResolvedValueOnce({ ...lista(1), casos: [crearCaso({ codigo: "MINSA-2026-000099" })] });

    const lenta = store.cambiarTab(FiltroTab.QUEJAS);
    await store.cambiarTab(FiltroTab.RECLAMOS);
    soltar(lista(45));
    await lenta;

    expect(store.casos().map((caso) => caso.codigo)).toEqual(["MINSA-2026-000099"]);
  });

  it("cuando una acción cambia algo, vuelve a pedir la lista", async () => {
    const { api, casos } = await setup();
    const antes = api.listar.mock.calls.length;
    casos.cambios.update((cantidad) => cantidad + 1);
    TestBed.tick();
    await esperar();
    expect(api.listar.mock.calls.length).toBe(antes + 1);
  });

  it("si la página pedida quedó vacía porque se vaciaron casos, retrocede a la última que existe", async () => {
    const { api, store } = await setup(lista(45));
    api.listar.mockResolvedValueOnce({ casos: [], pagina: 3, tamano: 20, total: 40 });
    api.listar.mockResolvedValueOnce(lista(40, 2));
    await store.irAPagina(3);
    await esperar();
    expect(ultimaConsulta(api).pagina).toBe(2);
    expect(store.pagina()).toBe(2);
  });
});
