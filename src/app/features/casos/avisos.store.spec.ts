import { TestBed } from "@angular/core/testing";
import { AvisosStore } from "@/features/casos/avisos.store";
import { CasosStore } from "@/features/casos/casos.store";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import type { CasosPorVencer } from "@/features/casos/types/caso.types";

const AVISOS: CasosPorVencer = { total: 3, porVencer: 2, vencidos: 1, casos: [crearCaso({ codigo: "MINSA-2026-000004" })] };

const esperar = (ms = 10) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("AvisosStore", () => {
  function setup() {
    const api = { porVencer: vi.fn().mockResolvedValue(AVISOS) };
    TestBed.configureTestingModule({ providers: [{ provide: IncidenciasApi, useValue: api }] });
    return { api, store: TestBed.inject(AvisosStore), casos: TestBed.inject(CasosStore) };
  }

  it("sin datos el contador es cero", () => {
    const { store } = setup();
    expect(store.contador()).toBe(0);
    expect(store.estadoCarga()).toBe(CargaEstado.INICIAL);
  });

  it("refrescar carga los avisos y el contador suma lo por vencer y lo vencido", async () => {
    const { api, store } = setup();
    await store.refrescar();
    expect(api.porVencer).toHaveBeenCalledTimes(1);
    expect(store.estadoCarga()).toBe(CargaEstado.LISTO);
    expect(store.contador()).toBe(3);
    expect(store.casos().map((caso) => caso.codigo)).toEqual(["MINSA-2026-000004"]);
  });

  it("un fallo deja el mensaje y el contador no se inventa", async () => {
    const { api, store } = setup();
    api.porVencer.mockRejectedValueOnce(new IncidenciaError(0, null));
    await store.refrescar();
    expect(store.estadoCarga()).toBe(CargaEstado.ERROR);
    expect(store.error()).toContain("avisos");
    expect(store.contador()).toBe(0);
  });

  it("un fallo posterior conserva el último contador que se conocía", async () => {
    const { api, store } = setup();
    await store.refrescar();
    api.porVencer.mockRejectedValueOnce(new IncidenciaError(500, null));
    await store.refrescar();
    expect(store.estadoCarga()).toBe(CargaEstado.ERROR);
    expect(store.contador()).toBe(3);
  });

  it("la respuesta lenta de una consulta anterior no pisa a la más reciente", async () => {
    const { api, store } = setup();
    let soltar!: (valor: CasosPorVencer) => void;
    api.porVencer.mockReturnValueOnce(new Promise<CasosPorVencer>((resolver) => (soltar = resolver)));
    api.porVencer.mockResolvedValueOnce({ total: 1, porVencer: 1, vencidos: 0, casos: [] });

    const lenta = store.refrescar();
    await store.refrescar();
    soltar(AVISOS);
    await lenta;

    expect(store.contador()).toBe(1);
  });

  it("cuando una acción cambia algo, vuelve a pedir los avisos", async () => {
    const { api, store, casos } = setup();
    await store.refrescar();
    TestBed.tick();
    const antes = api.porVencer.mock.calls.length;

    casos.cambios.update((cantidad) => cantidad + 1);
    TestBed.tick();
    await esperar();

    expect(api.porVencer.mock.calls.length).toBe(antes + 1);
  });
});
