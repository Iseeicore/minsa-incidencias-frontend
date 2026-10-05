import { TestBed } from "@angular/core/testing";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { Alert } from "./alert";

describe("Alert", () => {
  async function setup(tone: BadgeTone) {
    const fixture = TestBed.createComponent(Alert);
    fixture.componentRef.setInput("tone", tone);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it("un error se anuncia como alerta", async () => {
    const element = await setup(BadgeTone.DANGER);
    expect(element.getAttribute("role")).toBe("alert");
    expect(element.className).toContain("bg-danger-50");
  });

  it("un éxito se anuncia como estado, sin interrumpir", async () => {
    const element = await setup(BadgeTone.SUCCESS);
    expect(element.getAttribute("role")).toBe("status");
    expect(element.className).toContain("bg-success-50");
  });
});
