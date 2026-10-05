import { FILTRO_TODOS } from "@/features/casos/constants/casos-constants";
import { CASOS_DEMO } from "@/features/casos/data/casos.demo";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import type { FiltrosCasos } from "@/features/casos/types/caso.types";
import { Prioridad } from "@/shared/enums/prioridad.enum";
import { filtrarCasos } from "./filtrar-casos";

const SIN_FILTROS: FiltrosCasos = { tab: FiltroTab.TODOS, texto: "", prioridad: FILTRO_TODOS, estado: FILTRO_TODOS };

describe("filtrarCasos", () => {
  it("sin filtros devuelve todos los casos", () => {
    expect(filtrarCasos(CASOS_DEMO, SIN_FILTROS)).toHaveLength(CASOS_DEMO.length);
  });

  it("cada pestaña de categoría deja solo esa categoría", () => {
    const reclamos = filtrarCasos(CASOS_DEMO, { ...SIN_FILTROS, tab: FiltroTab.RECLAMOS });
    expect(reclamos.length).toBeGreaterThan(0);
    expect(reclamos.every((caso) => caso.categoria === CategoriaCaso.RECLAMO)).toBe(true);

    const corrupcion = filtrarCasos(CASOS_DEMO, { ...SIN_FILTROS, tab: FiltroTab.CORRUPCION });
    expect(corrupcion.every((caso) => caso.categoria === CategoriaCaso.DENUNCIA_CORRUPCION)).toBe(true);
  });

  it("un caso sin categoría (registrado) no aparece en ninguna pestaña de categoría", () => {
    const sinCategoria = CASOS_DEMO.filter((caso) => caso.categoria === null);
    expect(sinCategoria.length).toBeGreaterThan(0);
    for (const tab of [FiltroTab.RECLAMOS, FiltroTab.QUEJAS, FiltroTab.CORRUPCION]) {
      const visibles = filtrarCasos(CASOS_DEMO, { ...SIN_FILTROS, tab });
      expect(visibles.some((caso) => caso.categoria === null)).toBe(false);
    }
  });

  it("la pestaña Críticos deja los de prioridad alta de cualquier categoría", () => {
    const criticos = filtrarCasos(CASOS_DEMO, { ...SIN_FILTROS, tab: FiltroTab.CRITICOS });
    expect(criticos.every((caso) => caso.prioridad === Prioridad.ALTA)).toBe(true);
    expect(new Set(criticos.map((caso) => caso.categoria)).size).toBeGreaterThan(1);
  });

  it("combina pestaña, prioridad y estado", () => {
    const resultado = filtrarCasos(CASOS_DEMO, {
      ...SIN_FILTROS,
      tab: FiltroTab.RECLAMOS,
      prioridad: Prioridad.ALTA,
      estado: EstadoCaso.EN_GESTION,
    });
    expect(resultado.length).toBeGreaterThan(0);
    expect(
      resultado.every(
        (caso) =>
          caso.categoria === CategoriaCaso.RECLAMO && caso.prioridad === Prioridad.ALTA && caso.estado === EstadoCaso.EN_GESTION,
      ),
    ).toBe(true);
  });

  it("la búsqueda ignora tildes y mayúsculas y mira código, área, responsable y etiquetas", () => {
    expect(filtrarCasos(CASOS_DEMO, { ...SIN_FILTROS, texto: "003241" })).toHaveLength(1);
    expect(filtrarCasos(CASOS_DEMO, { ...SIN_FILTROS, texto: "LUCIA" }).length).toBeGreaterThan(0);
    expect(filtrarCasos(CASOS_DEMO, { ...SIN_FILTROS, texto: "cobro indebido" }).length).toBeGreaterThan(0);
    expect(filtrarCasos(CASOS_DEMO, { ...SIN_FILTROS, texto: "area de reclamos" }).length).toBeGreaterThan(0);
  });

  it("un texto que no existe devuelve una lista vacía", () => {
    expect(filtrarCasos(CASOS_DEMO, { ...SIN_FILTROS, texto: "zzzz-no-existe" })).toEqual([]);
  });

  it("los espacios sobrantes de la búsqueda no cuentan", () => {
    expect(filtrarCasos(CASOS_DEMO, { ...SIN_FILTROS, texto: "   " })).toHaveLength(CASOS_DEMO.length);
  });
});
