import { numeroWhatsappDesde, WHATSAPP_NUMERO_POR_DEFECTO } from "./whatsapp.config";

describe("numeroWhatsappDesde", () => {
  it("toma el número configurado", () => {
    expect(numeroWhatsappDesde({ numero: "51987654321" })).toBe("51987654321");
  });

  it("deja solo los dígitos", () => {
    expect(numeroWhatsappDesde({ numero: "+51 987 654 321" })).toBe("51987654321");
  });

  it("sin configuración o con un valor inválido usa el valor por defecto", () => {
    expect(WHATSAPP_NUMERO_POR_DEFECTO).toBe("51944023973");
    expect(numeroWhatsappDesde(undefined)).toBe(WHATSAPP_NUMERO_POR_DEFECTO);
    expect(numeroWhatsappDesde({})).toBe(WHATSAPP_NUMERO_POR_DEFECTO);
    expect(numeroWhatsappDesde({ numero: "" })).toBe(WHATSAPP_NUMERO_POR_DEFECTO);
    expect(numeroWhatsappDesde({ numero: "abc" })).toBe(WHATSAPP_NUMERO_POR_DEFECTO);
    expect(numeroWhatsappDesde({ numero: "123" })).toBe(WHATSAPP_NUMERO_POR_DEFECTO);
    expect(numeroWhatsappDesde({ numero: 51944023973 as never })).toBe(WHATSAPP_NUMERO_POR_DEFECTO);
  });
});
