import { TestBed } from "@angular/core/testing";
import { provideRouter } from "@angular/router";
import { CasosStore } from "@/features/casos/casos.store";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import type { CasosPorVencer } from "@/features/casos/types/caso.types";
import { AvisosCampana } from "./avisos-campana";

const AVISOS: CasosPorVencer = {
  total: 3,
  porVencer: 2,
  vencidos: 1,
  casos: [
    crearCaso({
      codigo: "MINSA-2026-000004",
      categoria: CategoriaCaso.DENUNCIA_CORRUPCION,
      plazo: { tipo: PlazoTipo.ATENCION, estado: PlazoEstado.POR_VENCER, venceEn: null, horasRestantes: 8 },
    }),
    crearCaso({
      codigo: "MINSA-2026-000005",
      categoria: CategoriaCaso.QUEJA,
      plazo: { tipo: PlazoTipo.ATENCION, estado: PlazoEstado.VENCIDO, venceEn: null, horasRestantes: -2 },
    }),
  ],
};

const SIN_AVISOS: CasosPorVencer = { total: 0, porVencer: 0, vencidos: 0, casos: [] };

describe("AvisosCampana", () => {
  async function setup(respuesta: CasosPorVencer = AVISOS) {
    const api = { porVencer: vi.fn().mockResolvedValue(respuesta) };
    TestBed.configureTestingModule({
      providers: [provideRouter([{ path: "casos", children: [] }]), { provide: IncidenciasApi, useValue: api }],
    });
    const fixture = TestBed.createComponent(AvisosCampana);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const campana = () => element.querySelector<HTMLButtonElement>("button[aria-controls]") as HTMLButtonElement;
    const panel = () => element.querySelector<HTMLElement>("[role='region']");
    const abrir = async () => {
      campana().click();
      await fixture.whenStable();
    };
    return { api, fixture, element, campana, panel, abrir, casos: TestBed.inject(CasosStore) };
  }

  afterEach(() => document.body.replaceChildren());

  it("al aparecer le pide los avisos al servidor una vez", async () => {
    const { api } = await setup();
    expect(api.porVencer).toHaveBeenCalledTimes(1);
  });

  it("muestra el contador de los casos por vencer y vencidos, y lo dice en su nombre accesible", async () => {
    const { element, campana } = await setup();
    expect(campana().getAttribute("aria-label")).toBe("Avisos: 3 casos por vencer");
    expect(element.querySelector("[data-contador]")?.textContent?.trim()).toBe("3");
  });

  it("con un solo caso lo dice en singular", async () => {
    const { campana } = await setup({ total: 1, porVencer: 1, vencidos: 0, casos: [AVISOS.casos[0]] });
    expect(campana().getAttribute("aria-label")).toBe("Avisos: 1 caso por vencer");
  });

  it("sin casos por vencer no muestra el contador", async () => {
    const { element, campana } = await setup(SIN_AVISOS);
    expect(element.querySelector("[data-contador]")).toBeNull();
    expect(campana().getAttribute("aria-label")).toBe("Avisos: sin casos por vencer");
  });

  it("el cambio del contador se anuncia a los lectores de pantalla", async () => {
    const { element } = await setup();
    expect(element.querySelector("[aria-live='polite']")?.textContent).toContain("3 casos por vencer");
  });

  it("empieza cerrada y al pulsar abre el panel", async () => {
    const { campana, panel, abrir } = await setup();
    expect(campana().getAttribute("aria-expanded")).toBe("false");
    expect(panel()).toBeNull();
    await abrir();
    expect(campana().getAttribute("aria-expanded")).toBe("true");
    expect(panel()?.getAttribute("aria-label")).toBe("Casos por vencer");
    expect(campana().getAttribute("aria-controls")).toBe(panel()?.id);
  });

  it("el panel resume cuántos están por vencer y cuántos vencidos", async () => {
    const { panel, abrir } = await setup();
    await abrir();
    expect(panel()?.textContent).toContain("2 por vencer");
    expect(panel()?.textContent).toContain("1 vencido");
  });

  it("el panel lista el código, la categoría y cuánto falta, con un enlace a cada caso", async () => {
    const { panel, abrir } = await setup();
    await abrir();
    const filas = Array.from(panel()?.querySelectorAll("tbody tr") ?? []);
    expect(filas).toHaveLength(2);
    expect(filas[0].textContent).toContain("MINSA-2026-000004");
    expect(filas[0].textContent).toContain("Denuncia por corrupción");
    expect(filas[0].textContent).toContain("Vence en 8 h");
    expect(filas[1].textContent).toContain("Vencido");
    const enlace = filas[0].querySelector("a") as HTMLAnchorElement;
    expect(enlace.getAttribute("href")).toContain("/casos?caso=MINSA-2026-000004");
  });

  it("sin casos el panel lo dice", async () => {
    const { panel, abrir } = await setup(SIN_AVISOS);
    await abrir();
    expect(panel()?.textContent).toContain("No tienes casos por vencer");
  });

  it("si fallan los avisos lo dice y permite reintentar", async () => {
    const { api, panel, abrir, fixture } = await setup();
    api.porVencer.mockRejectedValueOnce(new IncidenciaError(0, null));
    await abrir();
    await fixture.whenStable();
    expect(panel()?.textContent).toContain("No se pudieron cargar los avisos");

    api.porVencer.mockResolvedValueOnce(SIN_AVISOS);
    const reintentar = Array.from(panel()?.querySelectorAll("button") ?? []).find((boton) =>
      boton.textContent?.includes("Reintentar"),
    ) as HTMLButtonElement;
    reintentar.click();
    await fixture.whenStable();
    expect(panel()?.textContent).toContain("No tienes casos por vencer");
  });

  it("Escape cierra el panel y devuelve el foco a la campana", async () => {
    const { campana, panel, abrir, fixture } = await setup();
    await abrir();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await fixture.whenStable();
    expect(panel()).toBeNull();
    expect(document.activeElement).toBe(campana());
  });

  it("pulsar fuera del panel lo cierra", async () => {
    const { panel, abrir, fixture } = await setup();
    await abrir();
    document.body.click();
    await fixture.whenStable();
    expect(panel()).toBeNull();
  });

  it("elegir un caso cierra el panel", async () => {
    const { panel, abrir, fixture } = await setup();
    await abrir();
    (panel()?.querySelector("tbody a") as HTMLAnchorElement).click();
    await fixture.whenStable();
    expect(panel()).toBeNull();
  });

  it("el contador baja cuando una acción resuelve o deriva un caso", async () => {
    const { api, campana, casos, fixture } = await setup();
    expect(campana().getAttribute("aria-label")).toBe("Avisos: 3 casos por vencer");

    api.porVencer.mockResolvedValue({ total: 2, porVencer: 1, vencidos: 1, casos: AVISOS.casos });
    casos.cambios.update((cantidad) => cantidad + 1);
    TestBed.tick();
    await new Promise<void>((resolver) => setTimeout(resolver, 10));
    await fixture.whenStable();

    expect(campana().getAttribute("aria-label")).toBe("Avisos: 2 casos por vencer");
  });
});
