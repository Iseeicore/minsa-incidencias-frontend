import { TestBed } from "@angular/core/testing";
import { Tabs } from "./tabs";

describe("Tabs", () => {
  async function setup(valor: string) {
    const fixture = TestBed.createComponent(Tabs);
    fixture.componentRef.setInput("options", [
      { value: "a", label: "Uno" },
      { value: "b", label: "Dos" },
    ]);
    fixture.componentRef.setInput("label", "Opciones");
    fixture.componentRef.setInput("value", valor);
    await fixture.whenStable();
    const tabs = () => Array.from((fixture.nativeElement as HTMLElement).querySelectorAll<HTMLButtonElement>("[role='tab']"));
    return { fixture, tabs };
  }

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
});
