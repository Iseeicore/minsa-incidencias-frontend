import { TestBed } from "@angular/core/testing";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import { crearDetalle } from "@/features/casos/testing/caso-builder";
import type { CasoDetalle, RespuestaAccion } from "@/features/casos/types/caso.types";
import { CasoRevision } from "./caso-revision";

const esperar = (ms = 10) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("CasoRevision", () => {
  const api = {
    detalle: vi.fn(),
    confirmar: vi.fn(),
    corregir: vi.fn(),
    derivar: vi.fn(),
    tomar: vi.fn(),
    resolver: vi.fn(),
  };

  beforeEach(() => {
    for (const funcion of Object.values(api)) funcion.mockReset();
    TestBed.configureTestingModule({ providers: [{ provide: IncidenciasApi, useValue: api }] });
  });

  async function abrir(detalle: CasoDetalle | Error, codigo = "MINSA-2026-000001") {
    if (detalle instanceof Error) api.detalle.mockRejectedValue(detalle);
    else api.detalle.mockResolvedValue(detalle);
    const fixture = TestBed.createComponent(CasoRevision);
    document.body.appendChild(fixture.nativeElement);
    fixture.componentRef.setInput("codigo", codigo);
    await fixture.whenStable();
    await esperar();
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
      await esperar();
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

  function respuesta(parcial: Partial<CasoDetalle> | null, mensaje: string): RespuestaAccion {
    return { mensaje, caso: parcial === null ? null : crearDetalle(parcial) };
  }

  afterEach(() => document.body.replaceChildren());

  it("cerrado no muestra nada ni pide nada", async () => {
    const fixture = TestBed.createComponent(CasoRevision);
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector("[role='dialog']")).toBeNull();
    expect(api.detalle).not.toHaveBeenCalled();
  });

  it("al abrir pide el detalle del caso por su código", async () => {
    await abrir(crearDetalle({ codigo: "MINSA-2026-000007" }), "MINSA-2026-000007");
    expect(api.detalle).toHaveBeenCalledWith("MINSA-2026-000007");
  });

  it("mientras llega el detalle muestra que está cargando", async () => {
    api.detalle.mockReturnValue(new Promise(() => undefined));
    const fixture = TestBed.createComponent(CasoRevision);
    document.body.appendChild(fixture.nativeElement);
    fixture.componentRef.setInput("codigo", "MINSA-2026-000001");
    await fixture.whenStable();
    expect((fixture.nativeElement as HTMLElement).querySelector("[role='dialog']")?.textContent).toContain("Cargando el caso");
  });

  it("muestra los datos del caso, las pruebas, la propuesta de la IA, las acciones y el historial", async () => {
    const { panel } = await abrir(
      crearDetalle({
        codigo: "MINSA-2026-000001",
        descripcion: "Pedí cita con cardiología hace dos meses",
        reclamante: "Luis A. · DNI ••••1907",
        confianzaIa: 58,
        acciones: [AccionCaso.CONFIRMAR, AccionCaso.CORREGIR],
        historial: [{ titulo: "Recibido por WhatsApp", detalle: "Registrado como incidencia.", hora: "hace 20 h" }],
        plazo: { tipo: PlazoTipo.ATENCION, estado: PlazoEstado.EN_PLAZO, venceEn: null, horasRestantes: 50 },
      }),
    );
    const texto = panel()?.textContent ?? "";
    expect(texto).toContain("Revisar caso");
    expect(texto).toContain("MINSA-2026-000001");
    expect(texto).toContain("Datos del caso");
    expect(texto).toContain("Pedí cita con cardiología");
    expect(texto).toContain("Luis A. · DNI ••••1907");
    expect(texto).toContain("Vence en 2 días");
    expect(texto).toContain("Área de reclamos");
    expect(texto).toContain("Pruebas");
    expect(texto).toContain("La IA propone");
    expect(texto).toContain("58 % de confianza");
    expect(texto).toContain("Acciones");
    expect(texto).toContain("Historial");
    expect(texto).toContain("Recibido por WhatsApp");
  });

  it("lo que la base no tiene se muestra con un guion", async () => {
    const { panel } = await abrir(crearDetalle({ prioridad: null, organismo: null }));
    const texto = panel()?.textContent ?? "";
    expect(texto).toMatch(/Prioridad\s*—/);
    expect(texto).toMatch(/Organismo\s*—/);
  });

  it("un caso sin archivos lo dice", async () => {
    const { panel } = await abrir(crearDetalle());
    expect(panel()?.textContent).toContain("no adjuntó archivos");
  });

  it("el texto del ciudadano se muestra como texto, no como HTML", async () => {
    const { panel } = await abrir(crearDetalle({ descripcion: "<script>alert(1)</script><img src=x onerror=alert(1)>" }));
    expect(panel()?.querySelector("script")).toBeNull();
    expect(panel()?.querySelector("img")).toBeNull();
    expect(panel()?.textContent).toContain("<script>alert(1)</script>");
  });

  describe("acciones que manda el servidor", () => {
    it("solo muestra los botones de las acciones permitidas", async () => {
      const { boton } = await abrir(crearDetalle({ acciones: [AccionCaso.CONFIRMAR, AccionCaso.CORREGIR] }));
      expect(boton("Confirmar categoría")).toBeDefined();
      expect(boton("Corregir categoría")).toBeDefined();
      expect(boton("Derivar")).toBeUndefined();
      expect(boton("Tomar")).toBeUndefined();
      expect(boton("Resolver")).toBeUndefined();
    });

    it("derivar muestra el área de destino y lo hace", async () => {
      const { panel, boton, pulsar } = await abrir(crearDetalle({ acciones: [AccionCaso.DERIVAR] }));
      expect(boton("Derivar al Área de reclamos")).toBeDefined();
      api.derivar.mockResolvedValue(respuesta({ estado: EstadoCaso.DERIVADO, acciones: [] }, "Caso derivado al Área de reclamos."));
      await pulsar("Derivar al Área de reclamos");
      expect(api.derivar).toHaveBeenCalledWith("MINSA-2026-000001");
      expect(panel()?.querySelector("[role='status']")?.textContent).toContain("Caso derivado");
      expect(panel()?.textContent).toContain("Derivado");
    });

    it("tomar y resolver aparecen cuando el servidor los permite", async () => {
      const { boton } = await abrir(crearDetalle({ acciones: [AccionCaso.TOMAR, AccionCaso.RESOLVER] }));
      expect(boton("Tomar en gestión")).toBeDefined();
      expect(boton("Resolver el caso")).toBeDefined();
    });

    it("tomar llama al servidor y muestra el éxito", async () => {
      const { panel, pulsar } = await abrir(crearDetalle({ acciones: [AccionCaso.TOMAR] }));
      api.tomar.mockResolvedValue(respuesta({ estado: EstadoCaso.EN_GESTION, acciones: [AccionCaso.RESOLVER] }, "El caso quedó en gestión."));
      await pulsar("Tomar en gestión");
      expect(api.tomar).toHaveBeenCalledWith("MINSA-2026-000001");
      expect(panel()?.querySelector("[role='status']")?.textContent).toContain("en gestión");
    });

    it("sin acciones dice por qué: cerrado", async () => {
      const { panel } = await abrir(crearDetalle({ estado: EstadoCaso.RESUELTO, acciones: [] }));
      expect(panel()?.textContent).toContain("Este caso ya está cerrado");
    });

    it("sin acciones dice por qué: la categoría Otro no tiene área", async () => {
      const { panel } = await abrir(
        crearDetalle({ categoria: CategoriaCaso.OTRO, estado: EstadoCaso.CLASIFICADO, revisadoPorHumano: true, acciones: [] }),
      );
      expect(panel()?.textContent).toContain("La categoría Otro no tiene un área");
    });

    it("sin acciones por otra causa, lo explica con el rol", async () => {
      const { panel } = await abrir(crearDetalle({ estado: EstadoCaso.EN_GESTION, acciones: [] }));
      expect(panel()?.textContent).toContain("No hay acciones disponibles para tu rol");
    });
  });

  describe("confirmar y corregir", () => {
    it("confirmar llama al servidor, muestra el éxito y cierra la revisión", async () => {
      const { panel, pulsar, boton } = await abrir(crearDetalle({ acciones: [AccionCaso.CONFIRMAR, AccionCaso.CORREGIR] }));
      api.confirmar.mockResolvedValue(
        respuesta({ revisadoPorHumano: true, acciones: [AccionCaso.DERIVAR] }, "Categoría confirmada. Se guardó para mejorar la IA."),
      );
      await pulsar("Confirmar categoría");
      expect(api.confirmar).toHaveBeenCalledWith("MINSA-2026-000001");
      expect(panel()?.querySelector("[role='status']")?.textContent).toContain("Categoría confirmada");
      expect(panel()?.textContent).toContain("Confirmada por una persona");
      expect(boton("Confirmar categoría")).toBeUndefined();
      expect(boton("Derivar al Área de reclamos")).toBeDefined();
    });

    it("corregir pide la nueva categoría, muestra el área a la que irá y exige elegir", async () => {
      const { panel, pulsar, boton, escribir } = await abrir(crearDetalle({ acciones: [AccionCaso.CONFIRMAR, AccionCaso.CORREGIR] }));
      await pulsar("Corregir categoría");
      expect(boton("Aplicar corrección")?.disabled).toBe(true);

      await escribir("select", "queja");
      expect(panel()?.textContent).toContain("Área de quejas");
      expect(boton("Aplicar corrección")?.disabled).toBe(false);

      api.corregir.mockResolvedValue(
        respuesta(
          { categoria: CategoriaCaso.QUEJA, corregida: true, revisadoPorHumano: true, acciones: [] },
          "Categoría corregida a Queja. Se guardó para mejorar la IA.",
        ),
      );
      await pulsar("Aplicar corrección");
      expect(api.corregir).toHaveBeenCalledWith("MINSA-2026-000001", "queja");
      expect(panel()?.querySelector("[role='status']")?.textContent).toContain("Categoría corregida a Queja");
      expect(panel()?.textContent).toContain("Corregida a Queja");
    });

    it("la categoría actual no se ofrece para corregir", async () => {
      const { element, pulsar } = await abrir(crearDetalle({ categoria: CategoriaCaso.RECLAMO, acciones: [AccionCaso.CORREGIR] }));
      await pulsar("Corregir categoría");
      const opciones = Array.from(element.querySelectorAll("[role='dialog'] option")).map((opcion) => opcion.getAttribute("value"));
      expect(opciones).not.toContain("reclamo");
      expect(opciones).toContain("queja");
    });

    it("cancelar la corrección no cambia nada ni llama al servidor", async () => {
      const { panel, pulsar, boton } = await abrir(crearDetalle({ acciones: [AccionCaso.CONFIRMAR, AccionCaso.CORREGIR] }));
      await pulsar("Corregir categoría");
      await pulsar("Cancelar");
      expect(boton("Confirmar categoría")).toBeDefined();
      expect(panel()?.querySelector("[role='status']")).toBeNull();
      expect(api.corregir).not.toHaveBeenCalled();
    });

    it("al corregir a una categoría que el rol no ve, el panel avisa y queda abierto sin error", async () => {
      const { fixture, panel, pulsar, escribir } = await abrir(crearDetalle({ acciones: [AccionCaso.CORREGIR] }));
      await pulsar("Corregir categoría");
      await escribir("select", "denuncia-corrupcion");
      api.corregir.mockResolvedValue(
        respuesta(null, "Categoría corregida. El caso pasó al área de denuncias por corrupción y ya no aparece en tu lista."),
      );
      await pulsar("Aplicar corrección");

      const texto = panel()?.textContent ?? "";
      expect(panel()?.querySelector("[role='status']")?.textContent).toContain("área de denuncias por corrupción");
      expect(texto).toContain("ya no aparece en tu lista");
      expect(texto).not.toContain("ya no está disponible para tu rol");

      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await fixture.whenStable();
      expect(panel()).toBeNull();
      expect(fixture.componentInstance.codigo()).toBeNull();
    });
  });

  describe("resolver", () => {
    it("exige el texto y lo manda al servidor", async () => {
      const { panel, boton, pulsar, escribir } = await abrir(crearDetalle({ estado: EstadoCaso.EN_GESTION, acciones: [AccionCaso.RESOLVER] }));
      await pulsar("Resolver el caso");
      expect(boton("Registrar resolución")?.disabled).toBe(true);
      expect(panel()?.textContent).toContain("no se puede deshacer");

      await escribir("textarea", "Se entregó el medicamento.");
      expect(boton("Registrar resolución")?.disabled).toBe(false);
      api.resolver.mockResolvedValue(
        respuesta({ estado: EstadoCaso.RESUELTO, resolucion: "Se entregó el medicamento.", acciones: [] }, "Caso resuelto."),
      );
      await pulsar("Registrar resolución");

      expect(api.resolver).toHaveBeenCalledWith("MINSA-2026-000001", "Se entregó el medicamento.");
      expect(panel()?.querySelector("[role='status']")?.textContent).toContain("Caso resuelto");
      expect(panel()?.textContent).toContain("Se entregó el medicamento.");
      expect(panel()?.textContent).toContain("Este caso ya está cerrado");
    });
  });

  describe("errores del servidor al actuar", () => {
    it("un 403 se muestra como alerta y el panel sigue abierto con sus acciones", async () => {
      const { panel, pulsar, boton } = await abrir(crearDetalle({ acciones: [AccionCaso.DERIVAR] }));
      api.derivar.mockRejectedValue(new IncidenciaError(403, "FORBIDDEN"));
      await pulsar("Derivar al Área de reclamos");
      expect(panel()?.querySelector("[role='alert']")?.textContent).toContain("No tienes permiso");
      expect(boton("Derivar al Área de reclamos")).toBeDefined();
    });

    it("un 409 explica que otra persona pudo actuar antes", async () => {
      const { panel, pulsar } = await abrir(crearDetalle({ acciones: [AccionCaso.CONFIRMAR] }));
      api.confirmar.mockRejectedValue(new IncidenciaError(409, "CONFLICT"));
      await pulsar("Confirmar categoría");
      expect(panel()?.querySelector("[role='alert']")?.textContent).toContain("otra persona");
    });

    it("un fallo de red al actuar lo dice", async () => {
      const { panel, pulsar } = await abrir(crearDetalle({ acciones: [AccionCaso.TOMAR] }));
      api.tomar.mockRejectedValue(new IncidenciaError(0, null));
      await pulsar("Tomar en gestión");
      expect(panel()?.querySelector("[role='alert']")?.textContent).toContain("conectar");
    });
  });

  describe("pruebas sensibles", () => {
    it("no se abren solas: salen tapadas con una advertencia y se abren a pedido", async () => {
      const { panel, pulsar } = await abrir(
        crearDetalle({
          evidencias: [{ nombre: "captura-mensaje.png", tipo: "imagen", fecha: "hace 3 días", sensible: true, verificada: false }],
        }),
      );
      expect(panel()?.textContent).toContain("Hay evidencias sensibles");
      expect(panel()?.textContent).toContain("Archivo sensible");
      expect(panel()?.textContent).not.toContain("captura-mensaje.png");

      await pulsar("Abrir");
      expect(panel()?.textContent).toContain("captura-mensaje.png");
      expect(panel()?.textContent).toContain("vista previa de archivos");
    });

    it("un video se rotula como video", async () => {
      const { panel } = await abrir(
        crearDetalle({ evidencias: [{ nombre: "clip.mp4", tipo: "video", fecha: "hoy", sensible: false, verificada: true }] }),
      );
      expect(panel()?.textContent).toContain("Video");
      expect(panel()?.textContent).toContain("Verificada");
    });
  });

  describe("al abrir un caso", () => {
    it("un caso que el rol no ve (404) lo dice", async () => {
      const { panel } = await abrir(new IncidenciaError(404, "NOT_FOUND"));
      expect(panel()?.textContent).toContain("ya no está disponible para tu rol");
    });

    it("un fallo de red lo dice y permite reintentar", async () => {
      const { panel, pulsar } = await abrir(new IncidenciaError(0, null));
      expect(panel()?.querySelector("[role='alert']")?.textContent).toContain("conectar");

      api.detalle.mockResolvedValue(crearDetalle({ descripcion: "Relato recuperado" }));
      await pulsar("Reintentar");
      expect(panel()?.textContent).toContain("Relato recuperado");
    });
  });

  it("Escape cierra el panel y limpia el código", async () => {
    const { fixture, panel } = await abrir(crearDetalle());
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    await fixture.whenStable();
    expect(panel()).toBeNull();
    expect(fixture.componentInstance.codigo()).toBeNull();
  });

  it("al cambiar de caso borra el aviso del anterior", async () => {
    const { fixture, panel, pulsar } = await abrir(crearDetalle({ acciones: [AccionCaso.TOMAR] }));
    api.tomar.mockResolvedValue(respuesta({ estado: EstadoCaso.EN_GESTION }, "El caso quedó en gestión."));
    await pulsar("Tomar en gestión");
    expect(panel()?.querySelector("[role='status']")).not.toBeNull();

    api.detalle.mockResolvedValue(crearDetalle({ codigo: "MINSA-2026-000002" }));
    fixture.componentRef.setInput("codigo", "MINSA-2026-000002");
    await fixture.whenStable();
    await esperar();
    await fixture.whenStable();
    expect(panel()?.querySelector("[role='status']")).toBeNull();
    expect(panel()?.textContent).toContain("MINSA-2026-000002");
  });
});
