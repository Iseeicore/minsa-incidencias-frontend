import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import type { AreaSesion } from "@/core/auth/auth.types";
import { SessionStore } from "@/core/auth/session.store";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { AHORA, BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { AreasApi } from "@/features/casos/services/areas.api";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import { crearCaso, crearDetalle } from "@/features/casos/testing/caso-builder";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import type { Caso, ListaCasos } from "@/features/casos/types/caso.types";
import { TipoArea } from "@/shared/enums/tipo-area.enum";
import { BandejaPage } from "./bandeja-page";

const CASOS: readonly Caso[] = [
  crearCaso({ codigo: "MINSA-2026-000001", acciones: [AccionCaso.CONFIRMAR, AccionCaso.CORREGIR] }),
  crearCaso({ codigo: "MINSA-2026-000002", estado: EstadoCaso.EN_GESTION, acciones: [] }),
  crearCaso({ codigo: "MINSA-2026-000003", acciones: [] }),
];

function lista(casos: readonly Caso[] = CASOS, hayMas = true): ListaCasos {
  return { casos, siguiente: hayMas ? "cursor-2" : null, hayMas };
}

const HOSPITAL: AreaOpcion = {
  id: "10",
  codigo: "EESS-6206",
  nombre: "Hospital Dos de Mayo",
  tipoArea: TipoArea.ESTABLECIMIENTO,
  establecimiento: { codigoRenipress: "6206", nivelAtencion: "III", categoria: "III-1" },
};

function sesion(area: AreaSesion | null) {
  return { provide: SessionStore, useValue: { area: signal(area), veTodasLasAreas: signal(area === null) } };
}

const areasApi = { listar: vi.fn().mockResolvedValue({ areas: [HOSPITAL], siguiente: null, hayMas: false }) };
const proveedoresComunes = [
  { provide: AreasApi, useValue: areasApi },
  { provide: BUSQUEDA_DEBOUNCE_MS, useValue: 0 },
  { provide: AHORA, useValue: () => new Date("2026-10-08T15:00:00Z") },
];

const esperar = (ms = 15) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("BandejaPage", () => {
  async function setup(respuesta: ListaCasos = lista(), area: AreaSesion | null = null) {
    const api = {
      listar: vi.fn().mockResolvedValue(respuesta),
      detalle: vi.fn().mockResolvedValue(crearDetalle({ codigo: "MINSA-2026-000001", acciones: [AccionCaso.CONFIRMAR] })),
    };
    TestBed.configureTestingModule({
      imports: [BandejaPage],
      providers: [provideRouter([]), { provide: IncidenciasApi, useValue: api }, sesion(area), ...proveedoresComunes],
    });
    const fixture = TestBed.createComponent(BandejaPage);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await esperar();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const filas = () => element.querySelectorAll("tbody tr").length;
    const tabs = (etiqueta: string) =>
      Array.from(element.querySelectorAll<HTMLButtonElement>(`[role='tablist'][aria-label='${etiqueta}'] [role='tab']`));
    const estados = () => tabs("Estado del caso");
    const categorias = () => tabs("Categoría");
    const pestana = (etiqueta: string, texto: string) => tabs(etiqueta).find((tab) => tab.textContent?.includes(texto));
    const boton = (texto: string) =>
      Array.from(element.querySelectorAll<HTMLButtonElement>("button")).find((candidato) => candidato.textContent?.includes(texto));
    const campoFecha = (etiqueta: string) =>
      Array.from(element.querySelectorAll("app-date-field"))
        .find((campo) => campo.querySelector("label span")?.textContent?.trim() === etiqueta)
        ?.querySelector<HTMLInputElement>("input") as HTMLInputElement;
    const escribirFecha = async (etiqueta: string, valor: string) => {
      const campo = campoFecha(etiqueta);
      campo.value = valor;
      campo.dispatchEvent(new Event("input"));
      await asentar();
    };
    const ultimaConsulta = () => api.listar.mock.lastCall?.[0];
    const asentar = async () => {
      await esperar();
      await fixture.whenStable();
    };
    return { api, element, fixture, filas, estados, categorias, pestana, boton, campoFecha, escribirFecha, ultimaConsulta, asentar };
  }

  afterEach(() => document.body.replaceChildren());

  it("muestra el título Bandeja y los casos reales, sin el aviso de «Usa Casos» ni el paginador local", async () => {
    const { element, filas } = await setup();
    expect(element.querySelector("h1")?.textContent).toContain("Bandeja");
    expect(element.textContent).not.toContain("Mis bandejas");
    expect(element.textContent).not.toContain("Usa Casos");
    expect(element.querySelector("app-paginador")).toBeNull();
    expect(filas()).toBe(3);
  });

  it("el contador y el paginador de cursor muestran la página y si hay más, sin total", async () => {
    const { element } = await setup(lista(CASOS, true));
    expect(element.textContent).toContain("Mostrando 3 casos");
    expect(element.querySelector("app-paginador-cursor")?.textContent).toContain("Página 1 · 3 casos · hay más");
  });

  it("muestra todas las columnas dentro de una región desplazable", async () => {
    const { element } = await setup();
    const encabezados = Array.from(element.querySelectorAll("thead th")).map((th) => th.textContent?.trim());
    expect(encabezados).toHaveLength(11);
    expect(element.querySelector("app-scroll-area[role='region']")).not.toBeNull();
  });

  it("la primera consulta pide 20 casos de todos los estados, sin cursor ni orden", async () => {
    const { ultimaConsulta } = await setup();
    expect(ultimaConsulta()).toEqual({ limite: 20 });
  });

  describe("pestañas por estado", () => {
    it("son seis, en este orden, y Todos es la activa", async () => {
      const { estados } = await setup();
      expect(estados().map((tab) => tab.textContent?.trim())).toEqual([
        "Por revisar",
        "En gestión",
        "Derivados",
        "Resueltos",
        "Archivados",
        "Todos",
      ]);
      expect(estados().find((tab) => tab.getAttribute("aria-selected") === "true")?.textContent?.trim()).toBe("Todos");
    });

    it.each([
      ["Por revisar", "clasificado"],
      ["En gestión", "en-gestion"],
      ["Derivados", "derivado"],
      ["Resueltos", "resuelto"],
      ["Archivados", "archivado"],
    ])("«%s» pide el estado «%s» al servidor", async (texto, estado) => {
      const { pestana, asentar, ultimaConsulta } = await setup();
      pestana("Estado del caso", texto)?.click();
      await asentar();
      expect(ultimaConsulta()).toEqual({ limite: 20, estado });
    });

    it("cada pestaña explica qué contiene", async () => {
      const { element, pestana, asentar } = await setup();
      pestana("Estado del caso", "Por revisar")?.click();
      await asentar();
      expect(element.querySelector("app-card h2")?.textContent).toContain("Por revisar");
      expect(element.querySelector("app-card")?.textContent).toContain("falta confirmar o corregir la categoría");
    });

    it("con Archivados aparece el filtro por motivo, lo manda al servidor y desaparece con otra pestaña", async () => {
      const { element, pestana, asentar, ultimaConsulta } = await setup();
      const selects = () => element.querySelectorAll<HTMLSelectElement>("section[aria-label='Filtros'] select");
      expect(selects()).toHaveLength(0);

      pestana("Estado del caso", "Archivados")?.click();
      await asentar();
      expect(selects()).toHaveLength(1);
      const motivos = Array.from(selects()[0].options).map((opcion) => opcion.textContent?.trim());
      expect(motivos).toEqual([
        "Todos los motivos",
        "Datos insuficientes",
        "No corresponde",
        "Venció sin atenderse",
        "Resolución cumplió su vigencia",
      ]);

      selects()[0].value = "DATOS_INSUFICIENTES";
      selects()[0].dispatchEvent(new Event("change"));
      await asentar();
      expect(ultimaConsulta()).toEqual({ limite: 20, estado: "archivado", motivoArchivo: "DATOS_INSUFICIENTES" });

      pestana("Estado del caso", "Derivados")?.click();
      await asentar();
      expect(selects()).toHaveLength(0);
      expect(ultimaConsulta()).toEqual({ limite: 20, estado: "derivado" });
    });
  });

  describe("chips de categoría según el área de la persona", () => {
    const etiquetas = (categorias: () => HTMLButtonElement[]) => categorias().map((tab) => tab.textContent?.trim());

    it("sin área (administrador) ve las seis, con Corrupción y Sin categoría", async () => {
      const { categorias, element } = await setup();
      expect(etiquetas(categorias)).toEqual(["Todas", "Reclamos", "Quejas", "Corrupción", "Otro", "Sin categoría"]);
      expect(element.querySelector("header")?.textContent).not.toContain("Área:");
    });

    it("ESTABLECIMIENTO no ve Corrupción, Otro ni Sin categoría y ve su área", async () => {
      const { categorias, element } = await setup(lista(), { codigo: "EESS-6206", nombre: "Hospital Dos de Mayo", tipo: TipoArea.ESTABLECIMIENTO });
      expect(etiquetas(categorias)).toEqual(["Todas", "Reclamos", "Quejas"]);
      expect(element.querySelector("header")?.textContent).toContain("Área: Hospital Dos de Mayo");
    });

    it("OTRANS solo ve Todas y Corrupción", async () => {
      const { categorias } = await setup(lista(), { codigo: "OTRANS", nombre: "OTRANS", tipo: TipoArea.OTRANS });
      expect(etiquetas(categorias)).toEqual(["Todas", "Corrupción"]);
    });

    it("un chip pide esa categoría y se combina con la pestaña de estado", async () => {
      const { pestana, asentar, ultimaConsulta } = await setup();
      pestana("Estado del caso", "En gestión")?.click();
      await asentar();
      pestana("Categoría", "Quejas")?.click();
      await asentar();
      expect(ultimaConsulta()).toEqual({ limite: 20, estado: "en-gestion", categoria: "queja" });
    });
  });

  describe("búsqueda", () => {
    it("el campo tiene lupa, el texto de ayuda para buscar por código y no tiene botón de limpiar vacío", async () => {
      const { element } = await setup();
      const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
      expect(input.placeholder).toBe("Buscar por código (MINSA-2026-000017) o por relato");
      expect(element.querySelector("app-search-input app-icon")).not.toBeNull();
      expect(element.querySelector("app-search-input button")).toBeNull();
    });

    it("buscar manda el texto al servidor cuando la persona deja de escribir", async () => {
      const { element, asentar, ultimaConsulta } = await setup();
      const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
      input.value = "demora";
      input.dispatchEvent(new Event("input"));
      await asentar();
      expect(ultimaConsulta()).toMatchObject({ texto: "demora" });
    });

    it("un código completo, o pegado sin ceros, se busca como código completo", async () => {
      const { element, asentar, ultimaConsulta } = await setup();
      const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
      input.value = "MINSA-2026-000017";
      input.dispatchEvent(new Event("input"));
      await asentar();
      expect(ultimaConsulta()).toMatchObject({ texto: "MINSA-2026-000017" });

      input.value = "MINSA-2026-17";
      input.dispatchEvent(new Event("input"));
      await asentar();
      expect(ultimaConsulta()).toMatchObject({ texto: "MINSA-2026-000017" });
    });

    it("el botón de limpiar aparece con texto, lo vacía y vuelve a pedir sin texto", async () => {
      const { element, asentar, ultimaConsulta } = await setup();
      const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
      input.value = "demora";
      input.dispatchEvent(new Event("input"));
      await asentar();

      const limpiar = element.querySelector<HTMLButtonElement>("app-search-input button[aria-label^='Limpiar']");
      expect(limpiar).not.toBeNull();
      limpiar?.click();
      await asentar();
      expect(input.value).toBe("");
      expect(ultimaConsulta()).toEqual({ limite: 20 });
      expect(element.querySelector("app-search-input button")).toBeNull();
    });
  });

  describe("rango de fechas", () => {
    it("tiene los campos Desde y Hasta con etiqueta visible, tipo fecha e icono de calendario", async () => {
      const { element, campoFecha } = await setup();
      for (const etiqueta of ["Desde", "Hasta"]) {
        expect(campoFecha(etiqueta).type).toBe("date");
      }
      const campos = element.querySelectorAll("app-date-field");
      expect(campos).toHaveLength(2);
      campos.forEach((campo) => {
        expect(campo.querySelector("label span")?.classList.contains("sr-only")).toBe(false);
        expect(campo.querySelector("app-icon")).not.toBeNull();
      });
    });

    it("tiene los atajos Hoy, 7 días, 30 días y Este mes, y Limpiar solo cuando hay fechas", async () => {
      const { element, boton, asentar } = await setup();
      const atajos = Array.from(element.querySelectorAll("[aria-label='Atajos de fecha'] button")).map((b) => b.textContent?.trim());
      expect(atajos).toEqual(["Hoy", "7 días", "30 días", "Este mes"]);
      expect(boton("Limpiar")).toBeUndefined();

      boton("Hoy")?.click();
      await asentar();
      expect(boton("Limpiar")).toBeDefined();
    });

    it.each([
      ["Hoy", { desde: "2026-10-08", hasta: "2026-10-08" }],
      ["7 días", { desde: "2026-10-02", hasta: "2026-10-08" }],
      ["30 días", { desde: "2026-09-09", hasta: "2026-10-08" }],
      ["Este mes", { desde: "2026-10-01", hasta: "2026-10-08" }],
    ])("el atajo «%s» llena los campos con la hora de Lima y los manda al servidor", async (texto, rango) => {
      const { boton, campoFecha, asentar, ultimaConsulta } = await setup();
      boton(texto)?.click();
      await asentar();
      expect(campoFecha("Desde").value).toBe(rango.desde);
      expect(campoFecha("Hasta").value).toBe(rango.hasta);
      expect(ultimaConsulta()).toEqual({ limite: 20, ...rango });
    });

    it("escribir las fechas las manda como YYYY-MM-DD y Limpiar las quita", async () => {
      const { boton, escribirFecha, campoFecha, asentar, ultimaConsulta } = await setup();
      await escribirFecha("Desde", "2026-10-01");
      expect(ultimaConsulta()).toEqual({ limite: 20, desde: "2026-10-01" });
      await escribirFecha("Hasta", "2026-10-07");
      expect(ultimaConsulta()).toEqual({ limite: 20, desde: "2026-10-01", hasta: "2026-10-07" });

      boton("Limpiar")?.click();
      await asentar();
      expect(ultimaConsulta()).toEqual({ limite: 20 });
      expect(campoFecha("Desde").value).toBe("");
      expect(campoFecha("Hasta").value).toBe("");
    });

    it("con Desde posterior a Hasta lo dice en español, marca los campos y no pide al servidor", async () => {
      const { element, api, escribirFecha, campoFecha } = await setup();
      await escribirFecha("Desde", "2026-10-01");
      await escribirFecha("Hasta", "2026-10-07");
      const antes = api.listar.mock.calls.length;

      await escribirFecha("Desde", "2026-10-09");
      expect(element.querySelector("[role='alert']")?.textContent).toContain("La fecha «Desde» no puede ser posterior a «Hasta».");
      expect(campoFecha("Desde").getAttribute("aria-invalid")).toBe("true");
      expect(campoFecha("Hasta").getAttribute("aria-invalid")).toBe("true");
      expect(api.listar.mock.calls.length).toBe(antes);

      await escribirFecha("Desde", "2026-10-02");
      expect(element.querySelector("[role='alert']")).toBeNull();
    });

    it("un rango de más de 366 días se rechaza con su mensaje", async () => {
      const { element, api, escribirFecha } = await setup();
      await escribirFecha("Desde", "2025-10-07");
      const antes = api.listar.mock.calls.length;
      await escribirFecha("Hasta", "2026-10-08");
      expect(element.querySelector("[role='alert']")?.textContent).toContain("no puede pasar de 366 días");
      expect(api.listar.mock.calls.length).toBe(antes);
    });
  });

  it("cambiar de pestaña, categoría, fechas o búsqueda vuelve a la primera página", async () => {
    const { element, api, pestana, boton, asentar, ultimaConsulta } = await setup(lista(CASOS, true));
    const botones = () => Array.from(element.querySelectorAll<HTMLButtonElement>("app-paginador-cursor button"));
    const irAPaginaDos = async () => {
      api.listar.mockResolvedValueOnce(lista(CASOS, true));
      botones()[1].click();
      await asentar();
      expect(element.querySelector("app-paginador-cursor")?.textContent).toContain("Página 2");
    };
    const alPrincipio = () => {
      expect(ultimaConsulta()).not.toHaveProperty("cursor");
      expect(element.querySelector("app-paginador-cursor")?.textContent).toContain("Página 1");
    };

    await irAPaginaDos();
    pestana("Estado del caso", "Resueltos")?.click();
    await asentar();
    alPrincipio();

    await irAPaginaDos();
    pestana("Categoría", "Reclamos")?.click();
    await asentar();
    alPrincipio();

    await irAPaginaDos();
    boton("Hoy")?.click();
    await asentar();
    alPrincipio();

    await irAPaginaDos();
    const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
    input.value = "demora";
    input.dispatchEvent(new Event("input"));
    await asentar();
    alPrincipio();
  });

  it("combina estado, categoría, fechas y texto en una sola consulta", async () => {
    const { element, pestana, boton, asentar, ultimaConsulta } = await setup();
    pestana("Estado del caso", "Derivados")?.click();
    await asentar();
    pestana("Categoría", "Quejas")?.click();
    await asentar();
    boton("7 días")?.click();
    await asentar();
    const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
    input.value = "demora";
    input.dispatchEvent(new Event("input"));
    await asentar();
    expect(ultimaConsulta()).toEqual({
      limite: 20,
      estado: "derivado",
      categoria: "queja",
      desde: "2026-10-02",
      hasta: "2026-10-08",
      texto: "demora",
    });
  });

  it("sin resultados lo dice y ofrece limpiar los filtros, también las fechas", async () => {
    const { element, api, pestana, boton, campoFecha, asentar, ultimaConsulta } = await setup();
    api.listar.mockResolvedValue(lista([], false));
    pestana("Categoría", "Reclamos")?.click();
    await asentar();
    boton("Hoy")?.click();
    await asentar();
    expect(element.textContent).toContain("No hay casos con estos filtros");

    api.listar.mockResolvedValue(lista());
    boton("Limpiar filtros")?.click();
    await asentar();
    expect(ultimaConsulta()).toEqual({ limite: 20 });
    expect(campoFecha("Desde").value).toBe("");
  });

  it("sin filtros y sin casos no ofrece limpiar", async () => {
    const { element } = await setup(lista([], false));
    expect(element.textContent).toContain("No hay casos");
    expect(Array.from(element.querySelectorAll("button")).some((boton) => boton.textContent?.includes("Limpiar filtros"))).toBe(false);
  });

  describe("filtros aplicados", () => {
    const chips = (element: HTMLElement) =>
      Array.from(element.querySelectorAll("section[aria-label='Filtros aplicados'] app-chip-quitable")).map((chip) =>
        chip.textContent?.trim(),
      );
    const quitar = (element: HTMLElement, texto: string) =>
      element.querySelector<HTMLButtonElement>(`section[aria-label='Filtros aplicados'] button[aria-label='Quitar filtro: ${texto}']`);

    it("sin filtros no muestra la franja", async () => {
      const { element } = await setup();
      expect(element.querySelector("section[aria-label='Filtros aplicados']")).toBeNull();
    });

    it("muestra un chip por cada filtro aplicado: estado, categoría, fechas y búsqueda", async () => {
      const { element, pestana, boton, escribirFecha, asentar } = await setup();
      pestana("Estado del caso", "En gestión")?.click();
      pestana("Categoría", "Quejas")?.click();
      await asentar();
      await escribirFecha("Desde", "2026-10-01");
      await escribirFecha("Hasta", "2026-10-07");
      const buscador = element.querySelector<HTMLInputElement>("app-search-input input") as HTMLInputElement;
      buscador.value = "demora";
      buscador.dispatchEvent(new Event("input"));
      await asentar();
      expect(chips(element)).toEqual([
        "Estado: En gestión",
        "Categoría: Quejas",
        "Fecha: del 01/10/2026 al 07/10/2026",
        "Búsqueda: «demora»",
      ]);
      expect(boton("Limpiar filtros")).toBeDefined();
    });

    it("el filtro de establecimiento y el de motivo también aparecen", async () => {
      const { element, pestana, asentar } = await setup();
      pestana("Estado del caso", "Archivados")?.click();
      await asentar();
      const motivo = element.querySelector<HTMLSelectElement>("section[aria-label='Filtros'] select") as HTMLSelectElement;
      motivo.value = "NO_CORRESPONDE";
      motivo.dispatchEvent(new Event("change"));
      await asentar();
      expect(chips(element)).toEqual(["Estado: Archivados", "Motivo: No corresponde"]);
    });

    it("quitar un chip quita solo ese filtro, vuelve a la primera página y lo borra de la franja", async () => {
      const { element, pestana, boton, asentar, ultimaConsulta } = await setup();
      pestana("Categoría", "Quejas")?.click();
      pestana("Estado del caso", "En gestión")?.click();
      await asentar();
      boton("Siguiente")?.click();
      await asentar();
      expect(ultimaConsulta()).toEqual({ limite: 20, cursor: "cursor-2", estado: "en-gestion", categoria: "queja" });

      quitar(element, "Categoría: Quejas")?.click();
      await asentar();
      expect(ultimaConsulta()).toEqual({ limite: 20, estado: "en-gestion" });
      expect(chips(element)).toEqual(["Estado: En gestión"]);
      expect(element.querySelector("app-paginador-cursor")?.textContent).toContain("Página 1");
    });

    it("quitar el chip de fechas vacía los dos campos y quitar el de búsqueda vacía el buscador", async () => {
      const { element, boton, campoFecha, asentar, ultimaConsulta } = await setup();
      boton("Hoy")?.click();
      const buscador = element.querySelector<HTMLInputElement>("app-search-input input") as HTMLInputElement;
      buscador.value = "demora";
      buscador.dispatchEvent(new Event("input"));
      await asentar();
      expect(ultimaConsulta()).toEqual({ limite: 20, texto: "demora", desde: "2026-10-08", hasta: "2026-10-08" });

      quitar(element, "Fecha: 08/10/2026")?.click();
      await asentar();
      expect(campoFecha("Desde").value).toBe("");
      expect(campoFecha("Hasta").value).toBe("");
      expect(ultimaConsulta()).toEqual({ limite: 20, texto: "demora" });

      quitar(element, "Búsqueda: «demora»")?.click();
      await asentar();
      expect(buscador.value).toBe("");
      expect(ultimaConsulta()).toEqual({ limite: 20 });
      expect(element.querySelector("section[aria-label='Filtros aplicados']")).toBeNull();
    });

    it("Limpiar filtros quita todos los filtros y vuelve a pedir una sola vez desde el principio", async () => {
      const { api, element, pestana, boton, asentar, ultimaConsulta } = await setup();
      pestana("Categoría", "Reclamos")?.click();
      boton("Hoy")?.click();
      await asentar();
      const antes = api.listar.mock.calls.length;
      boton("Limpiar filtros")?.click();
      await asentar();
      expect(api.listar.mock.calls.length).toBe(antes + 1);
      expect(ultimaConsulta()).toEqual({ limite: 20 });
      expect(element.querySelector("section[aria-label='Filtros aplicados']")).toBeNull();
    });

    it("un rango inválido no agrega chip: sigue el último rango válido", async () => {
      const { element, boton, escribirFecha, asentar } = await setup();
      boton("Hoy")?.click();
      await asentar();
      await escribirFecha("Desde", "2026-10-09");
      expect(element.textContent).toContain("La fecha");
      expect(chips(element)).toEqual(["Fecha: 08/10/2026"]);
    });
  });

  it("si falla la carga lo dice y permite reintentar", async () => {
    const { api, element, boton, pestana, asentar, filas } = await setup();
    api.listar.mockRejectedValueOnce(new IncidenciaError(0, null));
    pestana("Categoría", "Quejas")?.click();
    await asentar();
    expect(element.textContent).toContain("No se pudieron cargar los casos");

    api.listar.mockResolvedValue(lista());
    boton("Reintentar")?.click();
    await asentar();
    expect(element.textContent).not.toContain("No se pudieron cargar los casos");
    expect(filas()).toBe(3);
  });

  it("mientras carga por primera vez lo avisa", async () => {
    let soltar!: (valor: ListaCasos) => void;
    const api = {
      listar: vi.fn().mockReturnValue(new Promise<ListaCasos>((resolver) => (soltar = resolver))),
      detalle: vi.fn(),
    };
    TestBed.configureTestingModule({
      imports: [BandejaPage],
      providers: [provideRouter([]), { provide: IncidenciasApi, useValue: api }, sesion(null), ...proveedoresComunes],
    });
    const fixture = TestBed.createComponent(BandejaPage);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain("Cargando casos");
    soltar(lista());
    await esperar();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain("Cargando casos");
  });

  it("Siguiente pide el cursor que mandó el servidor y Anterior vuelve con el cursor guardado", async () => {
    const { api, element, asentar, ultimaConsulta } = await setup(lista(CASOS, true));
    const botones = () => Array.from(element.querySelectorAll<HTMLButtonElement>("app-paginador-cursor button"));
    const anterior = () => botones()[0];
    const siguiente = () => botones()[1];
    expect(anterior().disabled).toBe(true);

    api.listar.mockResolvedValueOnce({ casos: CASOS, siguiente: null, hayMas: false });
    siguiente().click();
    await asentar();
    expect(ultimaConsulta()).toEqual({ limite: 20, cursor: "cursor-2" });
    expect(element.querySelector("app-paginador-cursor")?.textContent).toContain("Página 2");
    expect(siguiente().disabled).toBe(true);

    api.listar.mockResolvedValueOnce(lista(CASOS, true));
    anterior().click();
    await asentar();
    expect(ultimaConsulta()).toEqual({ limite: 20 });
    expect(element.querySelector("app-paginador-cursor")?.textContent).toContain("Página 1");
  });

  it("no hay encabezados que ordenen: el servidor fija el orden", async () => {
    const { element } = await setup();
    expect(element.querySelector("thead button")).toBeNull();
  });

  describe("filtro por establecimiento", () => {
    it("solo lo ve quien no tiene área (administrador)", async () => {
      const sinArea = await setup();
      expect(sinArea.element.querySelector("app-area-selector")).not.toBeNull();
      document.body.replaceChildren();
      TestBed.resetTestingModule();

      const conArea = await setup(lista(), { codigo: "EESS-6206", nombre: "Hospital Dos de Mayo", tipo: TipoArea.ESTABLECIMIENTO });
      expect(conArea.element.querySelector("app-area-selector")).toBeNull();
    });

    it("elegir un establecimiento lo manda por su código RENIPRESS y vaciar el campo lo quita", async () => {
      const { element, asentar, ultimaConsulta } = await setup();
      const campo = element.querySelector<HTMLInputElement>("app-area-selector input") as HTMLInputElement;
      campo.value = "dos de mayo";
      campo.dispatchEvent(new Event("input"));
      await asentar();
      (element.querySelector("app-area-selector [role='option']") as HTMLElement).dispatchEvent(
        new MouseEvent("mousedown", { bubbles: true, cancelable: true }),
      );
      await asentar();
      expect(ultimaConsulta()).toEqual({ limite: 20, establecimiento: "6206" });

      campo.value = "";
      campo.dispatchEvent(new Event("input"));
      await asentar();
      expect(ultimaConsulta()).toEqual({ limite: 20 });
    });
  });

  it("cada fila tiene un botón: Revisar si el servidor permite actuar y Ver si no", async () => {
    const { element } = await setup();
    const etiquetas = Array.from(element.querySelectorAll("tbody tr")).map((fila) =>
      fila.querySelector("button")?.textContent?.trim().split(" ")[0],
    );
    expect(etiquetas).toEqual(["Revisar", "Ver", "Ver"]);
  });

  it("Revisar abre el panel del caso elegido con lo que manda el servidor", async () => {
    const { element, api, asentar } = await setup();
    (element.querySelector<HTMLButtonElement>("tbody button") as HTMLButtonElement).click();
    await asentar();
    expect(api.detalle).toHaveBeenCalledWith("MINSA-2026-000001");
    const panel = element.querySelector("[role='dialog']");
    expect(panel?.textContent).toContain("Revisar caso");
    expect(panel?.textContent).toContain("Confirmar categoría");
  });

  describe("caso en la dirección (?caso=)", () => {
    async function conCasoEnLaDireccion() {
      const api = {
        listar: vi.fn().mockResolvedValue(lista()),
        detalle: vi.fn().mockResolvedValue(crearDetalle({ codigo: "MINSA-2026-000003" })),
      };
      TestBed.configureTestingModule({
        imports: [BandejaPage],
        providers: [provideRouter([]), { provide: IncidenciasApi, useValue: api }, sesion(null), ...proveedoresComunes],
      });
      const router = TestBed.inject(Router);
      await router.navigateByUrl("/?caso=MINSA-2026-000003");
      const fixture = TestBed.createComponent(BandejaPage);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();
      await esperar();
      await fixture.whenStable();
      return { api, router, fixture, element: fixture.nativeElement as HTMLElement };
    }

    it("un código en la dirección abre su panel", async () => {
      const { api, element } = await conCasoEnLaDireccion();
      expect(api.detalle).toHaveBeenCalledWith("MINSA-2026-000003");
      expect(element.querySelector("[role='dialog']")?.textContent).toContain("MINSA-2026-000003");
    });

    it("al cerrar el panel se quita el código de la dirección", async () => {
      const { router, fixture, element } = await conCasoEnLaDireccion();
      const cerrar = element.querySelector<HTMLButtonElement>("[role='dialog'] button[aria-label='Cerrar el panel']");
      expect(cerrar).not.toBeNull();
      cerrar?.click();
      await esperar();
      await fixture.whenStable();
      expect(router.url).not.toContain("caso=");
    });
  });
});
