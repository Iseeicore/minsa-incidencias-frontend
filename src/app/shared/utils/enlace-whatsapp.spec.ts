import { construirEnlaceWhatsapp, ETIQUETA_CODIGO_IPRESS, formatearNumeroWhatsapp } from "./enlace-whatsapp";

const NUMERO = "51944023973";

describe("construirEnlaceWhatsapp", () => {
  it("arma el mensaje exacto con «CODIGO-IPRESS», un espacio y el código RENIPRESS", () => {
    const { mensaje } = construirEnlaceWhatsapp(NUMERO, "HOSPITAL NACIONAL DOS DE MAYO", "6206");
    expect(mensaje).toBe("Hola quiero presentar una incidencia HOSPITAL NACIONAL DOS DE MAYO - CODIGO-IPRESS 6206");
  });

  it("la etiqueta del código es una constante exportada", () => {
    expect(ETIQUETA_CODIGO_IPRESS).toBe("CODIGO-IPRESS");
    expect(construirEnlaceWhatsapp(NUMERO, "X", "1").mensaje).toContain(` - ${ETIQUETA_CODIGO_IPRESS} 1`);
  });

  it("el enlace es wa.me con el número y el mensaje codificado con encodeURIComponent", () => {
    const { mensaje, enlace } = construirEnlaceWhatsapp(NUMERO, "HOSPITAL NACIONAL DOS DE MAYO", "6206");
    expect(enlace).toBe(
      "https://wa.me/51944023973?text=Hola%20quiero%20presentar%20una%20incidencia%20HOSPITAL%20NACIONAL%20DOS%20DE%20MAYO%20-%20CODIGO-IPRESS%206206",
    );
    expect(decodeURIComponent(enlace.split("?text=")[1] ?? "")).toBe(mensaje);
  });

  it("codifica tildes y eñes y se puede decodificar sin pérdida", () => {
    const nombre = "C.S. SAN JOSÉ DE NIÑOS ÑAÑA";
    const { mensaje, enlace } = construirEnlaceWhatsapp(NUMERO, nombre, "12");
    expect(enlace).toContain("%C3%89");
    expect(enlace).toContain("%C3%91");
    expect(enlace).not.toMatch(/[ÉÑ]/);
    expect(decodeURIComponent(enlace.split("?text=")[1] ?? "")).toBe(mensaje);
    expect(mensaje).toContain(nombre);
  });

  it("& y paréntesis no rompen la consulta: el & se codifica y los paréntesis sobreviven al decodificar", () => {
    const nombre = "P.S. LUZ & VIDA (ANEXO 2)";
    const { mensaje, enlace } = construirEnlaceWhatsapp(NUMERO, nombre, "345");
    const texto = enlace.split("?text=")[1] ?? "";
    expect(texto).not.toContain("&");
    expect(texto).toContain("%26");
    expect(new URL(enlace).searchParams.get("text")).toBe(mensaje);
    expect(mensaje).toBe("Hola quiero presentar una incidencia P.S. LUZ & VIDA (ANEXO 2) - CODIGO-IPRESS 345");
  });

  it("un nombre largo se conserva completo", () => {
    const nombre = "INSTITUTO NACIONAL DE ENFERMEDADES NEOPLASICAS - SEDE PRINCIPAL DE LA CIUDAD DE LIMA METROPOLITANA ".repeat(3).trim();
    const { mensaje, enlace } = construirEnlaceWhatsapp(NUMERO, nombre, "7");
    expect(new URL(enlace).searchParams.get("text")).toBe(mensaje);
    expect(mensaje.endsWith("- CODIGO-IPRESS 7")).toBe(true);
    expect(mensaje).toContain(nombre);
  });

  it("limpia el número a solo dígitos y quita ceros a la izquierda del código", () => {
    const { enlace, mensaje } = construirEnlaceWhatsapp("+51 944 023 973", "Posta X", "006206");
    expect(enlace.startsWith("https://wa.me/51944023973?text=")).toBe(true);
    expect(mensaje.endsWith("CODIGO-IPRESS 6206")).toBe(true);
  });

  it("normaliza espacios sobrantes del nombre", () => {
    expect(construirEnlaceWhatsapp(NUMERO, "  Posta   Norte ", "5").mensaje).toBe("Hola quiero presentar una incidencia Posta Norte - CODIGO-IPRESS 5");
  });
});

describe("formatearNumeroWhatsapp", () => {
  it("da el formato peruano con espacios", () => {
    expect(formatearNumeroWhatsapp("51944023973")).toBe("+51 944 023 973");
    expect(formatearNumeroWhatsapp("+51 944-023-973")).toBe("+51 944 023 973");
  });

  it("un número que no es peruano de once dígitos va solo con el signo más", () => {
    expect(formatearNumeroWhatsapp("14155550100")).toBe("+14155550100");
  });
});
