import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { SessionStore } from "@/core/auth/session.store";
import { PLAZOS_TOKEN } from "@/core/config/plazos.config";
import { AHORA, BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { CasosStore } from "@/features/casos/casos.store";
import { AreasApi } from "@/features/casos/services/areas.api";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import { conteo, crearConteos } from "@/features/casos/testing/conteos-builder";
import type { Caso, ListaCasos } from "@/features/casos/types/caso.types";
import { BandejaPage } from "./bandeja-page";

const CASOS: readonly Caso[] = [
  crearCaso({ codigo: "MINSA-2026-000001" }),
  crearCaso({ codigo: "MINSA-2026-000002" }),
  crearCaso({ codigo: "MINSA-2026-000003" }),
];
const LISTA: ListaCasos = { casos: CASOS, siguiente: "cursor-2", hayMas: true };
const VACIA: ListaCasos = { casos: [], siguiente: null, hayMas: false };

const esperar = (ms = 15) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("BandejaPage: rediseño con conteos", () => {
  async function setup(lista: ListaCasos = LISTA, conteos: unknown = crearConteos()) {
    const api = {
      listar: vi.fn().mockResolvedValue(lista),
      conteos: vi.fn().mockImplementation(() => (conteos instanceof Error ? Promise.reject(conteos) : Promise.resolve(conteos))),
      detalle: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [BandejaPage],
      providers: [
        provideRouter([]),
        { provide: IncidenciasApi, useValue: api },
        { provide: SessionStore, useValue: { area: signal(null), veTodasLasAreas: signal(true) } },
        { provide: AreasApi, useValue: { listar: vi.fn().mockResolvedValue({ areas: [], siguiente: null, hayMas: false }) } },
        { provide: BUSQUEDA_DEBOUNCE_MS, useValue: 0 },
        { provide: AHORA, useValue: () => new Date("2026-10-08T15:00:00Z") },
        { provide: PLAZOS_TOKEN, useValue: { atencionDias: 5, vigenciaResolucionDias: 7, avisoHoras: 24 } },
      ],
    });
    const fixture = TestBed.createComponent(BandejaPage);
    document.body.appendChild(fixture.nativeElement);
    const asentar = async () => {
      await esperar();
      await fixture.whenStable();
    };
    await fixture.whenStable();
    await asentar();
    const element = fixture.nativeElement as HTMLElement;
    const pestanas = (etiqueta: string) =>
      Array.from(element.querySelectorAll<HTMLButtonElement>(`[role='tablist'][aria-label='${etiqueta}'] [role='tab']`));
    return { api, element, fixture, asentar, pestanas };
  }

  afterEach(() => document.body.replaceChildren());

  it("las pestañas de estado llevan su contador, con 1000+ cuando hay más", async () => {
    const { pestanas } = await setup();
    expect(pestanas("Estado del caso").map((tab) => tab.textContent?.replace(/\s+/g, " ").trim())).toEqual([
      "Por revisar 12",
      "En gestión 5",
      "Derivados 3",
      "Resueltos 1000+",
      "Archivados 9",
      "Todos 50",
    ]);
  });

  it("la barra de estados es una tarjeta blanca redondeada y la activa es oscura", async () => {
    const { element, pestanas } = await setup();
    const barra = element.querySelector("app-tabs") as HTMLElement;
    for (const clase of ["rounded-2xl", "bg-white", "p-2", "overflow-x-auto"]) expect(barra.className).toContain(clase);
    const activa = pestanas("Estado del caso").find((tab) => tab.getAttribute("aria-selected") === "true");
    expect(activa?.textContent).toContain("Todos");
    expect(activa?.className).toContain("bg-gray-900");
    expect(activa?.className).toContain("text-white");
  });

  it("el encabezado muestra el título, «N en la bandeja» del servidor y la ayuda", async () => {
    const { element } = await setup();
    expect(element.querySelector("h2")?.textContent).toContain("Todos");
    expect(element.textContent).toContain("7 en la bandeja");
    expect(element.textContent).toContain("Todos los casos que tu rol puede ver");
  });

  it("«Mostrando N de Y casos» usa los cargados de la página y el total del servidor, con aria-live", async () => {
    const { element } = await setup();
    const barra = Array.from(element.querySelectorAll("p[aria-live='polite']")).find((p) => p.textContent?.includes("Mostrando"));
    expect(barra?.textContent?.replace(/\s+/g, " ").trim()).toBe("Mostrando 3 de 7 casos");
  });

  it("un total acotado se muestra como 1000+", async () => {
    const { element } = await setup(LISTA, crearConteos({ total: conteo(1000, true) }));
    expect(element.textContent).toContain("1000+ en la bandeja");
    expect(element.textContent?.replace(/\s+/g, " ")).toContain("Mostrando 3 de 1000+ casos");
  });

  it("si el conteo falla se ocultan los números y «de Y», sin mensaje de error, y la lista sigue", async () => {
    const { element, pestanas } = await setup(LISTA, new Error("caído"));
    expect(pestanas("Estado del caso").map((tab) => tab.textContent?.trim())).toEqual([
      "Por revisar",
      "En gestión",
      "Derivados",
      "Resueltos",
      "Archivados",
      "Todos",
    ]);
    expect(element.textContent).not.toContain("en la bandeja");
    expect(element.textContent?.replace(/\s+/g, " ")).toContain("Mostrando 3 casos");
    expect(element.querySelector("app-alert")).toBeNull();
    expect(element.querySelectorAll("tbody tr")).toHaveLength(3);
  });

  it("el panel de filtros es gris redondeado con búsqueda, fechas, establecimiento y chips de categoría", async () => {
    const { element, pestanas } = await setup();
    const panel = element.querySelector("section[aria-label='Filtros']") as HTMLElement;
    for (const clase of ["rounded-2xl", "bg-gray-50", "p-4"]) expect(panel.className).toContain(clase);
    expect(panel.querySelector("app-search-input")).not.toBeNull();
    expect(panel.querySelectorAll("app-date-field")).toHaveLength(2);
    expect(panel.querySelector("app-area-selector")).not.toBeNull();
    expect(pestanas("Categoría").length).toBeGreaterThan(1);
    expect(panel.querySelector("[role='tablist'][aria-label='Categoría'] [aria-selected='true']")?.className).toContain("bg-gray-900");
  });

  it("no hay filtro por prioridad ni por estado: el estado lo cubren las pestañas", async () => {
    const { element } = await setup();
    const panel = element.querySelector("section[aria-label='Filtros']") as HTMLElement;
    expect(panel.querySelector("select")).toBeNull();
    expect(panel.textContent?.toLowerCase()).not.toContain("prioridad");
    expect(panel.textContent?.toLowerCase()).not.toContain("estado");
    expect(element.textContent).not.toContain("Datos de demostración");
  });

  it("cambiar de pestaña o de categoría vuelve a pedir los conteos; paginar no", async () => {
    const { api, fixture, element, pestanas, asentar } = await setup();
    expect(api.conteos).toHaveBeenCalledTimes(1);

    pestanas("Estado del caso")[0].click();
    await asentar();
    expect(api.conteos).toHaveBeenCalledTimes(2);
    expect(api.conteos.mock.lastCall?.[0]).toEqual({ estado: "clasificado" });

    pestanas("Categoría")[1].click();
    await asentar();
    expect(api.conteos).toHaveBeenCalledTimes(3);
    expect(api.conteos.mock.lastCall?.[0]).toMatchObject({ estado: "clasificado", categoria: "reclamo" });

    const siguiente = Array.from(element.querySelectorAll<HTMLButtonElement>("app-paginador-cursor button")).find((b) =>
      b.textContent?.includes("Siguiente"),
    );
    siguiente?.click();
    await fixture.whenStable();
    await asentar();
    expect(api.conteos).toHaveBeenCalledTimes(3);
  });

  it("después de una acción los números se recargan", async () => {
    const { api, asentar } = await setup();
    const antes = api.conteos.mock.calls.length;
    TestBed.inject(CasosStore).cambios.update((cantidad) => cantidad + 1);
    TestBed.tick();
    await asentar();
    expect(api.conteos.mock.calls.length).toBe(antes + 1);
  });

  describe("estado vacío", () => {
    it("sin filtros: recuadro punteado con el mensaje y sin botón", async () => {
      const { element } = await setup(VACIA);
      const recuadro = element.querySelector("div.border-dashed") as HTMLElement;
      expect(recuadro.className).toContain("rounded-2xl");
      expect(recuadro.textContent).toContain("No hay casos.");
      expect(recuadro.querySelector("button")).toBeNull();
    });

    it("con filtros: mensaje y botón Limpiar filtros que limpia", async () => {
      const { api, element, pestanas, asentar } = await setup(VACIA);
      pestanas("Categoría")[1].click();
      await asentar();
      const recuadro = element.querySelector("div.border-dashed") as HTMLElement;
      expect(recuadro.textContent).toContain("No hay casos con estos filtros.");
      recuadro.querySelector("button")?.click();
      await asentar();
      expect(api.listar.mock.lastCall?.[0]).toEqual({ limite: 20 });
      expect(api.conteos.mock.lastCall?.[0]).toEqual({});
    });
  });

  it("la nota al pie usa los plazos configurados", async () => {
    const { element } = await setup();
    expect(element.textContent).toContain(
      "Plazo de atención: 5 días desde que llega el caso. Una resolución dura 7 días. Pasado el plazo, el caso se archiva solo.",
    );
  });

  it("las pestañas de estado se manejan con el teclado", async () => {
    const { api, element, pestanas, asentar } = await setup();
    const lista = element.querySelector("[role='tablist'][aria-label='Estado del caso']") as HTMLElement;
    expect(pestanas("Estado del caso").map((tab) => tab.getAttribute("tabindex"))).toEqual(["-1", "-1", "-1", "-1", "-1", "0"]);
    lista.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    await asentar();
    expect(api.listar.mock.lastCall?.[0]).toEqual({ limite: 20, estado: "clasificado" });
  });
});
