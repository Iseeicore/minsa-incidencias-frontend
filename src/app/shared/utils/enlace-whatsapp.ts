const BASE_WHATSAPP = "https://wa.me/";
/** Etiqueta que antecede al código RENIPRESS en el mensaje; el bot la reconoce para ubicar el establecimiento. */
export const ETIQUETA_CODIGO_IPRESS = "CODIGO-IPRESS";
const CEROS_A_LA_IZQUIERDA = /^0+(?=\d)/;
const NO_DIGITOS = /\D/g;
const ESPACIOS = /\s+/g;
const PREFIJO_PERU = "51";
const LARGO_NUMERO_PERU = 11;

export interface EnlaceWhatsapp {
  /** Texto que llega precargado en el chat: el que el bot reconoce. */
  readonly mensaje: string;
  /** `https://wa.me/<número>?text=<mensaje codificado>`. */
  readonly enlace: string;
}

/**
 * Mensaje y enlace de WhatsApp para presentar una incidencia desde un establecimiento:
 * «Hola quiero presentar una incidencia {Nombre} - CODIGO-IPRESS {RENIPRESS}». El número se limpia a solo dígitos, el código
 * RENIPRESS pierde los ceros a la izquierda y el nombre se normaliza en espacios; el texto se codifica entero con
 * `encodeURIComponent` (tildes, eñes, `&`, paréntesis, etc.).
 */
export function construirEnlaceWhatsapp(numero: string, nombre: string, codigoRenipress: string): EnlaceWhatsapp {
  const mensaje = `Hola quiero presentar una incidencia ${nombre.trim().replace(ESPACIOS, " ")} - ${ETIQUETA_CODIGO_IPRESS} ${codigoRenipress.trim().replace(CEROS_A_LA_IZQUIERDA, "")}`;
  return { mensaje, enlace: `${BASE_WHATSAPP}${numero.replace(NO_DIGITOS, "")}?text=${encodeURIComponent(mensaje)}` };
}

/** «+51 944 023 973» para un celular peruano de once dígitos; cualquier otro número, «+<dígitos>». */
export function formatearNumeroWhatsapp(numero: string): string {
  const digitos = numero.replace(NO_DIGITOS, "");
  if (digitos.startsWith(PREFIJO_PERU) && digitos.length === LARGO_NUMERO_PERU) {
    return `+${PREFIJO_PERU} ${digitos.slice(2, 5)} ${digitos.slice(5, 8)} ${digitos.slice(8)}`;
  }
  return `+${digitos}`;
}
