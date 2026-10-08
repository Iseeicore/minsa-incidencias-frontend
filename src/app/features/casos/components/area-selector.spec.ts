import { TestBed } from "@angular/core/testing";
import { BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { AreasApi } from "@/features/casos/services/areas.api";
import type { AreaOpcion, ListaAreas } from "@/features/casos/types/area.types";
import { TipoArea } from "@/shared/enums/tipo-area.enum";
import { AreaSelector } from "./area-selector";

const HOSPITAL: AreaOpcion = {
  id: "10",
  codigo: "EESS-6206",
  nombre: "Hospital Dos de Mayo",
  tipoArea: TipoArea.ESTABLECIMIENTO,
  establecimiento: { codigoRenipress: "6206", nivelAtencion: "III", categoria: "III-1" },
};
const CENTRO: AreaOpcion = {
  id: "11",
  codigo: "EESS-5614",
  nombre: "C.S. Bayóvar",
  tipoArea: TipoArea.ESTABLECIMIENTO,
  establecimiento: { codigoRenipress: "5614", nivelAtencion: "I", categoria: "I-3" },
};
const OTRANS: AreaOpcion = { id: "1", codigo: "OTRANS", nombre: "OTRANS", tipoArea: TipoArea.OTRANS, establecimiento: null };

const esperar = (ms = 10) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("AreaSelector", () => {
  const api = { listar: vi.fn() };

  function respuesta(areas: readonly AreaOpcion[], hayMas = false): ListaAreas {
    return { areas, siguiente: null, hayMas };
  }

  async function setup(opciones: { soloEstablecimientos?: boolean; espera?: number } = {}) {
    api.listar.mockReset();
    api.listar.mockResolvedValue(respuesta([HOSPITAL, CENTRO]));
    TestBed.configureTestingModule({
      providers: [
        { provide: AreasApi, useValue: api },
        { provide: BUSQUEDA_DEBOUNCE_MS, useValue: opciones.espera ?? 0 },
      ],
    });
    const fixture = TestBed.createComponent(AreaSelector);
    fixture.componentRef.setInput("label", "Área de destino");
    if (opciones.soloEstablecimientos !== undefined) fixture.componentRef.setInput("soloEstablecimientos", opciones.soloEstablecimientos);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const campo = () => element.querySelector("input") as HTMLInputElement;
    const opcionesVisibles = () => Array.from(element.querySelectorAll<HTMLElement>("[role='option']"));
    const asentar = async (ms = 10) => {
      await esperar(ms);
      await fixture.whenStable();
    };
    const escribir = async (texto: string, ms = 10) => {
      campo().value = texto;
      campo().dispatchEvent(new Event("input"));
      await fixture.whenStable();
      await asentar(ms);
    };
    const teclear = async (key: string) => {
      campo().dispatchEvent(new KeyboardEvent("keydown", { key, cancelable: true }));
      await fixture.whenStable();
    };
    return { fixture, element, campo, opcionesVisibles, escribir, teclear, asentar };
  }

  it("es un combobox con etiqueta y la lista cerrada al empezar", async () => {
    const { element, campo } = await setup();
    expect(campo().getAttribute("role")).toBe("combobox");
    expect(campo().getAttribute("aria-expanded")).toBe("false");
    expect(element.querySelector("label")?.textContent).toContain("Área de destino");
    expect(api.listar).not.toHaveBeenCalled();
  });

  it("no busca con menos de dos letras y lo explica", async () => {
    const { escribir, element } = await setup();
    await escribir("d");
    expect(api.listar).not.toHaveBeenCalled();
    expect(element.textContent).toContain("Escribe al menos 2 letras");
  });

  it("espera a que la persona termine de escribir y manda una sola búsqueda", async () => {
    const { campo, asentar } = await setup({ espera: 60 });
    for (const texto of ["do", "dos", "dos de mayo"]) {
      campo().value = texto;
      campo().dispatchEvent(new Event("input"));
    }
    expect(api.listar).not.toHaveBeenCalled();
    await asentar(150);
    expect(api.listar).toHaveBeenCalledTimes(1);
    expect(api.listar).toHaveBeenCalledWith({ q: "dos de mayo", limite: 8 });
  });

  it("muestra el nombre y el RENIPRESS, nivel y categoría de cada resultado", async () => {
    const { escribir, opcionesVisibles, campo } = await setup();
    await escribir("dos");
    expect(opcionesVisibles()).toHaveLength(2);
    expect(opcionesVisibles()[0].textContent).toContain("Hospital Dos de Mayo");
    expect(opcionesVisibles()[0].textContent).toContain("RENIPRESS 6206 · Nivel III · Cat. III-1");
    expect(campo().getAttribute("aria-expanded")).toBe("true");
  });

  it("elegir con el ratón fija el área, cierra la lista y deja su nombre en el campo", async () => {
    const { fixture, escribir, opcionesVisibles, campo, asentar } = await setup();
    await escribir("dos");
    opcionesVisibles()[0].dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    await asentar(0);
    expect(fixture.componentInstance.seleccionada()).toEqual(HOSPITAL);
    expect(campo().value).toBe("Hospital Dos de Mayo");
    expect(campo().getAttribute("aria-expanded")).toBe("false");
  });

  it("con el teclado: flechas para moverse, Enter elige y Escape cierra", async () => {
    const { fixture, escribir, teclear, campo } = await setup();
    await escribir("dos");
    await teclear("ArrowDown");
    await teclear("ArrowDown");
    expect(campo().getAttribute("aria-activedescendant")).toMatch(/-1$/);
    await teclear("ArrowUp");
    await teclear("Enter");
    expect(fixture.componentInstance.seleccionada()).toEqual(HOSPITAL);

    await escribir("bay");
    await teclear("Escape");
    expect(campo().getAttribute("aria-expanded")).toBe("false");
  });

  it("volver a escribir quita el área elegida", async () => {
    const { fixture, escribir, opcionesVisibles, asentar } = await setup();
    await escribir("dos");
    opcionesVisibles()[0].dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    await asentar(0);
    expect(fixture.componentInstance.seleccionada()).not.toBeNull();
    await escribir("otro");
    expect(fixture.componentInstance.seleccionada()).toBeNull();
  });

  it("si la selección se quita desde fuera, vacía el campo", async () => {
    const { fixture, campo, escribir, opcionesVisibles, asentar } = await setup();
    await escribir("dos");
    opcionesVisibles()[0].dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
    await asentar(0);
    fixture.componentInstance.seleccionada.set(null);
    await fixture.whenStable();
    expect(campo().value).toBe("");
  });

  it("por defecto solo ofrece áreas con establecimiento: OTRANS no sale", async () => {
    api.listar.mockReset();
    const { escribir, opcionesVisibles } = await setup();
    api.listar.mockResolvedValue(respuesta([OTRANS, HOSPITAL]));
    await escribir("tr");
    expect(opcionesVisibles().map((opcion) => opcion.textContent?.includes("OTRANS"))).toEqual([false]);
  });

  it("con soloEstablecimientos en falso ofrece también las áreas sin establecimiento", async () => {
    const { escribir, opcionesVisibles } = await setup({ soloEstablecimientos: false });
    api.listar.mockResolvedValue(respuesta([OTRANS, HOSPITAL]));
    await escribir("tr");
    expect(opcionesVisibles()).toHaveLength(2);
  });

  it("sin resultados lo dice", async () => {
    const { escribir, element } = await setup();
    api.listar.mockResolvedValue(respuesta([]));
    await escribir("zzz");
    expect(element.textContent).toContain("No hay áreas que coincidan");
  });

  it("si hay más resultados pide afinar la búsqueda", async () => {
    const { escribir, element } = await setup();
    api.listar.mockResolvedValue(respuesta([HOSPITAL], true));
    await escribir("hos");
    expect(element.textContent).toContain("Hay más resultados");
  });

  it("si falla la búsqueda lo dice sin romper el campo", async () => {
    const { escribir, element, opcionesVisibles } = await setup();
    api.listar.mockRejectedValue(new IncidenciaError(0, null));
    await escribir("dos");
    expect(element.textContent).toContain("No se pudieron cargar las áreas");
    expect(opcionesVisibles()).toHaveLength(0);
  });

  it("la respuesta lenta de una búsqueda anterior no pisa a la más reciente", async () => {
    const { escribir, opcionesVisibles } = await setup();
    let soltar!: (lista: ListaAreas) => void;
    api.listar.mockReturnValueOnce(new Promise<ListaAreas>((resolver) => (soltar = resolver)));
    api.listar.mockResolvedValueOnce(respuesta([CENTRO]));
    await escribir("do");
    await escribir("bay");
    soltar(respuesta([HOSPITAL]));
    await esperar();
    expect(opcionesVisibles().map((opcion) => opcion.textContent)).toEqual([expect.stringContaining("C.S. Bayóvar")]);
  });
});
