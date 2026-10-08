import { TestBed } from "@angular/core/testing";
import { CasosStore } from "@/features/casos/casos.store";
import { AHORA, BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { FILTRO_TODOS } from "@/features/casos/constants/casos-constants";
import { AtajoFecha } from "@/features/casos/enums/atajo-fecha.enum";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { FiltroActivoId } from "@/features/casos/enums/filtro-activo.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { BandejaStore } from "@/features/casos/bandeja.store";
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

describe("BandejaStore", () => {
  async function setup(respuesta: ListaCasos = lista(20, "c2")) {
    const api = { listar: vi.fn().mockResolvedValue(respuesta) };
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
    await store.cambiarCategoria(tab);
    expect(ultimaConsulta(api)).toEqual({ limite: 20, categoria });
    expect(store.pagina()).toBe(1);
  });

  it("la pestaña Todos no manda categoría", async () => {
    const { api, store } = await setup();
    await store.cambiarCategoria(FiltroTab.RECLAMOS);
    await store.cambiarCategoria(FiltroTab.TODOS);
    expect(ultimaConsulta(api)).not.toHaveProperty("categoria");
  });

  it.each([
    [BandejaTab.POR_REVISAR, "clasificado"],
    [BandejaTab.EN_GESTION, "en-gestion"],
    [BandejaTab.DERIVADOS, "derivado"],
    [BandejaTab.RESUELTOS, "resuelto"],
    [BandejaTab.ARCHIVADOS, "archivado"],
  ])("la pestaña %s pide el estado «%s» y vuelve a la primera página", async (bandeja, estado) => {
    const { api, store } = await setup();
    await store.irASiguiente();
    await store.cambiarBandeja(bandeja);
    expect(ultimaConsulta(api)).toEqual({ limite: 20, estado });
    expect(store.pagina()).toBe(1);
  });

  it("la pestaña Todos no manda estado y es la de partida", async () => {
    const { api, store } = await setup();
    expect(store.bandeja()).toBe(BandejaTab.TODOS);
    await store.cambiarBandeja(BandejaTab.RESUELTOS);
    await store.cambiarBandeja(BandejaTab.TODOS);
    expect(ultimaConsulta(api)).not.toHaveProperty("estado");
  });

  it("los archivados se filtran por motivo en el servidor; otra pestaña no manda motivo", async () => {
    const { api, store } = await setup();
    await store.cambiarBandeja(BandejaTab.ARCHIVADOS);
    expect(store.verArchivados()).toBe(true);
    expect(ultimaConsulta(api)).toEqual({ limite: 20, estado: "archivado" });

    await store.cambiarMotivoArchivo("NO_CORRESPONDE");
    expect(ultimaConsulta(api)).toEqual({ limite: 20, estado: "archivado", motivoArchivo: "NO_CORRESPONDE" });
    expect(store.hayFiltros()).toBe(true);

    await store.cambiarBandeja(BandejaTab.RESUELTOS);
    expect(store.verArchivados()).toBe(false);
    expect(store.motivoArchivo()).toBe(FILTRO_TODOS);
    expect(ultimaConsulta(api)).toEqual({ limite: 20, estado: "resuelto" });
  });

  it("cambiar el motivo del archivo vuelve a la primera página", async () => {
    const { store } = await setup();
    await store.cambiarBandeja(BandejaTab.ARCHIVADOS);
    await store.irASiguiente();
    expect(store.pagina()).toBe(2);
    await store.cambiarMotivoArchivo("DATOS_INSUFICIENTES");
    expect(store.pagina()).toBe(1);
  });

  describe("rango de fechas", () => {
    it("Desde y Hasta se mandan como YYYY-MM-DD, vuelven a la primera página y se quitan con Limpiar", async () => {
      const { api, store } = await setup();
      await store.irASiguiente();
      await store.cambiarFechas("2026-10-01", "2026-10-07");
      expect(ultimaConsulta(api)).toEqual({ limite: 20, desde: "2026-10-01", hasta: "2026-10-07" });
      expect(store.pagina()).toBe(1);
      expect(store.hayFiltros()).toBe(true);

      await store.limpiarFechas();
      expect(ultimaConsulta(api)).toEqual({ limite: 20 });
      expect(store.hayFiltros()).toBe(false);
    });

    it("con un solo extremo, el otro queda abierto", async () => {
      const { api, store } = await setup();
      await store.cambiarFechas("2026-10-01", "");
      expect(ultimaConsulta(api)).toEqual({ limite: 20, desde: "2026-10-01" });
      await store.cambiarFechas("", "2026-10-07");
      expect(ultimaConsulta(api)).toEqual({ limite: 20, hasta: "2026-10-07" });
    });

    it("desde igual a hasta es un solo día y se acepta", async () => {
      const { api, store } = await setup();
      await store.cambiarFechas("2026-10-08", "2026-10-08");
      expect(store.errorFechas()).toBeNull();
      expect(ultimaConsulta(api)).toEqual({ limite: 20, desde: "2026-10-08", hasta: "2026-10-08" });
    });

    it("desde posterior a hasta deja el mensaje y no pide nada: la lista sigue con el último rango válido", async () => {
      const { api, store } = await setup();
      await store.cambiarFechas("2026-10-01", "2026-10-07");
      const antes = api.listar.mock.calls.length;
      await store.cambiarFechas("2026-10-09", "2026-10-07");
      expect(store.errorFechas()).toBe("La fecha «Desde» no puede ser posterior a «Hasta».");
      expect(api.listar.mock.calls.length).toBe(antes);
      expect(ultimaConsulta(api)).toEqual({ limite: 20, desde: "2026-10-01", hasta: "2026-10-07" });
    });

    it("el rango máximo es de 366 días; uno más se rechaza con su mensaje", async () => {
      const { api, store } = await setup();
      await store.cambiarFechas("2025-10-08", "2026-10-08");
      expect(store.errorFechas()).toBeNull();
      expect(ultimaConsulta(api)).toEqual({ limite: 20, desde: "2025-10-08", hasta: "2026-10-08" });

      const antes = api.listar.mock.calls.length;
      await store.cambiarFechas("2025-10-07", "2026-10-08");
      expect(store.errorFechas()).toBe("El rango de fechas no puede pasar de 366 días.");
      expect(api.listar.mock.calls.length).toBe(antes);
    });

    it("al corregir el rango el mensaje desaparece y se pide de nuevo", async () => {
      const { api, store } = await setup();
      await store.cambiarFechas("2026-10-09", "2026-10-07");
      expect(ultimaConsulta(api)).toEqual({ limite: 20 });
      await store.cambiarFechas("2026-10-05", "2026-10-07");
      expect(store.errorFechas()).toBeNull();
      expect(ultimaConsulta(api)).toEqual({ limite: 20, desde: "2026-10-05", hasta: "2026-10-07" });
    });

    it("repetir el mismo rango no vuelve a pedir", async () => {
      const { api, store } = await setup();
      await store.cambiarFechas("2026-10-01", "2026-10-07");
      const antes = api.listar.mock.calls.length;
      await store.cambiarFechas("2026-10-01", "2026-10-07");
      expect(api.listar.mock.calls.length).toBe(antes);
    });

    it.each([
      [AtajoFecha.HOY, { desde: "2026-10-08", hasta: "2026-10-08" }],
      [AtajoFecha.SIETE_DIAS, { desde: "2026-10-02", hasta: "2026-10-08" }],
      [AtajoFecha.TREINTA_DIAS, { desde: "2026-09-09", hasta: "2026-10-08" }],
      [AtajoFecha.ESTE_MES, { desde: "2026-10-01", hasta: "2026-10-08" }],
    ])("el atajo %s fija las fechas de Lima y las manda al servidor", async (atajo, rango) => {
      const { api, store } = await setup();
      await store.aplicarAtajo(atajo);
      expect(store.desde()).toBe(rango.desde);
      expect(store.hasta()).toBe(rango.hasta);
      expect(ultimaConsulta(api)).toEqual({ limite: 20, ...rango });
    });
  });

  it("combina pestaña, categoría, fechas, texto y establecimiento en una sola consulta", async () => {
    const { api, store } = await setup();
    await store.cambiarBandeja(BandejaTab.DERIVADOS);
    await store.cambiarCategoria(FiltroTab.QUEJAS);
    await store.cambiarEstablecimiento(HOSPITAL);
    await store.cambiarFechas("2026-10-01", "2026-10-07");
    store.escribirTexto("demora");
    await esperar();
    expect(ultimaConsulta(api)).toEqual({
      limite: 20,
      estado: "derivado",
      categoria: "queja",
      establecimiento: "6206",
      desde: "2026-10-01",
      hasta: "2026-10-07",
      texto: "demora",
    });
  });

  it("un código pegado sin los ceros se completa antes de preguntar al servidor", async () => {
    const { api, store } = await setup();
    store.escribirTexto("minsa-2026-17");
    await esperar();
    expect(ultimaConsulta(api)).toEqual({ limite: 20, texto: "MINSA-2026-000017" });
    expect(store.texto()).toBe("minsa-2026-17");
  });

  it("limpiarTexto vacía el buscador y vuelve a pedir sin texto", async () => {
    const { api, store } = await setup();
    store.escribirTexto("demora");
    await esperar();
    store.limpiarTexto();
    await esperar();
    expect(store.texto()).toBe("");
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

  it("limpiar quita pestañas, categoría, motivo, fechas, establecimiento y texto y vuelve a pedir una vez", async () => {
    const { api, store } = await setup();
    await store.cambiarCategoria(FiltroTab.QUEJAS);
    await store.cambiarBandeja(BandejaTab.ARCHIVADOS);
    await store.cambiarMotivoArchivo("NO_CORRESPONDE");
    await store.cambiarFechas("2026-10-01", "2026-10-07");
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
    expect(store.hayFechas()).toBe(false);
    expect(store.bandeja()).toBe(BandejaTab.TODOS);
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

    const lenta = store.cambiarCategoria(FiltroTab.QUEJAS);
    await store.cambiarCategoria(FiltroTab.RECLAMOS);
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

  describe("quitar un filtro", () => {
    async function conTodosLosFiltros() {
      const contexto = await setup();
      const { store } = contexto;
      await store.cambiarCategoria(FiltroTab.QUEJAS);
      await store.cambiarBandeja(BandejaTab.ARCHIVADOS);
      await store.cambiarMotivoArchivo("NO_CORRESPONDE");
      await store.cambiarFechas("2026-10-01", "2026-10-07");
      await store.cambiarEstablecimiento(HOSPITAL);
      store.escribirTexto("demora");
      await esperar();
      return contexto;
    }

    it("expone el texto y el rango que ya se pidieron, no lo que se está escribiendo", async () => {
      const { store } = await conTodosLosFiltros();
      expect(store.textoActivo()).toBe("demora");
      expect(store.rangoAplicado()).toEqual({ desde: "2026-10-01", hasta: "2026-10-07" });

      await store.cambiarFechas("2026-10-09", "2026-10-01");
      expect(store.rangoAplicado()).toEqual({ desde: "2026-10-01", hasta: "2026-10-07" });
    });

    it.each([
      [FiltroActivoId.ESTADO, { limite: 20, categoria: "queja", texto: "demora", establecimiento: "6206", desde: "2026-10-01", hasta: "2026-10-07" }],
      [FiltroActivoId.CATEGORIA, { limite: 20, estado: "archivado", motivoArchivo: "NO_CORRESPONDE", texto: "demora", establecimiento: "6206", desde: "2026-10-01", hasta: "2026-10-07" }],
      [FiltroActivoId.MOTIVO, { limite: 20, estado: "archivado", categoria: "queja", texto: "demora", establecimiento: "6206", desde: "2026-10-01", hasta: "2026-10-07" }],
      [FiltroActivoId.ESTABLECIMIENTO, { limite: 20, estado: "archivado", motivoArchivo: "NO_CORRESPONDE", categoria: "queja", texto: "demora", desde: "2026-10-01", hasta: "2026-10-07" }],
      [FiltroActivoId.FECHAS, { limite: 20, estado: "archivado", motivoArchivo: "NO_CORRESPONDE", categoria: "queja", texto: "demora", establecimiento: "6206" }],
      [FiltroActivoId.TEXTO, { limite: 20, estado: "archivado", motivoArchivo: "NO_CORRESPONDE", categoria: "queja", establecimiento: "6206", desde: "2026-10-01", hasta: "2026-10-07" }],
    ])("«%s» quita solo ese filtro y vuelve a la primera página", async (filtro, esperado) => {
      const { api, store } = await conTodosLosFiltros();
      await store.irASiguiente();
      expect(store.pagina()).toBe(2);

      await store.quitarFiltro(filtro);
      expect(store.pagina()).toBe(1);
      expect(ultimaConsulta(api)).toEqual(esperado);
    });

    it("quitar el estado también quita el motivo de archivo, que solo vale en Archivados", async () => {
      const { api, store } = await conTodosLosFiltros();
      await store.quitarFiltro(FiltroActivoId.ESTADO);
      expect(store.motivoArchivo()).toBe(FILTRO_TODOS);
      expect(ultimaConsulta(api)).not.toHaveProperty("motivoArchivo");
    });

    it("quitar el texto lo vacía al instante y una escritura pendiente no lo vuelve a aplicar", async () => {
      const { api, store } = await setup();
      store.escribirTexto("demora");
      await store.quitarFiltro(FiltroActivoId.TEXTO);
      await esperar();
      expect(store.texto()).toBe("");
      expect(store.textoActivo()).toBe("");
      expect(ultimaConsulta(api)).toEqual({ limite: 20 });
    });
  });
});
