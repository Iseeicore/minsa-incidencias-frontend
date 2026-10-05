import { TestBed } from "@angular/core/testing";
import { CasosStore } from "@/features/casos/casos.store";
import { RolDemo } from "@/features/casos/enums/rol-demo.enum";
import { CasoRevision } from "./caso-revision";

describe("CasoRevision", () => {
  async function abrir(rol: RolDemo, codigo: string) {
    const fixture = TestBed.createComponent(CasoRevision);
    document.body.appendChild(fixture.nativeElement);
    TestBed.inject(CasosStore).cambiarRol(rol);
    fixture.componentRef.setInput("codigo", codigo);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const panel = () => element.querySelector("[role='dialog']") as HTMLElement | null;
    const botones = () => Array.from(element.querySelectorAll<HTMLButtonElement>("[role='dialog'] button"));
    const boton = (texto: string) => botones().find((candidato) => candidato.textContent?.includes(texto));
    const pulsar = async (texto: string) => {
      const objetivo = boton(texto);
      if (!objetivo) throw new Error(`No hay un botón con el texto "${texto}"`);
      objetivo.click();
      await fixture.whenStable();
    };
    const escribir = async (selector: string, valor: string) => {
      const campo = element.querySelector<HTMLTextAreaElement | HTMLSelectElement>(selector) as HTMLTextAreaElement;
      campo.value = valor;
      campo.dispatchEvent(new Event(campo.tagName === "SELECT" ? "change" : "input"));
      await fixture.whenStable();
    };
    return { fixture, element, panel, boton, botones, pulsar, escribir };
  }

  afterEach(() => document.body.replaceChildren());

  it("cerrado no muestra nada", async () => {
    const fixture = TestBed.createComponent(CasoRevision);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector("[role='dialog']")).toBeNull();
  });

  it("al abrir muestra los datos del caso, las pruebas, la propuesta de la IA, las acciones y el historial", async () => {
    const { panel } = await abrir(RolDemo.REVISOR, "MINSA-2026-003230");
    const texto = panel()?.textContent ?? "";
    expect(texto).toContain("Revisar caso");
    expect(texto).toContain("MINSA-2026-003230");
    expect(texto).toContain("Datos del caso");
    expect(texto).toContain("Pedí cita con cardiología");
    expect(texto).toContain("Pruebas");
    expect(texto).toContain("La IA propone");
    expect(texto).toContain("58 % de confianza");
    expect(texto).toContain("Acciones");
    expect(texto).toContain("Historial");
  });

  it("un caso sin archivos lo dice", async () => {
    const { panel } = await abrir(RolDemo.REVISOR, "MINSA-2026-003230");
    expect(panel()?.textContent).toContain("no adjuntó archivos");
  });

  it("el texto del ciudadano se muestra como texto, no como HTML", async () => {
    const { panel } = await abrir(RolDemo.REVISOR, "MINSA-2026-003230");
    expect(panel()?.querySelector("script")).toBeNull();
  });

  describe("revisor", () => {
    it("ve confirmar y corregir, y no ve derivar ni resolver", async () => {
      const { boton } = await abrir(RolDemo.REVISOR, "MINSA-2026-003230");
      expect(boton("Confirmar categoría")).toBeDefined();
      expect(boton("Corregir categoría")).toBeDefined();
      expect(boton("Derivar")).toBeUndefined();
      expect(boton("Resolver")).toBeUndefined();
    });

    it("confirmar muestra el éxito, anota el historial y ya no ofrece acciones", async () => {
      const { panel, pulsar, boton } = await abrir(RolDemo.REVISOR, "MINSA-2026-003230");
      await pulsar("Confirmar categoría");
      expect(panel()?.querySelector("[role='status']")?.textContent).toContain("Categoría confirmada");
      expect(panel()?.textContent).toContain("Confirmada por una persona");
      expect(boton("Confirmar categoría")).toBeUndefined();
      expect(panel()?.textContent).toContain("No hay acciones disponibles");
    });

    it("corregir pide la nueva categoría, muestra el área a la que irá y exige elegir", async () => {
      const { panel, pulsar, boton, escribir } = await abrir(RolDemo.REVISOR, "MINSA-2026-003230");
      await pulsar("Corregir categoría");
      expect(boton("Aplicar corrección")?.disabled).toBe(true);

      await escribir("select", "queja");
      expect(panel()?.textContent).toContain("Área de quejas");
      expect(boton("Aplicar corrección")?.disabled).toBe(false);

      await pulsar("Aplicar corrección");
      expect(panel()?.querySelector("[role='status']")?.textContent).toContain("Categoría corregida a Queja");
      expect(panel()?.textContent).toContain("Corregida a Queja");
    });

    it("cancelar la corrección no cambia nada", async () => {
      const { panel, pulsar, boton } = await abrir(RolDemo.REVISOR, "MINSA-2026-003230");
      await pulsar("Corregir categoría");
      await pulsar("Cancelar");
      expect(boton("Confirmar categoría")).toBeDefined();
      expect(panel()?.querySelector("[role='status']")).toBeNull();
    });
  });

  describe("gestor", () => {
    it("ve derivar con el área de destino y lo deriva", async () => {
      const { panel, boton, pulsar } = await abrir(RolDemo.GESTOR, "MINSA-2026-002915");
      expect(boton("Derivar al Área de reclamos")).toBeDefined();
      await pulsar("Derivar al Área de reclamos");
      expect(panel()?.querySelector("[role='status']")?.textContent).toContain("Caso derivado");
      expect(panel()?.textContent).toContain("Derivado");
    });

    it("un caso de categoría Otro explica por qué no se puede derivar", async () => {
      const { fixture, panel, boton, pulsar } = await abrir(RolDemo.REVISOR, "MINSA-2026-002930");
      await pulsar("Confirmar categoría");
      TestBed.inject(CasosStore).cambiarRol(RolDemo.GESTOR);
      await fixture.whenStable();
      expect(boton("Derivar")).toBeUndefined();
      expect(panel()?.textContent).toContain("La categoría Otro no tiene un área");
    });
  });

  describe("área", () => {
    it("toma el caso y lo resuelve con un texto obligatorio", async () => {
      const { panel, boton, pulsar, escribir } = await abrir(RolDemo.AREA_RECLAMO, "MINSA-2026-003177");
      await pulsar("Tomar en gestión");
      expect(panel()?.querySelector("[role='status']")?.textContent).toContain("en gestión");

      await pulsar("Resolver el caso");
      expect(boton("Registrar resolución")?.disabled).toBe(true);
      expect(panel()?.textContent).toContain("no se puede deshacer");

      await escribir("textarea", "Se entregó el medicamento.");
      expect(boton("Registrar resolución")?.disabled).toBe(false);
      await pulsar("Registrar resolución");

      expect(panel()?.querySelector("[role='status']")?.textContent).toContain("Caso resuelto");
      expect(panel()?.textContent).toContain("Se entregó el medicamento.");
      expect(panel()?.textContent).toContain("Este caso ya está cerrado");
    });
  });

  describe("pruebas sensibles", () => {
    it("no se abren solas: salen tapadas con una advertencia y se abren a pedido", async () => {
      const { panel, pulsar } = await abrir(RolDemo.REVISOR, "MINSA-2026-003152");
      expect(panel()?.textContent).toContain("Hay evidencias sensibles");
      expect(panel()?.textContent).toContain("Archivo sensible");
      expect(panel()?.textContent).not.toContain("captura-mensaje.png");

      await pulsar("Abrir");
      expect(panel()?.textContent).toContain("captura-mensaje.png");
      expect(panel()?.textContent).toContain("Vista previa no disponible");
    });
  });

  it("Escape cierra el panel y limpia el código", async () => {
    const { fixture, panel } = await abrir(RolDemo.REVISOR, "MINSA-2026-003230");
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await fixture.whenStable();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.codigo()).toBeNull();
  });

  it("un caso que el rol no puede ver no se muestra", async () => {
    const { panel } = await abrir(RolDemo.AREA_QUEJA, "MINSA-2026-003230");
    expect(panel()?.textContent).toContain("ya no está disponible para tu rol");
    expect(panel()?.textContent).not.toContain("Pedí cita con cardiología");
  });
});
