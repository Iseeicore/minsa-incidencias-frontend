import { InjectionToken } from "@angular/core";
import { environment } from "@env/environment";
import type { WhatsappEnvironment } from "@env/environment.types";

export const WHATSAPP_NUMERO_POR_DEFECTO = "51944023973";

const MINIMO_DIGITOS = 8;
const MAXIMO_DIGITOS = 15;

/** Solo dígitos (código de país incluido, sin «+»): un valor vacío o inválido no rompe la pantalla y cae al valor por defecto. */
export function numeroWhatsappDesde(origen: Partial<WhatsappEnvironment> | undefined): string {
  const digitos = typeof origen?.numero === "string" ? origen.numero.replace(/\D/g, "") : "";
  return digitos.length >= MINIMO_DIGITOS && digitos.length <= MAXIMO_DIGITOS ? digitos : WHATSAPP_NUMERO_POR_DEFECTO;
}

export const WHATSAPP_NUMERO = new InjectionToken<string>("WHATSAPP_NUMERO", {
  providedIn: "root",
  factory: () => numeroWhatsappDesde(environment.whatsapp),
});
