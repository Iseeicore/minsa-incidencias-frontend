import { TestBed } from "@angular/core/testing";
import { CasosStore } from "@/features/casos/casos.store";
import { BandejasStore } from "@/features/casos/bandejas.store";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import type { Caso, ListaCasos } from "@/features/casos/types/caso.types";
import type { ConsultaCasos } from "@/features/casos/types/incidencias-api.types";

function lista(casos: readonly Caso[], hayMas = false): ListaCasos {
  return { casos, siguiente: hayMas ? "cursor-2" : null, hayMas };
}

const esperar = (ms = 10) => new Promise<void>((resolver) => setTimeout(resolver, ms));

const DATOS: Record<string, ListaCasos> = {
  clasificado: lista([
    crearCaso({ codigo: "A", estado: EstadoCaso.CLASIFICADO, revisadoPorHumano: false, acciones: [AccionCaso.CONFIRMAR] }),
    crearCaso({ codigo: "B", estado: EstadoCaso.CLASIFICADO, revisadoPorHumano: true, acciones: [] }),
  ]),
  derivado: lista([crearCaso({ codigo: "C", estado: EstadoCaso.DERIVADO, acciones: [AccionCaso.TOMAR] })]),
  "en-gestion": lista([crearCaso({ codigo: "D", estado: EstadoCaso.EN_GESTION })]),
  resuelto: lista([crearCaso({ codigo: "F", estado: EstadoCaso.RESUELTO })]),
  archivado: lista([crearCaso({ codigo: "G", estado: EstadoCaso.ARCHIVADO })]),
};

describe("BandejasStore", () => {
  async function setup(datos: Record<string, ListaCasos> = DATOS) {
    const api = {
      listar: vi.fn(async (consulta: ConsultaCasos) => datos[consulta.estado ?? ""] ?? lista([])),
    };
    TestBed.configureTestingModule({ providers: [BandejasStore, { provide: IncidenciasApi, useValue: api }] });
    const store = TestBed.inject(BandejasStore);
    await esperar();
    return { api, store, casos: TestBed.inject(CasosStore) };
  }

  it("al crearse pide los cinco estados con hasta 100 casos cada uno, sin pedir orden ni página", async () => {
    const { api } = await setup();
    const consultas = api.listar.mock.calls.map(([consulta]) => consulta);
    expect(consultas).toHaveLength(5);
    expect(consultas.map((consulta) => consulta.estado).sort()).toEqual(
      ["archivado", "clasificado", "derivado", "en-gestion", "resuelto"].sort(),
    );
    for (const consulta of consultas) expect(consulta).toEqual({ estado: consulta.estado, limite: 100 });
  });

  it("reparte los casos en las siete bandejas con su cantidad", async () => {
    const { store } = await setup();
    expect(store.estadoCarga()).toBe(CargaEstado.LISTO);
    expect(store.casosDe(BandejaTab.PARA_ACTUAR).map((caso) => caso.codigo)).toEqual(["A", "C"]);
    expect(store.cantidad(BandejaTab.REVISION_IA)).toBe(1);
    expect(store.cantidad(BandejaTab.POR_DERIVAR)).toBe(1);
    expect(store.cantidad(BandejaTab.EN_GESTION)).toBe(2);
    expect(store.cantidad(BandejaTab.RESUELTOS)).toBe(1);
    expect(store.cantidad(BandejaTab.ARCHIVADOS)).toBe(1);
  });

  it("avisa cuando hay más casos de los que se traen", async () => {
    const { store } = await setup({ ...DATOS, archivado: lista(DATOS["archivado"].casos, true) });
    expect(store.hayCasosSinMostrar()).toBe(true);
  });

  it("no avisa cuando se trajo todo", async () => {
    const { store } = await setup();
    expect(store.hayCasosSinMostrar()).toBe(false);
  });

  it("si una de las cinco consultas falla, deja el mensaje y permite reintentar", async () => {
    const { api, store } = await setup();
    api.listar.mockImplementationOnce(async () => {
      throw new IncidenciaError(0, null);
    });
    await store.recargar();
    await esperar();
    expect(store.estadoCarga()).toBe(CargaEstado.ERROR);
    expect(store.error()).toContain("conectar");

    await store.recargar();
    await esperar();
    expect(store.estadoCarga()).toBe(CargaEstado.LISTO);
    expect(store.error()).toBeNull();
  });

  it("el motivo del archivo se manda solo en la consulta de archivados y vuelve a pedir las bandejas", async () => {
    const { api, store } = await setup();
    const antes = api.listar.mock.calls.length;
    await store.cambiarMotivoArchivo("VENCIDA_SIN_ATENDER");
    await esperar();
    const consultas = api.listar.mock.calls.slice(antes).map(([consulta]) => consulta);
    expect(consultas).toHaveLength(5);
    expect(consultas.find((consulta) => consulta.estado === "archivado")).toEqual({
      estado: "archivado",
      limite: 100,
      motivoArchivo: "VENCIDA_SIN_ATENDER",
    });
    for (const consulta of consultas.filter((otra) => otra.estado !== "archivado")) {
      expect(consulta.motivoArchivo).toBeUndefined();
    }
  });

  it("cuando una acción cambia algo, vuelve a pedir los cinco estados", async () => {
    const { api, casos } = await setup();
    const antes = api.listar.mock.calls.length;
    casos.cambios.update((cantidad) => cantidad + 1);
    TestBed.tick();
    await esperar();
    expect(api.listar.mock.calls.length).toBe(antes + 5);
  });
});
