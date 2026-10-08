import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { SessionStore } from "@/core/auth/session.store";
import { CasosStore } from "@/features/casos/casos.store";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import { crearCaso, crearDetalle } from "@/features/casos/testing/caso-builder";
import type { AreaSesion } from "@/core/auth/auth.types";
import type { Caso, ListaCasos } from "@/features/casos/types/caso.types";
import type { ConsultaCasos } from "@/features/casos/types/incidencias-api.types";
import { BandejasPage } from "./bandejas-page";

function lista(casos: readonly Caso[], hayMas = false): ListaCasos {
  return { casos, siguiente: hayMas ? "cursor-2" : null, hayMas };
}

const esperar = (ms = 15) => new Promise<void>((resolver) => setTimeout(resolver, ms));

function datosBase(): Record<string, ListaCasos> {
  return {
    clasificado: lista([
      crearCaso({ codigo: "MINSA-2026-000001", estado: EstadoCaso.CLASIFICADO, revisadoPorHumano: false, acciones: [AccionCaso.CONFIRMAR] }),
      crearCaso({ codigo: "MINSA-2026-000002", estado: EstadoCaso.CLASIFICADO, revisadoPorHumano: true }),
    ]),
    derivado: lista([crearCaso({ codigo: "MINSA-2026-000003", estado: EstadoCaso.DERIVADO, acciones: [AccionCaso.TOMAR] })]),
    "en-gestion": lista([crearCaso({ codigo: "MINSA-2026-000004", estado: EstadoCaso.EN_GESTION })]),
    resuelto: lista([]),
    archivado: lista([crearCaso({ codigo: "MINSA-2026-000009", estado: EstadoCaso.ARCHIVADO })]),
  };
}

function resueltos(cantidad: number): Caso[] {
  return Array.from({ length: cantidad }, (_, indice) =>
    crearCaso({ codigo: `MINSA-2026-${String(indice + 100).padStart(6, "0")}`, estado: EstadoCaso.RESUELTO }),
  );
}

describe("BandejasPage", () => {
  async function setup(datos: Record<string, ListaCasos> = datosBase(), area: AreaSesion | null = null) {
    const api = {
      listar: vi.fn(async (consulta: ConsultaCasos) => datos[consulta.estado ?? ""] ?? lista([])),
      detalle: vi.fn().mockResolvedValue(crearDetalle({ codigo: "MINSA-2026-000001", acciones: [AccionCaso.CONFIRMAR] })),
    };
    TestBed.configureTestingModule({
      imports: [BandejasPage],
      providers: [
        { provide: IncidenciasApi, useValue: api },
        { provide: SessionStore, useValue: { area: signal(area) } },
      ],
    });
    const fixture = TestBed.createComponent(BandejasPage);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await esperar();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const pestanas = () => Array.from(element.querySelectorAll<HTMLButtonElement>("[role='tab']"));
    const pestana = (texto: string) => pestanas().find((tab) => tab.textContent?.includes(texto)) as HTMLButtonElement;
    const filas = () => element.querySelectorAll("tbody tr").length;
    const cantidad = (tab: HTMLButtonElement) => Number(/\((\d+)\)/.exec(tab.textContent ?? "")?.[1]);
    const elegir = async (texto: string) => {
      pestana(texto).click();
      await fixture.whenStable();
    };
    const siguiente = async () => {
      element.querySelector<HTMLButtonElement>("button[aria-label='Página siguiente']")?.click();
      await fixture.whenStable();
    };
    return { api, element, fixture, pestanas, pestana, filas, cantidad, elegir, siguiente };
  }

  afterEach(() => document.body.replaceChildren());

  it("muestra el título, sin etiqueta de demostración ni selector de rol", async () => {
    const { element } = await setup();
    expect(element.querySelector("h1")?.textContent).toContain("Mis bandejas");
    expect(element.textContent).not.toContain("Datos de demostración");
    expect(element.textContent).not.toContain("Ver como");
  });

  it("muestra las siete bandejas con su cantidad", async () => {
    const { pestanas } = await setup();
    expect(pestanas().map((tab) => tab.textContent?.trim())).toEqual([
      "Para actuar (2)",
      "En revisión IA (1)",
      "Por derivar (1)",
      "En gestión (2)",
      "Por vencer (0)",
      "Resueltos (0)",
      "Archivados (1)",
    ]);
  });

  it("ya no ofrece las bandejas que la base no respalda (asignados, devueltos, vencidos)", async () => {
    const { element } = await setup();
    const texto = element.textContent ?? "";
    expect(texto).not.toContain("Asignados a mí");
    expect(texto).not.toContain("Devueltos");
    expect(texto).not.toContain("Vencidos");
  });

  it("empieza en Para actuar y su cantidad coincide con las filas", async () => {
    const { pestanas, filas, cantidad } = await setup();
    expect(pestanas()[0].getAttribute("aria-selected")).toBe("true");
    expect(filas()).toBe(cantidad(pestanas()[0]));
    expect(filas()).toBe(2);
  });

  it("al cambiar de bandeja muestra sus casos", async () => {
    const { element, elegir, filas } = await setup();
    await elegir("Archivados");
    expect(filas()).toBe(1);
    expect(element.textContent).toContain("MINSA-2026-000009");
  });

  it("solo la bandeja Archivados ofrece filtrar por motivo, y al elegirlo lo pide al servidor", async () => {
    const { api, element, elegir, fixture } = await setup();
    expect(element.textContent).not.toContain("Todos los motivos");
    await elegir("Archivados");
    expect(element.textContent).toContain("Todos los motivos");

    const select = element.querySelector<HTMLSelectElement>("app-select-field select") as HTMLSelectElement;
    select.value = "NO_CORRESPONDE";
    select.dispatchEvent(new Event("change"));
    await fixture.whenStable();
    await esperar();
    await fixture.whenStable();
    expect(api.listar).toHaveBeenCalledWith({ estado: "archivado", limite: 100, motivoArchivo: "NO_CORRESPONDE" });

    await elegir("Resueltos");
    expect(element.textContent).not.toContain("Todos los motivos");
  });

  it("un caso archivado se abre para reabrirlo", async () => {
    const { api, element, elegir, fixture } = await setup({
      ...datosBase(),
      archivado: lista([crearCaso({ codigo: "MINSA-2026-000009", estado: EstadoCaso.ARCHIVADO, acciones: [AccionCaso.REABRIR] })]),
    });
    api.detalle.mockResolvedValue(
      crearDetalle({ codigo: "MINSA-2026-000009", estado: EstadoCaso.ARCHIVADO, acciones: [AccionCaso.REABRIR] }),
    );
    await elegir("Archivados");
    const revisar = Array.from(element.querySelectorAll<HTMLButtonElement>("tbody button")).find((boton) =>
      boton.textContent?.includes("Revisar"),
    ) as HTMLButtonElement;
    revisar.click();
    await fixture.whenStable();
    await esperar();
    await fixture.whenStable();
    const botones = Array.from(element.querySelectorAll<HTMLButtonElement>("[role='dialog'] button")).map((boton) => boton.textContent?.trim());
    expect(botones).toContain("Reabrir el caso");
  });

  it("una bandeja vacía lo dice", async () => {
    const { element, elegir } = await setup();
    await elegir("Resueltos");
    expect(element.textContent).toContain("No hay casos en esta bandeja");
  });

  it("pagina de a 20 los casos de una bandeja", async () => {
    const { element, elegir, siguiente, filas } = await setup({ ...datosBase(), resuelto: lista(resueltos(25)) });
    await elegir("Resueltos");
    expect(filas()).toBe(20);
    expect(element.querySelector("app-paginador")?.textContent).toContain("1-20 de 25");
    await siguiente();
    expect(filas()).toBe(5);
  });

  it("al cambiar de bandeja vuelve a la primera página", async () => {
    const { elegir, siguiente, filas } = await setup({ ...datosBase(), resuelto: lista(resueltos(25)) });
    await elegir("Resueltos");
    await siguiente();
    await elegir("Archivados");
    await elegir("Resueltos");
    expect(filas()).toBe(20);
  });

  it("muestra el área de la persona cuando la tiene", async () => {
    const { element } = await setup(datosBase(), { codigo: "EESS-6206", nombre: "Hospital Dos de Mayo", tipo: "ESTABLECIMIENTO" });
    expect(element.querySelector("header")?.textContent).toContain("Área: Hospital Dos de Mayo");
  });

  it("sin área (administrador) no muestra la línea del área", async () => {
    const { element } = await setup();
    expect(element.querySelector("header")?.textContent).not.toContain("Área:");
  });

  it("avisa cuando hay más casos de los que se traen", async () => {
    const { element } = await setup({ ...datosBase(), archivado: lista(datosBase()["archivado"].casos, true) });
    expect(element.textContent).toContain("Hay más casos de los que se ven aquí");
  });

  it("no avisa cuando se trajo todo", async () => {
    const { element } = await setup();
    expect(element.textContent).not.toContain("no se ven aquí");
  });

  it("explica que el servidor calcula el plazo de atención", async () => {
    const { element } = await setup();
    expect(element.textContent).toContain("El servidor calcula el plazo de atención");
  });

  it("si falla la carga lo dice y permite reintentar", async () => {
    const { api, element, fixture } = await setup();
    api.listar.mockRejectedValueOnce(new IncidenciaError(0, null));
    TestBed.inject(CasosStore).cambios.update((cantidad) => cantidad + 1);
    TestBed.tick();
    await esperar();
    await fixture.whenStable();
    expect(element.textContent).toContain("No se pudieron cargar los casos");

    const reintentar = Array.from(element.querySelectorAll<HTMLButtonElement>("button")).find((boton) =>
      boton.textContent?.includes("Reintentar"),
    ) as HTMLButtonElement;
    reintentar.click();
    await esperar();
    await fixture.whenStable();
    expect(element.textContent).not.toContain("No se pudieron cargar los casos");
  });

  it("Revisar abre el panel del caso", async () => {
    const { element, fixture, api } = await setup();
    const revisar = Array.from(element.querySelectorAll<HTMLButtonElement>("tbody button")).find((boton) =>
      boton.textContent?.includes("Revisar"),
    ) as HTMLButtonElement;
    revisar.click();
    await fixture.whenStable();
    await esperar();
    await fixture.whenStable();
    expect(api.detalle).toHaveBeenCalledWith("MINSA-2026-000001");
    expect(element.querySelector("[role='dialog']")?.textContent).toContain("Revisar caso");
  });
});
