import { TestBed } from "@angular/core/testing";
import { TabsVariante } from "@/shared/enums/tabs.enum";
import { Tabs, type TabOption } from "./tabs";

const OPCIONES: readonly TabOption[] = [
  { value: "a", label: "Uno" },
  { value: "b", label: "Dos" },
];

describe("Tabs", () => {
  async function setup(valor: string, opciones: readonly TabOption[] = OPCIONES, variante?: TabsVariante) {
    const fixture = TestBed.createComponent(Tabs);
    document.body.appendChild(fixture.nativeElement);
    fixture.componentRef.setInput("options", opciones);
    fixture.componentRef.setInput("label", "Opciones");
    fixture.componentRef.setInput("value", valor);
    if (variante) fixture.componentRef.setInput("variante", variante);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const tabs = () => Array.from(element.querySelectorAll<HTMLButtonElement>("[role='tab']"));
    return { fixture, element, tabs };
  }

  afterEach(() => document.body.replaceChildren());

  it("marca como seleccionada solo la opción activa", async () => {
    const { tabs } = await setup("b");
    expect(tabs().map((tab) => tab.getAttribute("aria-selected"))).toEqual(["false", "true"]);
  });

  it("al hacer clic cambia el valor y la selección", async () => {
    const { fixture, tabs } = await setup("a");
    tabs()[1].click();
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe("b");
    expect(tabs()[1].getAttribute("aria-selected")).toBe("true");
  });

  it("es una lista de pestañas con nombre accesible y solo la activa entra en el orden del Tab", async () => {
    const { element, tabs } = await setup("b");
    expect(element.querySelector("[role='tablist']")?.getAttribute("aria-label")).toBe("Opciones");
    expect(tabs().map((tab) => tab.getAttribute("tabindex"))).toEqual(["-1", "0"]);
  });

  it("si el valor no está entre las opciones, la primera pestaña sigue alcanzable con el teclado", async () => {
    const { tabs } = await setup("zzz");
    expect(tabs().map((tab) => tab.getAttribute("tabindex"))).toEqual(["0", "-1"]);
  });

  it("las flechas, Inicio y Fin cambian la pestaña y mueven el foco", async () => {
    const { fixture, element, tabs } = await setup("a");
    const lista = element.querySelector("[role='tablist']") as HTMLElement;
    lista.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe("b");
    expect(document.activeElement).toBe(tabs()[1]);
    lista.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe("a");
    lista.dispatchEvent(new KeyboardEvent("keydown", { key: "End", bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe("b");
    lista.dispatchEvent(new KeyboardEvent("keydown", { key: "Home", bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe("a");
  });

  it("otras teclas no cambian nada", async () => {
    const { fixture, element } = await setup("a");
    (element.querySelector("[role='tablist']") as HTMLElement).dispatchEvent(new KeyboardEvent("keydown", { key: "x", bubbles: true }));
    await fixture.whenStable();
    expect(fixture.componentInstance.value()).toBe("a");
  });

  describe("contador", () => {
    const CON_CANTIDAD: readonly TabOption[] = [
      { value: "a", label: "Uno", cantidad: 12 },
      { value: "b", label: "Dos", cantidad: 1000, conMas: true },
      { value: "c", label: "Tres", cantidad: 0 },
      { value: "d", label: "Cuatro" },
    ];

    it("muestra la cantidad en una píldora, 1000+ si hay más y nada si no hay cantidad", async () => {
      const { tabs } = await setup("a", CON_CANTIDAD, TabsVariante.TARJETA);
      expect(tabs().map((tab) => tab.textContent?.trim())).toEqual(["Uno 12", "Dos 1000+", "Tres 0", "Cuatro"]);
      expect(tabs()[0].querySelector("span")?.className).toContain("tabular-nums");
      expect(tabs()[3].querySelector("span")).toBeNull();
    });

    it("la píldora de la pestaña activa lleva fondo translúcido y las demás gris", async () => {
      const { tabs } = await setup("a", CON_CANTIDAD, TabsVariante.TARJETA);
      expect(tabs()[0].querySelector("span")?.className).toContain("bg-white/20");
      expect(tabs()[1].querySelector("span")?.className).toContain("bg-gray-100");
    });
  });

  describe("variantes", () => {
    it("tarjeta: contenedor blanco redondeado con relleno que desplaza en horizontal por dentro", async () => {
      const { element, tabs } = await setup("a", OPCIONES, TabsVariante.TARJETA);
      for (const clase of ["rounded-2xl", "bg-white", "p-2", "overflow-x-auto", "relative", "max-w-full"]) {
        expect(element.className).toContain(clase);
      }
      expect(tabs()[0].className).toContain("bg-gray-900");
      expect(tabs()[0].className).toContain("text-white");
      expect(tabs()[1].className).toContain("text-gray-700");
    });

    it("chips: píldoras sueltas, la activa oscura", async () => {
      const { element, tabs } = await setup("b", OPCIONES, TabsVariante.CHIPS);
      expect(element.querySelector("[role='tablist']")?.className).not.toContain("bg-gray-100");
      expect(tabs()[0].className).toContain("bg-gray-100");
      expect(tabs()[1].className).toContain("bg-gray-900");
    });

    it("por defecto conserva la píldora gris de siempre", async () => {
      const { element } = await setup("a");
      expect(element.querySelector("[role='tablist']")?.className).toContain("bg-gray-100");
    });
  });
});
