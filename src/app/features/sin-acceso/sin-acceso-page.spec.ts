import { TestBed } from "@angular/core/testing";
import { SinAccesoPage } from "./sin-acceso-page";

describe("SinAccesoPage", () => {
  async function setup() {
    TestBed.configureTestingModule({ imports: [SinAccesoPage] });
    const fixture = TestBed.createComponent(SinAccesoPage);
    await fixture.whenStable();
    return fixture.nativeElement as HTMLElement;
  }

  it("avisa que la cuenta no tiene vistas asignadas y a quién acudir", async () => {
    const element = await setup();
    expect(element.querySelector("h1")?.textContent).toContain("Sin acceso");
    expect(element.textContent).toContain("administrador");
  });

  it("el aviso se anuncia a los lectores de pantalla", async () => {
    const element = await setup();
    expect(element.querySelector("[role='status'], [role='alert']")).not.toBeNull();
  });
});
