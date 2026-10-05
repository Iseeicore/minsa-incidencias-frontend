import { HttpErrorResponse } from "@angular/common/http";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { IncidenciaError, mensajeDeError, RespuestaInvalidaError, toIncidenciaError } from "./incidencia-error";

function http(status: number, errorCode?: string): HttpErrorResponse {
  return new HttpErrorResponse({ status, error: errorCode ? { errorCode } : null });
}

describe("incidencia-error", () => {
  it("toIncidenciaError conserva el estado HTTP y el errorCode del servidor", () => {
    const error = toIncidenciaError(http(409, "CONFLICT"));
    expect(error).toBeInstanceOf(IncidenciaError);
    expect(error.estado).toBe(409);
    expect(error.codigo).toBe("CONFLICT");
  });

  it("un error sin cuerpo no trae errorCode", () => {
    expect(toIncidenciaError(http(500)).codigo).toBeNull();
  });

  it("lo que no es una respuesta HTTP se trata como fallo de red", () => {
    expect(toIncidenciaError(new Error("x")).estado).toBe(0);
  });

  it("un IncidenciaError ya traducido se devuelve igual", () => {
    const original = new IncidenciaError(404, "NOT_FOUND");
    expect(toIncidenciaError(original)).toBe(original);
  });

  it("una respuesta con forma inesperada se conserva para explicarla aparte", () => {
    const original = new RespuestaInvalidaError("estado");
    expect(toIncidenciaError(original)).toBe(original);
  });

  it.each([
    [0, "conectar"],
    [400, "Revisa"],
    [403, "No tienes permiso"],
    [404, "ya no está disponible"],
    [409, "otra persona"],
    [429, "Demasiadas"],
    [500, "No se pudo completar"],
  ])("el estado %i muestra un mensaje claro que contiene «%s»", (estado, texto) => {
    expect(mensajeDeError(new IncidenciaError(estado, null))).toContain(texto);
  });

  it("un 422 al corregir explica que la categoría debe ser distinta", () => {
    expect(mensajeDeError(new IncidenciaError(422, "UNPROCESSABLE"), AccionCaso.CORREGIR)).toContain("distinta");
  });

  it("un 422 de otra acción usa el mensaje de datos no válidos", () => {
    expect(mensajeDeError(new IncidenciaError(422, "UNPROCESSABLE"), AccionCaso.RESOLVER)).toContain("Revisa");
  });

  it("una respuesta con forma inesperada se explica sin mostrar detalles", () => {
    expect(mensajeDeError(new RespuestaInvalidaError("estado"))).toContain("respuesta inesperada");
  });

  it("un error cualquiera cae en el mensaje genérico sin repetir su texto", () => {
    expect(mensajeDeError(new Error("secreto interno"))).not.toContain("secreto interno");
  });
});
