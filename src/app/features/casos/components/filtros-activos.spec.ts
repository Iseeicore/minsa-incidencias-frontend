import { TestBed } from "@angular/core/testing";
import { FiltroActivoId } from "@/features/casos/enums/filtro-activo.enum";
import type { FiltroActivo } from "@/features/casos/types/filtro-activo.types";
import { FiltrosActivos } from "./filtros-activos";

const FILTROS: readonly FiltroActivo[] = [
  { id: FiltroActivoId.CATEGORIA, label: "Categoría: Quejas" },
  { id: FiltroActivoId.TEXTO, label: "Búsqueda: «demora»" },
];

describe("FiltrosActivos", () => {
  async function setup(filtros: readonly FiltroActivo[]) {
    const fixture = TestBed.createComponent(FiltrosActivos);
    fixture.componentRef.setInput("filtros", filtros);
    const alQuitar = vi.fn();
    const alLimpiar = vi.fn();
    fixture.componentInstance.quitar.subscribe(alQuitar);
    fixture.componentInstance.limpiar.subscribe(alLimpiar);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    return { element, alQuitar, alLimpiar };
  }

  it("sin filtros no dibuja nada", async () => {
    const { element } = await setup([]);
    expect(element.querySelector("section")).toBeNull();
    expect(element.querySelector("button")).toBeNull();
  });

  it("muestra un chip por filtro y el botón para limpiar todo", async () => {
    const { element } = await setup(FILTROS);
    const chips = Array.from(element.querySelectorAll("app-chip-quitable")).map((chip) => chip.textContent?.trim());
    expect(chips).toEqual(["Categoría: Quejas", "Búsqueda: «demora»"]);
    expect(element.querySelector("section")?.getAttribute("aria-label")).toBe("Filtros aplicados");
    expect(element.textContent).toContain("Limpiar todo");
  });

  it("quitar un chip avisa cuál es", async () => {
    const { element, alQuitar } = await setup(FILTROS);
    element.querySelector<HTMLButtonElement>("app-chip-quitable button")?.click();
    expect(alQuitar).toHaveBeenCalledWith(FiltroActivoId.CATEGORIA);
  });

  it("Limpiar todo avisa una sola vez", async () => {
    const { element, alLimpiar, alQuitar } = await setup(FILTROS);
    const boton = Array.from(element.querySelectorAll<HTMLButtonElement>("button")).find((candidato) =>
      candidato.textContent?.includes("Limpiar todo"),
    );
    boton?.click();
    expect(alLimpiar).toHaveBeenCalledTimes(1);
    expect(alQuitar).not.toHaveBeenCalled();
  });

  it("con muchos filtros o nombres largos los chips pasan a la línea siguiente", async () => {
    const { element } = await setup(FILTROS);
    const contenedor = element.querySelector("section") as HTMLElement;
    expect(contenedor.className).toContain("flex-wrap");
    expect(contenedor.className).toContain("min-w-0");
  });
});
