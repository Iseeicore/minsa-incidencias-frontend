import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { MotivoArchivo } from "@/features/casos/enums/motivo-archivo.enum";
import { PlazoEstado } from "@/features/casos/enums/plazo-estado.enum";
import { PlazoTipo } from "@/features/casos/enums/plazo-tipo.enum";
import { ResultadoResolucion } from "@/features/casos/enums/resultado-resolucion.enum";
import { TipoEvidencia } from "@/features/casos/enums/tipo-evidencia.enum";
import { RespuestaInvalidaError } from "@/features/casos/services/incidencia-error";
import { crearDetalleDto, crearResumenDto } from "@/features/casos/testing/caso-builder";
import { mapearDetalle, mapearResumen } from "./mapear-caso";

describe("mapearResumen", () => {
  it("traduce los textos del servidor a los enums del frontend", () => {
    const caso = mapearResumen(
      crearResumenDto({
        codigo: "MINSA-2026-000042",
        categoria: "denuncia-corrupcion",
        categoriaIa: "queja",
        estado: "en-gestion",
        acciones: ["tomar", "resolver"],
        plazo: { tipo: "atencion", estado: "por-vencer", venceEn: "2026-10-05T18:00:00.000Z", horasRestantes: 8 },
      }),
    );
    expect(caso.codigo).toBe("MINSA-2026-000042");
    expect(caso.categoria).toBe(CategoriaCaso.DENUNCIA_CORRUPCION);
    expect(caso.categoriaIa).toBe(CategoriaCaso.QUEJA);
    expect(caso.estado).toBe(EstadoCaso.EN_GESTION);
    expect(caso.acciones).toEqual([AccionCaso.TOMAR, AccionCaso.RESOLVER]);
    expect(caso.plazo).toEqual({
      tipo: PlazoTipo.ATENCION,
      estado: PlazoEstado.POR_VENCER,
      venceEn: "2026-10-05T18:00:00.000Z",
      horasRestantes: 8,
    });
  });

  it("lo que la base no tiene sigue siendo null o vacío, sin inventar datos", () => {
    const caso = mapearResumen(crearResumenDto({ categoria: null, categoriaIa: null, confianzaIa: null }));
    expect(caso.categoria).toBeNull();
    expect(caso.categoriaIa).toBeNull();
    expect(caso.confianzaIa).toBeNull();
    expect(caso.prioridad).toBeNull();
    expect(caso.organismo).toBeNull();
    expect(caso.etiquetas).toEqual([]);
  });

  it("un caso archivado trae el plazo vacío", () => {
    const caso = mapearResumen(
      crearResumenDto({ estado: "archivado", plazo: { tipo: null, estado: null, venceEn: null, horasRestantes: null } }),
    );
    expect(caso.plazo).toEqual({ tipo: null, estado: null, venceEn: null, horasRestantes: null });
  });

  it("un estado desconocido se rechaza en lugar de mostrarse como otro", () => {
    expect(() => mapearResumen(crearResumenDto({ estado: "inventado" }))).toThrow(RespuestaInvalidaError);
  });

  it("una categoría desconocida se rechaza", () => {
    expect(() => mapearResumen(crearResumenDto({ categoria: "inventada" }))).toThrow(RespuestaInvalidaError);
  });

  it("una acción desconocida se descarta y las conocidas se conservan", () => {
    const caso = mapearResumen(crearResumenDto({ acciones: ["confirmar", "teletransportar"] }));
    expect(caso.acciones).toEqual([AccionCaso.CONFIRMAR]);
  });

  it("un plazo con un tipo desconocido se rechaza", () => {
    expect(() =>
      mapearResumen(crearResumenDto({ plazo: { tipo: "raro", estado: null, venceEn: null, horasRestantes: null } })),
    ).toThrow(RespuestaInvalidaError);
  });
});

describe("mapearDetalle", () => {
  it("agrega el relato, el reclamante, la resolución, las pruebas y el historial", () => {
    const detalle = mapearDetalle(
      crearDetalleDto({
        resolucion: { medidasTomadas: "Se entregó", fundamento: "Había stock", resultado: "CERRADO" },
        descripcion: "Texto del ciudadano",
        reclamante: "Luis A. · DNI ••••1907",
        evidencias: [
          { nombre: "foto.jpg", tipo: "imagen", fecha: "2026-10-05", sensible: false, verificada: true },
          { nombre: "clip.mp4", tipo: "video", fecha: "2026-10-05", sensible: true, verificada: false },
        ],
        historial: [{ titulo: "Recibido por WhatsApp", detalle: "Registrado.", hora: "hace 3 h", fecha: "2026-10-05" }],
      }),
    );
    expect(detalle.resolucion).toEqual({
      medidasTomadas: "Se entregó",
      fundamento: "Había stock",
      resultado: ResultadoResolucion.CERRADO,
    });
    expect(detalle.archivo).toBeNull();
    expect(detalle.reapertura).toBeNull();
    expect(detalle.descripcion).toBe("Texto del ciudadano");
    expect(detalle.reclamante).toBe("Luis A. · DNI ••••1907");
    expect(detalle.evidencias.map((evidencia) => evidencia.tipo)).toEqual([TipoEvidencia.IMAGEN, TipoEvidencia.VIDEO]);
    expect(detalle.evidencias[1].sensible).toBe(true);
    expect(detalle.historial).toEqual([{ titulo: "Recibido por WhatsApp", detalle: "Registrado.", hora: "hace 3 h" }]);
  });

  it("traduce el archivo, también el automático sin justificación, y la última reapertura", () => {
    const detalle = mapearDetalle(
      crearDetalleDto({
        archivo: { motivo: "RESUELTA_VIGENCIA", detalle: null, archivadoEn: "2026-10-08T12:00:00.000Z" },
        reapertura: { reabiertoEn: "2026-10-01T09:00:00.000Z", motivo: "Faltaba una prueba" },
      }),
    );
    expect(detalle.archivo).toEqual({ motivo: MotivoArchivo.RESUELTA_VIGENCIA, detalle: null, archivadoEn: "2026-10-08T12:00:00.000Z" });
    expect(detalle.reapertura).toEqual({ reabiertoEn: "2026-10-01T09:00:00.000Z", motivo: "Faltaba una prueba" });
  });

  it("un motivo de archivo o un resultado desconocidos se rechazan", () => {
    expect(() =>
      mapearDetalle(crearDetalleDto({ archivo: { motivo: "RARO", detalle: null, archivadoEn: "2026-10-08T12:00:00.000Z" } })),
    ).toThrow(RespuestaInvalidaError);
    expect(() =>
      mapearDetalle(crearDetalleDto({ resolucion: { medidasTomadas: "a", fundamento: "b", resultado: "RARO" } })),
    ).toThrow(RespuestaInvalidaError);
  });

  it("un tipo de prueba desconocido se muestra como documento", () => {
    const detalle = mapearDetalle(
      crearDetalleDto({ evidencias: [{ nombre: "x", tipo: "hologram", fecha: "", sensible: false, verificada: false }] }),
    );
    expect(detalle.evidencias[0].tipo).toBe(TipoEvidencia.DOCUMENTO);
  });
});
