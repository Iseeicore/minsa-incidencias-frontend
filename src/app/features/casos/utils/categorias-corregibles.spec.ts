import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { TipoArea } from "@/shared/enums/tipo-area.enum";
import { categoriasCorregibles, tipoAreaDeDestino } from "./categorias-corregibles";

describe("categoriasCorregibles", () => {
  it("un establecimiento no puede elegir corrupción", () => {
    const categorias = categoriasCorregibles(TipoArea.ESTABLECIMIENTO);
    expect(categorias).not.toContain(CategoriaCaso.DENUNCIA_CORRUPCION);
    expect(categorias).toEqual([CategoriaCaso.QUEJA, CategoriaCaso.RECLAMO, CategoriaCaso.OTRO]);
  });

  it("OTRANS y quien no tiene área (administrador) pueden elegir cualquiera", () => {
    expect(categoriasCorregibles(TipoArea.OTRANS)).toContain(CategoriaCaso.DENUNCIA_CORRUPCION);
    expect(categoriasCorregibles(null)).toContain(CategoriaCaso.DENUNCIA_CORRUPCION);
  });
});

describe("tipoAreaDeDestino", () => {
  it("la corrupción va a OTRANS y lo demás a un establecimiento", () => {
    expect(tipoAreaDeDestino(CategoriaCaso.DENUNCIA_CORRUPCION)).toBe(TipoArea.OTRANS);
    expect(tipoAreaDeDestino(CategoriaCaso.RECLAMO)).toBe(TipoArea.ESTABLECIMIENTO);
    expect(tipoAreaDeDestino(null)).toBe(TipoArea.ESTABLECIMIENTO);
  });
});
