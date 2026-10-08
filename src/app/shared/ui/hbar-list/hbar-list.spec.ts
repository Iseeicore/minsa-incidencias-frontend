import { TestBed } from "@angular/core/testing";
import { HBarList, type HBarDatum } from "./hbar-list";

describe("HBarList", () => {
  async function setup(data: readonly HBarDatum[]) {
    const fixture = TestBed.createComponent(HBarList);
    fixture.componentRef.setInput("data", data);
    fixture.componentRef.setInput("label", "Casos por categoría");
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  const barras = (element: HTMLElement) => Array.from(element.querySelectorAll<HTMLElement>("[role='meter']"));

  it("mide cada barra contra el valor mayor de la lista", async () => {
    const element = await setup([
      { label: "Reclamos", valor: 200 },
      { label: "Quejas", valor: 100 },
    ]);
    const [reclamos, quejas] = barras(element);
    expect(reclamos.style.width).toBe("100%");
    expect(quejas.style.width).toBe("50%");
  });

  it("muestra el valor y el detalle de cada fila y los expone a los lectores de pantalla", async () => {
    const element = await setup([{ label: "Reclamos", valor: 604, detalle: "48 %" }]);
    expect(element.textContent).toContain("Reclamos");
    expect(element.textContent).toContain("48 %");
    expect(barras(element)[0].getAttribute("aria-valuenow")).toBe("604");
    expect(barras(element)[0].getAttribute("aria-valuemax")).toBe("604");
    expect(element.querySelector("ul")?.getAttribute("aria-label")).toBe("Casos por categoría");
  });

  it("un valor cero no dibuja barra y un valor pequeño sigue visible", async () => {
    const element = await setup([
      { label: "A", valor: 1000 },
      { label: "B", valor: 5 },
      { label: "C", valor: 0 },
    ]);
    const [, b, c] = barras(element);
    expect(b.style.width).toBe("3%");
    expect(c.style.width).toBe("0%");
  });

  it("si todos los valores son cero no dibuja ninguna barra", async () => {
    const element = await setup([
      { label: "A", valor: 0 },
      { label: "B", valor: 0 },
    ]);
    expect(barras(element).map((barra) => barra.style.width)).toEqual(["0%", "0%"]);
  });

  it("sin datos no falla ni dibuja filas", async () => {
    const element = await setup([]);
    expect(barras(element)).toHaveLength(0);
    expect(element.querySelectorAll("li")).toHaveLength(0);
  });

  it("un nombre largo se parte en lugar de empujar el contenedor", async () => {
    const largo = "Establecimiento de salud con un nombre larguísimo que no cabe en una sola línea de la tarjeta";
    const element = await setup([{ label: largo, valor: 10 }]);
    const nombre = element.querySelector("li span") as HTMLElement;
    expect(nombre.textContent).toContain(largo);
    expect(nombre.className).toContain("min-w-0");
    expect(nombre.className).toContain("break-words");
    expect(element.className).toContain("min-w-0");
  });

  it("separa los miles del valor", async () => {
    const element = await setup([{ label: "A", valor: 1248 }]);
    expect(element.querySelector("li")?.textContent).toMatch(/1\D248/);
  });
});
