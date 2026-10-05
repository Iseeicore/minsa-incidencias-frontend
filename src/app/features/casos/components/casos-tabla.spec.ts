import { TestBed } from "@angular/core/testing";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { DireccionOrden, OrdenCaso } from "@/features/casos/enums/orden-caso.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import type { Caso } from "@/features/casos/types/caso.types";
import { Prioridad } from "@/shared/enums/prioridad.enum";
import { CasosTabla } from "./casos-tabla";

describe("CasosTabla", () => {
  async function setup(casos: readonly Caso[], opciones: { ordenable?: boolean; orden?: OrdenCaso; direccion?: DireccionOrden } = {}) {
    const fixture = TestBed.createComponent(CasosTabla);
    fixture.componentRef.setInput("casos", casos);
    fixture.componentRef.setInput("ordenable", opciones.ordenable ?? false);
    if (opciones.orden) fixture.componentRef.setInput("orden", opciones.orden);
    if (opciones.direccion) fixture.componentRef.setInput("direccion", opciones.direccion);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const revisar = vi.fn();
    const ordenar = vi.fn();
    fixture.componentInstance.revisar.subscribe(revisar);
    fixture.componentInstance.ordenar.subscribe(ordenar);
    const celdas = (fila = 0) => Array.from(element.querySelectorAll("tbody tr")[fila]?.querySelectorAll("td") ?? []);
    return { fixture, element, revisar, ordenar, celdas };
  }

  it("muestra todas las columnas dentro de una región desplazable", async () => {
    const { element } = await setup([crearCaso()]);
    expect(Array.from(element.querySelectorAll("thead th")).map((th) => th.textContent?.trim())).toEqual([
      "Código",
      "Categoría",
      "Etiquetas",
      "Prioridad",
      "Área",
      "Responsable",
      "Estado",
      "Confianza IA",
      "Plazo",
      "Acciones",
    ]);
    expect(element.querySelector("app-scroll-area[role='region']")).not.toBeNull();
  });

  it("lo que la base no tiene se muestra con un guion, sin inventar nada", async () => {
    const { celdas } = await setup([crearCaso({ prioridad: null, responsable: null, organismo: null, etiquetas: [] })]);
    const fila = celdas();
    expect(fila[2].textContent?.trim()).toBe("—");
    expect(fila[3].textContent?.trim()).toBe("—");
    expect(fila[5].textContent?.trim()).toBe("—");
  });

  it("muestra el código, la categoría, el área, el estado, la confianza y el plazo que manda el servidor", async () => {
    const { celdas } = await setup([
      crearCaso({
        codigo: "MINSA-2026-000042",
        categoria: CategoriaCaso.QUEJA,
        area: "Área de quejas",
        responsable: "Marco Quispe",
        estado: EstadoCaso.EN_GESTION,
        confianzaIa: 88,
        plazo: { tipo: PlazoTipo.ATENCION, estado: PlazoEstado.POR_VENCER, venceEn: null, horasRestantes: 8 },
      }),
    ]);
    const textos = celdas().map((celda) => celda.textContent?.trim());
    expect(textos[0]).toBe("MINSA-2026-000042");
    expect(textos[1]).toBe("Queja");
    expect(textos[4]).toBe("Área de quejas");
    expect(textos[5]).toBe("Marco Quispe");
    expect(textos[6]).toBe("En gestión");
    expect(textos[7]).toContain("88");
    expect(textos[8]).toBe("Vence en 8 h");
  });

  it("un caso sin área muestra Sin área y sin categoría muestra el guion", async () => {
    const { celdas } = await setup([crearCaso({ categoria: null, area: null })]);
    expect(celdas()[1].textContent?.trim()).toBe("—");
    expect(celdas()[4].textContent?.trim()).toBe("Sin área");
  });

  it("si hubiera prioridad la muestra", async () => {
    const { celdas } = await setup([crearCaso({ prioridad: Prioridad.ALTA })]);
    expect(celdas()[3].textContent?.trim()).toBe("Alta");
  });

  it("Revisar si el servidor permite alguna acción y Ver si no, y emite el código", async () => {
    const { element, revisar, fixture } = await setup([
      crearCaso({ codigo: "MINSA-2026-000001", acciones: [AccionCaso.CONFIRMAR] }),
      crearCaso({ codigo: "MINSA-2026-000002", acciones: [] }),
    ]);
    const botones = Array.from(element.querySelectorAll<HTMLButtonElement>("tbody button"));
    expect(botones[0].textContent?.trim()).toContain("Revisar");
    expect(botones[1].textContent?.trim()).toContain("Ver");
    botones[1].click();
    await fixture.whenStable();
    expect(revisar).toHaveBeenCalledWith("MINSA-2026-000002");
  });

  it("sin ordenar, los encabezados son texto y no botones", async () => {
    const { element } = await setup([crearCaso()]);
    expect(element.querySelectorAll("thead button")).toHaveLength(0);
  });

  it("ordenable: Código, Categoría, Estado, Confianza IA y Plazo son botones; el resto, texto", async () => {
    const { element } = await setup([crearCaso()], { ordenable: true });
    const botones = Array.from(element.querySelectorAll("thead button")).map((boton) => boton.textContent?.trim());
    expect(botones).toEqual(["Código", "Categoría", "Estado", "Confianza IA", "Plazo"]);
  });

  it("pulsar un encabezado pide ordenar por esa columna", async () => {
    const { element, ordenar, fixture } = await setup([crearCaso()], { ordenable: true });
    const estado = Array.from(element.querySelectorAll<HTMLButtonElement>("thead button")).find((boton) =>
      boton.textContent?.includes("Estado"),
    ) as HTMLButtonElement;
    estado.click();
    await fixture.whenStable();
    expect(ordenar).toHaveBeenCalledWith(OrdenCaso.ESTADO);
  });

  it("el plazo se ordena por fecha de llegada", async () => {
    const { element, ordenar, fixture } = await setup([crearCaso()], { ordenable: true });
    const plazo = Array.from(element.querySelectorAll<HTMLButtonElement>("thead button")).find((boton) =>
      boton.textContent?.includes("Plazo"),
    ) as HTMLButtonElement;
    plazo.click();
    await fixture.whenStable();
    expect(ordenar).toHaveBeenCalledWith(OrdenCaso.FECHA);
  });

  it("la columna ordenada declara su dirección con aria-sort y las demás ninguna", async () => {
    const { element } = await setup([crearCaso()], {
      ordenable: true,
      orden: OrdenCaso.CODIGO,
      direccion: DireccionOrden.DESCENDENTE,
    });
    const encabezados = Array.from(element.querySelectorAll("thead th"));
    expect(encabezados[0].getAttribute("aria-sort")).toBe("descending");
    expect(encabezados[1].getAttribute("aria-sort")).toBe("none");
    expect(encabezados[2].getAttribute("aria-sort")).toBeNull();
  });
});
