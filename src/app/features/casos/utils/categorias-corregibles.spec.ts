import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { TipoArea } from "@/shared/enums/tipo-area.enum";
import { categoriasCorregibles, corregirASaleDeLaBandeja, tipoAreaDeDestino } from "./categorias-corregibles";

describe("categoriasCorregibles", () => {
  it("ofrece todas las categorías, también corrupción, para cualquier rol", () => {
    expect(categoriasCorregibles()).toEqual(Object.values(CategoriaCaso));
    expect(categoriasCorregibles()).toContain(CategoriaCaso.DENUNCIA_CORRUPCION);
  });
});

describe("corregirASaleDeLaBandeja", () => {
  it("corrupción desde un establecimiento saca el caso de la bandeja", () => {
    expect(corregirASaleDeLaBandeja(TipoArea.ESTABLECIMIENTO, CategoriaCaso.DENUNCIA_CORRUPCION)).toBe(true);
  });

  it("OTRANS y el administrador (sin área) no pierden el caso, y otras categorías tampoco", () => {
    expect(corregirASaleDeLaBandeja(TipoArea.OTRANS, CategoriaCaso.DENUNCIA_CORRUPCION)).toBe(false);
    expect(corregirASaleDeLaBandeja(null, CategoriaCaso.DENUNCIA_CORRUPCION)).toBe(false);
    expect(corregirASaleDeLaBandeja(TipoArea.ESTABLECIMIENTO, CategoriaCaso.QUEJA)).toBe(false);
  });
});

describe("tipoAreaDeDestino", () => {
  it("la corrupción va a OTRANS y lo demás a un establecimiento", () => {
    expect(tipoAreaDeDestino(CategoriaCaso.DENUNCIA_CORRUPCION)).toBe(TipoArea.OTRANS);
    expect(tipoAreaDeDestino(CategoriaCaso.RECLAMO)).toBe(TipoArea.ESTABLECIMIENTO);
    expect(tipoAreaDeDestino(null)).toBe(TipoArea.ESTABLECIMIENTO);
  });
});
