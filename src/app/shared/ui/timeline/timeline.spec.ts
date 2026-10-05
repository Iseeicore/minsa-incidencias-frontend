import { TestBed } from "@angular/core/testing";
import { Timeline, type TimelineItem } from "./timeline";

describe("Timeline", () => {
  async function setup(items: readonly TimelineItem[]) {
    const fixture = TestBed.createComponent(Timeline);
    fixture.componentRef.setInput("items", items);
    fixture.componentRef.setInput("label", "Trazabilidad");
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it("dibuja un paso por elemento con título, detalle y hora", async () => {
    const element = await setup([
      { titulo: "IA", detalle: "Clasificó como reclamo", hora: "09:12" },
      { titulo: "Área" },
    ]);
    const pasos = element.querySelectorAll("li");
    expect(pasos).toHaveLength(2);
    expect(pasos[0].textContent).toContain("Clasificó como reclamo");
    expect(pasos[0].textContent).toContain("09:12");
    expect(pasos[1].querySelectorAll("p")).toHaveLength(1);
  });

  it("marca distinto un paso pendiente", async () => {
    const element = await setup([{ titulo: "Hecho" }, { titulo: "Falta", pendiente: true }]);
    const puntos = Array.from(element.querySelectorAll("li > span"));
    expect(puntos[0].className).toContain("bg-primary-500");
    expect(puntos[1].className).toContain("bg-gray-300");
  });

  it("es una lista con nombre accesible", async () => {
    const element = await setup([{ titulo: "IA" }]);
    expect(element.querySelector("ol")?.getAttribute("aria-label")).toBe("Trazabilidad");
  });
});
