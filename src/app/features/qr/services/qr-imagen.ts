import { Injectable } from "@angular/core";
import { LADO_QR_PX, MARGEN_QR_MODULOS } from "@/features/qr/constants/qr-constants";

/** Genera el QR en el navegador (la librería se carga la primera vez que se pide); nada sale hacia terceros. */
@Injectable({ providedIn: "root" })
export class QrImagen {
  /** PNG como `data:` URL, de `LADO_QR_PX` de lado, negro sobre blanco, con margen y corrección de errores nivel M. */
  async generarPng(texto: string): Promise<string> {
    // `qrcode` es CommonJS: según el empaquetador, las funciones llegan como export con nombre o dentro de `default`.
    const modulo = await import("qrcode");
    const { toDataURL } = typeof modulo.toDataURL === "function" ? modulo : modulo.default;
    return toDataURL(texto, {
      type: "image/png",
      errorCorrectionLevel: "M",
      width: LADO_QR_PX,
      margin: MARGEN_QR_MODULOS,
    });
  }
}
