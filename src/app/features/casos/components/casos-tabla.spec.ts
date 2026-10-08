import { TestBed } from "@angular/core/testing";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { NivelAtencion } from "@/features/casos/enums/nivel-atencion.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import type { Caso } from "@/features/casos/types/caso.types";
import { Prioridad } from "@/shared/enums/prioridad.enum";
import { CasosTabla } from "./casos-tabla";

describe("CasosTabla", () => {
  async function setup(casos: readonly Caso[]) {
    const fixture = TestBed.createComponent(CasosTabla);
    fixture.componentRef.setInput("casos", casos);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const revisar = vi.fn();
    fixture.componentInstance.revisar.subscribe(revisar);
    const celdas = (fila = 0) => Array.from(element.querySelectorAll("tbody tr")[fila]?.querySelectorAll("td") ?? []);
    return { fixture, element, revisar, celdas };
  }

  it("muestra todas las columnas dentro de una región desplazable", async () => {
    const { element } = await setup([crearCaso()]);
    expect(Array.from(element.querySelectorAll("thead th")).map((th) => th.textContent?.trim())).toEqual([
      "Código",
      "Categoría",
      "Etiquetas",
      "Prioridad",
      "Establecimiento",
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
    expect(fila[6].textContent?.trim()).toBe("—");
  });

  it("muestra el código, la categoría, el área, el estado, la confianza y el plazo que manda el servidor", async () => {
    const { celdas } = await setup([
      crearCaso({
        codigo: "MINSA-2026-000042",
        categoria: CategoriaCaso.QUEJA,
        area: { codigo: "EESS-6206", nombre: "Hospital Dos de Mayo" },
        responsable: "Marco Quispe",
        estado: EstadoCaso.EN_GESTION,
        confianzaIa: 88,
        plazo: { tipo: PlazoTipo.ATENCION, estado: PlazoEstado.POR_VENCER, venceEn: null, horasRestantes: 8 },
      }),
    ]);
    const textos = celdas().map((celda) => celda.textContent?.trim());
    expect(textos[0]).toBe("MINSA-2026-000042");
    expect(textos[1]).toBe("Queja");
    expect(textos[5]).toBe("Hospital Dos de Mayo");
    expect(textos[6]).toBe("Marco Quispe");
    expect(textos[7]).toBe("En gestión");
    expect(textos[8]).toContain("88");
    expect(textos[9]).toBe("Vence en 8 h");
  });

  it("muestra el establecimiento con su código RENIPRESS, nivel y categoría", async () => {
    const { celdas } = await setup([
      crearCaso({
        establecimiento: { codigoRenipress: "6206", nombre: "Hospital Dos de Mayo", nivelAtencion: NivelAtencion.III, categoria: "III-1" },
      }),
    ]);
    const celda = celdas()[4].textContent ?? "";
    expect(celda).toContain("Hospital Dos de Mayo");
    expect(celda).toContain("RENIPRESS 6206 · Nivel III · Cat. III-1");
  });

  it("sin nivel ni categoría solo muestra el código RENIPRESS", async () => {
    const { celdas } = await setup([
      crearCaso({ establecimiento: { codigoRenipress: "5614", nombre: "C.S. Bayóvar", nivelAtencion: null, categoria: null } }),
    ]);
    expect(celdas()[4].textContent).toContain("RENIPRESS 5614");
    expect(celdas()[4].textContent).not.toContain("Nivel");
  });

  it("un caso sin derivar muestra Sin derivar, sin establecimiento lo dice, y sin categoría muestra el guion", async () => {
    const { celdas } = await setup([crearCaso({ categoria: null, area: null, establecimiento: null })]);
    expect(celdas()[1].textContent?.trim()).toBe("—");
    expect(celdas()[4].textContent?.trim()).toBe("Sin establecimiento");
    expect(celdas()[5].textContent?.trim()).toBe("Sin derivar");
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

  it("los encabezados son texto: el servidor fija el orden y no se ordena por columna", async () => {
    const { element } = await setup([crearCaso()]);
    expect(element.querySelectorAll("thead button")).toHaveLength(0);
    expect(element.querySelector("[aria-sort]")).toBeNull();
  });

  it("el plazo vencido se destaca y el que está en plazo no", async () => {
    const { celdas } = await setup([
      crearCaso({ plazo: { tipo: PlazoTipo.ATENCION, estado: PlazoEstado.VENCIDO, venceEn: null, horasRestantes: -3 } }),
      crearCaso({ plazo: { tipo: PlazoTipo.ATENCION, estado: PlazoEstado.EN_PLAZO, venceEn: null, horasRestantes: 30 } }),
    ]);
    const plazo = (fila: number) => celdas(fila)[9].querySelector("span") as HTMLElement;
    expect(plazo(0).textContent?.trim()).toBe("Vencido");
    expect(plazo(0).className).toContain("text-danger-700");
    expect(plazo(1).className).not.toContain("danger");
  });

  it("las filas resaltan al pasar el cursor", async () => {
    const { element } = await setup([crearCaso()]);
    expect(element.querySelector("tbody tr")?.className).toContain("hover:bg-gray-50");
  });
});
