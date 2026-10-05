import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import { crearCaso, crearDetalle } from "@/features/casos/testing/caso-builder";
import type { Caso, ListaCasos } from "@/features/casos/types/caso.types";
import { CasosPage } from "./casos-page";

const CASOS: readonly Caso[] = [
  crearCaso({ codigo: "MINSA-2026-000001", acciones: [AccionCaso.CONFIRMAR, AccionCaso.CORREGIR] }),
  crearCaso({ codigo: "MINSA-2026-000002", estado: EstadoCaso.EN_GESTION, acciones: [] }),
  crearCaso({ codigo: "MINSA-2026-000003", acciones: [] }),
];

function lista(casos: readonly Caso[] = CASOS, total = 45, pagina = 1): ListaCasos {
  return { casos, pagina, tamano: 20, total };
}

const esperar = (ms = 15) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("CasosPage", () => {
  async function setup(respuesta: ListaCasos = lista()) {
    const api = {
      listar: vi.fn().mockResolvedValue(respuesta),
      detalle: vi.fn().mockResolvedValue(crearDetalle({ codigo: "MINSA-2026-000001", acciones: [AccionCaso.CONFIRMAR] })),
    };
    TestBed.configureTestingModule({
      imports: [CasosPage],
      providers: [
        provideRouter([]),
        { provide: IncidenciasApi, useValue: api },
        { provide: BUSQUEDA_DEBOUNCE_MS, useValue: 0 },
      ],
    });
    const fixture = TestBed.createComponent(CasosPage);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await esperar();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const filas = () => element.querySelectorAll("tbody tr").length;
    const pestana = (texto: string) =>
      Array.from(element.querySelectorAll<HTMLButtonElement>("[role='tab']")).find((tab) => tab.textContent?.includes(texto));
    const boton = (texto: string) =>
      Array.from(element.querySelectorAll<HTMLButtonElement>("button")).find((candidato) => candidato.textContent?.includes(texto));
    const ultimaConsulta = () => api.listar.mock.lastCall?.[0];
    const asentar = async () => {
      await esperar();
      await fixture.whenStable();
    };
    return { api, element, fixture, filas, pestana, boton, ultimaConsulta, asentar };
  }

  afterEach(() => document.body.replaceChildren());

  it("muestra el título y los casos reales, sin etiqueta de demostración ni selector de rol", async () => {
    const { element, filas } = await setup();
    expect(element.querySelector("h1")?.textContent).toContain("Casos");
    expect(element.textContent).not.toContain("Datos de demostración");
    expect(element.textContent).not.toContain("Ver como");
    expect(filas()).toBe(3);
  });

  it("el contador y el paginador usan el total del servidor", async () => {
    const { element } = await setup(lista(CASOS, 45));
    expect(element.querySelector("[aria-live='polite']")?.textContent).toContain("45 casos");
    expect(element.querySelector("app-paginador")?.textContent).toContain("1-20 de 45");
  });

  it("muestra todas las columnas dentro de una región desplazable", async () => {
    const { element } = await setup();
    const encabezados = Array.from(element.querySelectorAll("thead th")).map((th) => th.textContent?.trim());
    expect(encabezados).toHaveLength(10);
    expect(encabezados[0]).toBe("Código");
    expect(element.querySelector("app-scroll-area[role='region']")).not.toBeNull();
  });

  it("tiene las seis pestañas por categoría y ya no la de críticos, que no existe en la base", async () => {
    const { element } = await setup();
    const etiquetas = Array.from(element.querySelectorAll("[role='tab']")).map((tab) => tab.textContent?.trim());
    expect(etiquetas).toEqual(["Todos", "Reclamos", "Quejas", "Corrupción", "Otro", "Sin categoría"]);
  });

  it("ya no ofrece filtrar por prioridad: la base no la tiene", async () => {
    const { element } = await setup();
    const opciones = Array.from(element.querySelectorAll("option")).map((opcion) => opcion.textContent?.trim());
    expect(opciones).not.toContain("Toda prioridad");
    expect(opciones).toContain("Todo estado");
  });

  it("la primera consulta pide 20 casos, lo más antiguo primero", async () => {
    const { ultimaConsulta } = await setup();
    expect(ultimaConsulta()).toEqual({ pagina: 1, tamano: 20, orden: "fecha", direccion: "asc" });
  });

  it("cambiar de pestaña pide esa categoría al servidor", async () => {
    const { pestana, asentar, ultimaConsulta } = await setup();
    pestana("Quejas")?.click();
    await asentar();
    expect(ultimaConsulta()).toMatchObject({ categoria: "queja", pagina: 1 });
  });

  it("filtrar por estado lo pide al servidor", async () => {
    const { element, asentar, ultimaConsulta } = await setup();
    const select = element.querySelector<HTMLSelectElement>("select") as HTMLSelectElement;
    select.value = "derivado";
    select.dispatchEvent(new Event("change"));
    await asentar();
    expect(ultimaConsulta()).toMatchObject({ estado: "derivado" });
  });

  it("buscar manda el texto al servidor cuando la persona deja de escribir", async () => {
    const { element, asentar, ultimaConsulta } = await setup();
    const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
    input.value = "demora";
    input.dispatchEvent(new Event("input"));
    await asentar();
    expect(ultimaConsulta()).toMatchObject({ texto: "demora" });
  });

  it("sin resultados lo dice y ofrece limpiar los filtros", async () => {
    const { element, api, pestana, boton, asentar, ultimaConsulta } = await setup();
    api.listar.mockResolvedValue(lista([], 0));
    pestana("Reclamos")?.click();
    await asentar();
    expect(element.textContent).toContain("No hay casos con estos filtros");

    api.listar.mockResolvedValue(lista());
    boton("Limpiar filtros")?.click();
    await asentar();
    expect(ultimaConsulta()).toEqual({ pagina: 1, tamano: 20, orden: "fecha", direccion: "asc" });
  });

  it("sin filtros y sin casos no ofrece limpiar", async () => {
    const { element } = await setup(lista([], 0));
    expect(element.textContent).toContain("No hay casos");
    expect(Array.from(element.querySelectorAll("button")).some((boton) => boton.textContent?.includes("Limpiar filtros"))).toBe(false);
  });

  it("si falla la carga lo dice y permite reintentar", async () => {
    const { api, element, boton, pestana, asentar, filas } = await setup();
    api.listar.mockRejectedValueOnce(new IncidenciaError(0, null));
    pestana("Quejas")?.click();
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
      imports: [CasosPage],
      providers: [provideRouter([]), { provide: IncidenciasApi, useValue: api }, { provide: BUSQUEDA_DEBOUNCE_MS, useValue: 0 }],
    });
    const fixture = TestBed.createComponent(CasosPage);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).toContain("Cargando casos");
    soltar(lista());
    await esperar();
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).textContent).not.toContain("Cargando casos");
  });

  it("el paginador pide la página elegida", async () => {
    const { element, asentar, ultimaConsulta } = await setup(lista(CASOS, 45));
    const siguiente = element.querySelector<HTMLButtonElement>("button[aria-label='Página siguiente']") as HTMLButtonElement;
    siguiente.click();
    await asentar();
    expect(ultimaConsulta()).toMatchObject({ pagina: 2 });
  });

  it("pulsar un encabezado ordena en el servidor", async () => {
    const { element, asentar, ultimaConsulta } = await setup();
    const codigo = element.querySelector<HTMLButtonElement>("thead button[aria-label^='Ordenar por Código']") as HTMLButtonElement;
    codigo.click();
    await asentar();
    expect(ultimaConsulta()).toMatchObject({ orden: "codigo", direccion: "asc" });
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

  it("un código en la dirección (?caso=) abre su panel", async () => {
    const api = {
      listar: vi.fn().mockResolvedValue(lista()),
      detalle: vi.fn().mockResolvedValue(crearDetalle({ codigo: "MINSA-2026-000003" })),
    };
    TestBed.configureTestingModule({
      imports: [CasosPage],
      providers: [provideRouter([]), { provide: IncidenciasApi, useValue: api }, { provide: BUSQUEDA_DEBOUNCE_MS, useValue: 0 }],
    });
    await TestBed.inject(Router).navigateByUrl("/?caso=MINSA-2026-000003");
    const fixture = TestBed.createComponent(CasosPage);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await esperar();
    await fixture.whenStable();
    expect(api.detalle).toHaveBeenCalledWith("MINSA-2026-000003");
    expect((fixture.nativeElement as HTMLElement).querySelector("[role='dialog']")?.textContent).toContain("MINSA-2026-000003");
  });

  it("al cerrar el panel se quita el código de la dirección", async () => {
    const api = {
      listar: vi.fn().mockResolvedValue(lista()),
      detalle: vi.fn().mockResolvedValue(crearDetalle({ codigo: "MINSA-2026-000003" })),
    };
    TestBed.configureTestingModule({
      imports: [CasosPage],
      providers: [provideRouter([]), { provide: IncidenciasApi, useValue: api }, { provide: BUSQUEDA_DEBOUNCE_MS, useValue: 0 }],
    });
    const router = TestBed.inject(Router);
    await router.navigateByUrl("/?caso=MINSA-2026-000003");
    const fixture = TestBed.createComponent(CasosPage);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await esperar();
    await fixture.whenStable();
    const cerrar = (fixture.nativeElement as HTMLElement).querySelector<HTMLButtonElement>("[role='dialog'] button[aria-label='Cerrar el panel']");
    expect(cerrar).not.toBeNull();
    cerrar?.click();
    await esperar();
    await fixture.whenStable();
    expect(router.url).not.toContain("caso=");
  });
});
