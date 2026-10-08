import { TestBed } from "@angular/core/testing";
import { WHATSAPP_NUMERO } from "@/core/config/whatsapp.config";
import { DescargaArchivo } from "@/features/qr/services/descarga-archivo";
import { QrImagen } from "@/features/qr/services/qr-imagen";
import type { EstablecimientoQr } from "@/features/qr/types/establecimiento-qr.types";
import { QrModal } from "./qr-modal";

const HOSPITAL: EstablecimientoQr = {
  id: "10",
  nombre: "HOSPITAL NACIONAL DOS DE MAYO",
  codigoRenipress: "6206",
  nivelAtencion: "III",
  categoria: "III-1",
};
const PNG = "data:image/png;base64,AAAA";
const esperar = (ms = 5) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("QrModal", () => {
  async function setup(establecimiento: EstablecimientoQr | null = HOSPITAL, generar = vi.fn().mockResolvedValue(PNG)) {
    const descargar = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        { provide: QrImagen, useValue: { generarPng: generar } },
        { provide: DescargaArchivo, useValue: { descargar } },
        { provide: WHATSAPP_NUMERO, useValue: "51944023973" },
      ],
    });
    const fixture = TestBed.createComponent(QrModal);
    fixture.componentRef.setInput("establecimiento", establecimiento);
    const cerrado = vi.fn();
    fixture.componentInstance.cerrado.subscribe(cerrado);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await esperar();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;
    return { fixture, element, generar, descargar, cerrado };
  }

  afterEach(() => document.body.replaceChildren());

  it("cerrado no muestra nada", async () => {
    const { element, generar } = await setup(null);
    expect(element.querySelector("[role='dialog']")).toBeNull();
    expect(generar).not.toHaveBeenCalled();
  });

  it("muestra nombre, RENIPRESS, el texto exacto del mensaje y el número", async () => {
    const { element } = await setup();
    const dialogo = element.querySelector("[role='dialog']") as HTMLElement;
    expect(dialogo.getAttribute("aria-modal")).toBe("true");
    const texto = dialogo.textContent ?? "";
    expect(texto).toContain("HOSPITAL NACIONAL DOS DE MAYO");
    expect(texto).toContain("RENIPRESS 6206");
    expect(texto).toContain("Hola quiero presentar una incidencia HOSPITAL NACIONAL DOS DE MAYO - CODIGO-IPRESS 6206");
    expect(texto).toContain("+51 944 023 973");
  });

  it("genera el QR del enlace de WhatsApp y lo muestra con el nombre del establecimiento en el alt", async () => {
    const { element, generar } = await setup();
    expect(generar).toHaveBeenCalledTimes(1);
    expect(generar).toHaveBeenCalledWith(
      "https://wa.me/51944023973?text=Hola%20quiero%20presentar%20una%20incidencia%20HOSPITAL%20NACIONAL%20DOS%20DE%20MAYO%20-%20CODIGO-IPRESS%206206",
    );
    const imagen = element.querySelector<HTMLImageElement>("[role='dialog'] img");
    expect(imagen?.getAttribute("src")).toBe(PNG);
    expect(imagen?.getAttribute("alt")).toBe("Código QR de WhatsApp de HOSPITAL NACIONAL DOS DE MAYO");
  });

  it("Descargar baja el PNG con el nombre qr-eess-<codigoRenipress>.png", async () => {
    const { element, descargar } = await setup();
    const boton = Array.from(element.querySelectorAll<HTMLButtonElement>("[role='dialog'] button")).find((candidato) =>
      candidato.textContent?.includes("Descargar"),
    ) as HTMLButtonElement;
    expect(boton.disabled).toBe(false);
    boton.click();
    expect(descargar).toHaveBeenCalledExactlyOnceWith(PNG, "qr-eess-6206.png");
  });

  it("mientras se genera lo avisa y Descargar está deshabilitado", async () => {
    let soltar!: (valor: string) => void;
    const generar = vi.fn().mockReturnValue(new Promise<string>((resolver) => (soltar = resolver)));
    const { element, fixture } = await setup(HOSPITAL, generar);
    expect(element.textContent).toContain("Generando el código QR");
    const boton = Array.from(element.querySelectorAll<HTMLButtonElement>("[role='dialog'] button")).find((candidato) =>
      candidato.textContent?.includes("Descargar"),
    ) as HTMLButtonElement;
    expect(boton.disabled).toBe(true);
    soltar(PNG);
    await esperar();
    await fixture.whenStable();
    expect(element.querySelector("[role='dialog'] img")).not.toBeNull();
  });

  it("si falla la generación lo dice y permite reintentar", async () => {
    const generar = vi.fn().mockRejectedValueOnce(new Error("sin canvas")).mockResolvedValue(PNG);
    const { element, fixture } = await setup(HOSPITAL, generar);
    expect(element.querySelector("[role='alert']")?.textContent).toContain("No se pudo generar el código QR");
    const reintentar = Array.from(element.querySelectorAll<HTMLButtonElement>("button")).find((candidato) =>
      candidato.textContent?.includes("Reintentar"),
    ) as HTMLButtonElement;
    reintentar.click();
    await esperar();
    await fixture.whenStable();
    expect(generar).toHaveBeenCalledTimes(2);
    expect(element.querySelector("[role='dialog'] img")).not.toBeNull();
  });

  it("Escape cierra el diálogo", async () => {
    const { cerrado } = await setup();
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
    expect(cerrado).toHaveBeenCalledTimes(1);
  });

  it("el botón Cerrar cierra el diálogo y el foco entra al abrirlo", async () => {
    const { element, cerrado } = await setup();
    const dialogo = element.querySelector("[role='dialog']") as HTMLElement;
    expect(dialogo.contains(document.activeElement)).toBe(true);
    (dialogo.querySelector("button[aria-label='Cerrar el panel']") as HTMLButtonElement).click();
    expect(cerrado).toHaveBeenCalledTimes(1);
  });
});
