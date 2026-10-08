import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { SessionStore } from "@/core/auth/session.store";
import { WHATSAPP_NUMERO } from "@/core/config/whatsapp.config";
import { BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { AreasApi } from "@/features/casos/services/areas.api";
import type { AreaOpcion, ListaAreas } from "@/features/casos/types/area.types";
import { DescargaArchivo } from "@/features/qr/services/descarga-archivo";
import { QrImagen } from "@/features/qr/services/qr-imagen";
import { TipoArea } from "@/shared/enums/tipo-area.enum";
import { QrPage } from "./qr-page";

const area = (id: string, nombre: string, codigoRenipress: string, nivel: string | null = "III", categoria: string | null = "III-1"): AreaOpcion => ({
  id,
  codigo: `EESS-${codigoRenipress}`,
  nombre,
  tipoArea: TipoArea.ESTABLECIMIENTO,
  establecimiento: { codigoRenipress, nivelAtencion: nivel as never, categoria },
});

const HOSPITAL = area("10", "HOSPITAL NACIONAL DOS DE MAYO", "6206");
const POSTA = area("11", "P.S. SAN JOSE", "123", "I", null);

const lista = (areas: readonly AreaOpcion[], hayMas = false): ListaAreas => ({ areas, siguiente: hayMas ? "cursor-2" : null, hayMas });
const PNG = "data:image/png;base64,AAAA";
const esperar = (ms = 15) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("QrPage", () => {
  async function setup(esAdministrador: boolean, respuesta: ListaAreas = lista([HOSPITAL, POSTA])) {
    const api = { listar: vi.fn().mockResolvedValue(respuesta) };
    const descargar = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: AreasApi, useValue: api },
        { provide: SessionStore, useValue: { esAdministrador: signal(esAdministrador) } },
        { provide: BUSQUEDA_DEBOUNCE_MS, useValue: 0 },
        { provide: WHATSAPP_NUMERO, useValue: "51944023973" },
        { provide: QrImagen, useValue: { generarPng: vi.fn().mockResolvedValue(PNG) } },
        { provide: DescargaArchivo, useValue: { descargar } },
      ],
    });
    const fixture = TestBed.createComponent(QrPage);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await esperar();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    const asentar = async () => {
      await esperar();
      await fixture.whenStable();
    };
    const boton = (texto: string) =>
      Array.from(element.querySelectorAll<HTMLButtonElement>("button")).find((candidato) => candidato.textContent?.includes(texto));
    return { api, element, fixture, asentar, boton, descargar };
  }

  afterEach(() => document.body.replaceChildren());

  describe("administrador", () => {
    it("lista los establecimientos con Establecimiento, RENIPRESS, Nivel, Categoría y Acciones", async () => {
      const { element, api } = await setup(true);
      expect(element.querySelector("h1")?.textContent).toContain("Códigos QR");
      expect(Array.from(element.querySelectorAll("thead th")).map((th) => th.textContent?.trim())).toEqual([
        "Establecimiento",
        "RENIPRESS",
        "Nivel",
        "Categoría",
        "Acciones",
      ]);
      const filas = Array.from(element.querySelectorAll("tbody tr")).map((fila) =>
        Array.from(fila.querySelectorAll("td"))
          .slice(0, 4)
          .map((celda) => celda.textContent?.trim()),
      );
      expect(filas).toEqual([
        ["HOSPITAL NACIONAL DOS DE MAYO", "6206", "III", "III-1"],
        ["P.S. SAN JOSE", "123", "I", "—"],
      ]);
      expect(api.listar).toHaveBeenCalledWith({ tipo: "ESTABLECIMIENTO", limite: 20 });
      expect(element.querySelector("app-qr-propio")).toBeNull();
    });

    it("cada fila tiene un botón «Generar QR» que abre el diálogo con el mensaje de ese establecimiento", async () => {
      const { element, asentar } = await setup(true);
      const botones = element.querySelectorAll<HTMLButtonElement>("tbody button");
      expect(Array.from(botones).map((b) => b.textContent?.trim())).toEqual([
        "Generar QR de HOSPITAL NACIONAL DOS DE MAYO",
        "Generar QR de P.S. SAN JOSE",
      ]);
      botones[1].click();
      await asentar();
      const dialogo = element.querySelector("[role='dialog']");
      expect(dialogo?.textContent).toContain("Hola quiero presentar una incidencia P.S. SAN JOSE - CODIGO-IPRESS 123");
    });

    it("Descargar desde el diálogo usa el código RENIPRESS de la fila elegida", async () => {
      const { element, asentar, boton, descargar } = await setup(true);
      element.querySelector<HTMLButtonElement>("tbody button")?.click();
      await asentar();
      boton("Descargar")?.click();
      expect(descargar).toHaveBeenCalledExactlyOnceWith(PNG, "qr-eess-6206.png");
    });

    it("buscar manda el texto como q al servidor (nombre o código) cuando deja de escribir", async () => {
      const { element, api, asentar } = await setup(true);
      const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
      input.value = "6206";
      input.dispatchEvent(new Event("input"));
      await asentar();
      expect(api.listar).toHaveBeenLastCalledWith({ tipo: "ESTABLECIMIENTO", limite: 20, q: "6206" });
    });

    it("el paginador de cursor usa «establecimientos» y Siguiente pide el cursor del servidor", async () => {
      const { element, api, asentar } = await setup(true, lista([HOSPITAL, POSTA], true));
      const paginador = element.querySelector("app-paginador-cursor") as HTMLElement;
      expect(paginador.textContent).toContain("Página 1 · 2 establecimientos · hay más");
      api.listar.mockResolvedValueOnce(lista([HOSPITAL], false));
      paginador.querySelectorAll("button")[1].click();
      await asentar();
      expect(api.listar).toHaveBeenLastCalledWith({ tipo: "ESTABLECIMIENTO", limite: 20, cursor: "cursor-2" });
      expect(element.querySelector("app-paginador-cursor")?.textContent).toContain("Página 2 · 1 establecimiento");
    });

    it("sin resultados lo dice y ofrece limpiar la búsqueda", async () => {
      const { element, api, boton, asentar } = await setup(true, lista([]));
      expect(element.textContent).toContain("No hay establecimientos.");
      const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
      input.value = "zzz";
      input.dispatchEvent(new Event("input"));
      await asentar();
      expect(element.textContent).toContain("No hay establecimientos que coincidan con la búsqueda.");
      api.listar.mockResolvedValue(lista([HOSPITAL]));
      boton("Limpiar búsqueda")?.click();
      await asentar();
      expect(element.querySelectorAll("tbody tr")).toHaveLength(1);
    });

    it("si falla la carga lo dice y permite reintentar", async () => {
      const { element, api, boton, asentar } = await setup(true);
      api.listar.mockRejectedValueOnce(new IncidenciaError(0, null));
      const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
      input.value = "x";
      input.dispatchEvent(new Event("input"));
      await asentar();
      expect(element.querySelector("[role='alert']")?.textContent).toContain("No se pudieron cargar los establecimientos");
      api.listar.mockResolvedValue(lista([HOSPITAL]));
      boton("Reintentar")?.click();
      await asentar();
      expect(element.querySelector("[role='alert']")).toBeNull();
      expect(element.querySelectorAll("tbody tr")).toHaveLength(1);
    });

    it("mientras carga por primera vez lo avisa", async () => {
      let soltar!: (valor: ListaAreas) => void;
      const api = { listar: vi.fn().mockReturnValue(new Promise<ListaAreas>((resolver) => (soltar = resolver))) };
      TestBed.configureTestingModule({
        providers: [
          { provide: AreasApi, useValue: api },
          { provide: SessionStore, useValue: { esAdministrador: signal(true) } },
          { provide: BUSQUEDA_DEBOUNCE_MS, useValue: 0 },
        ],
      });
      const fixture = TestBed.createComponent(QrPage);
      await fixture.whenStable();
      expect((fixture.nativeElement as HTMLElement).textContent).toContain("Cargando establecimientos");
      soltar(lista([HOSPITAL]));
      await esperar();
      await fixture.whenStable();
      expect((fixture.nativeElement as HTMLElement).textContent).not.toContain("Cargando establecimientos");
    });
  });

  describe("establecimiento", () => {
    it("no ve lista ni buscador: solo el QR de su establecimiento con el mensaje y la descarga", async () => {
      const { element, api, descargar, boton } = await setup(false, lista([HOSPITAL]));
      expect(api.listar).toHaveBeenCalledTimes(1);
      expect(api.listar).toHaveBeenCalledWith({ tipo: "ESTABLECIMIENTO", limite: 1 });
      expect(element.querySelector("table")).toBeNull();
      expect(element.querySelector("input[type='search']")).toBeNull();
      expect(element.querySelector("app-paginador-cursor")).toBeNull();
      expect(element.querySelector("[role='dialog']")).toBeNull();
      const texto = element.textContent ?? "";
      expect(texto).toContain("HOSPITAL NACIONAL DOS DE MAYO");
      expect(texto).toContain("Hola quiero presentar una incidencia HOSPITAL NACIONAL DOS DE MAYO - CODIGO-IPRESS 6206");
      expect(element.querySelector("img")?.getAttribute("alt")).toBe("Código QR de WhatsApp de HOSPITAL NACIONAL DOS DE MAYO");
      boton("Descargar")?.click();
      expect(descargar).toHaveBeenCalledExactlyOnceWith(PNG, "qr-eess-6206.png");
    });

    it("sin establecimiento asignado lo dice", async () => {
      const { element } = await setup(false, lista([]));
      expect(element.textContent).toContain("Tu usuario no tiene un establecimiento asignado.");
      expect(element.querySelector("img")).toBeNull();
    });

    it("si falla la carga lo dice y permite reintentar", async () => {
      const api = { listar: vi.fn().mockRejectedValueOnce(new IncidenciaError(0, null)).mockResolvedValue(lista([HOSPITAL])) };
      TestBed.configureTestingModule({
        providers: [
          { provide: AreasApi, useValue: api },
          { provide: SessionStore, useValue: { esAdministrador: signal(false) } },
          { provide: WHATSAPP_NUMERO, useValue: "51944023973" },
          { provide: QrImagen, useValue: { generarPng: vi.fn().mockResolvedValue(PNG) } },
        ],
      });
      const fixture = TestBed.createComponent(QrPage);
      document.body.appendChild(fixture.nativeElement);
      await fixture.whenStable();
      await esperar();
      await fixture.whenStable();
      const element = fixture.nativeElement as HTMLElement;
      expect(element.querySelector("[role='alert']")?.textContent).toContain("No se pudo cargar tu establecimiento");
      Array.from(element.querySelectorAll<HTMLButtonElement>("button"))
        .find((candidato) => candidato.textContent?.includes("Reintentar"))
        ?.click();
      await esperar();
      await fixture.whenStable();
      expect(element.textContent).toContain("HOSPITAL NACIONAL DOS DE MAYO");
    });
  });
});
