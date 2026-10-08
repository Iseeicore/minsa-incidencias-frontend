import { IncidenciaError, RespuestaInvalidaError } from "@/features/casos/services/incidencia-error";
import { mensajeDeErrorUsuario } from "./usuario-error";

describe("mensajeDeErrorUsuario", () => {
  it.each([
    ["LIMITE_USUARIOS_ESTABLECIMIENTO", "ya tiene 3 usuarios activos"],
    ["CORREO_REPETIDO", "Ya existe un usuario con ese correo"],
    ["AUTOEDICION_NO_PERMITIDA", "No puedes cambiar tu propio rol ni desactivar tu propia cuenta"],
  ])("un 409 con %s tiene su mensaje claro", (codigo, texto) => {
    expect(mensajeDeErrorUsuario(new IncidenciaError(409, codigo))).toContain(texto);
  });

  it("un 409 sin código conocido pide actualizar la lista", () => {
    expect(mensajeDeErrorUsuario(new IncidenciaError(409, "CONFLICT"))).toContain("Actualiza la lista");
    expect(mensajeDeErrorUsuario(new IncidenciaError(409, null))).toContain("Actualiza la lista");
  });

  it.each([
    [0, "conectar"],
    [400, "Revisa los datos"],
    [403, "No tienes permiso"],
    [404, "ya no está disponible"],
    [422, "rol o el área"],
    [429, "Demasiadas peticiones"],
    [500, "No se pudo completar"],
  ])("el estado %s se explica en español", (estado, texto) => {
    expect(mensajeDeErrorUsuario(new IncidenciaError(estado, null))).toContain(texto);
  });

  it("una respuesta con forma inesperada y un error desconocido no muestran detalles", () => {
    expect(mensajeDeErrorUsuario(new RespuestaInvalidaError("rol"))).toContain("respuesta inesperada");
    expect(mensajeDeErrorUsuario(new Error("boom"))).toContain("No se pudo completar");
  });
});
