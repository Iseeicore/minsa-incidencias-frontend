import { PLAZOS_POR_DEFECTO, type Plazos } from "@/core/config/plazos.config";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { crearCaso } from "@/features/casos/testing/caso-builder";
import {
  aplicarArchivadoAutomatico,
  estaPorVencer,
  horasRestantesAtencion,
  horasRestantesVigencia,
} from "./plazos-caso";

const PLAZOS: Plazos = PLAZOS_POR_DEFECTO;

describe("horasRestantesAtencion", () => {
  it("cuenta desde que llegó el caso", () => {
    expect(horasRestantesAtencion(crearCaso({ horasDesdeLlegada: 20 }), PLAZOS)).toBe(52);
  });

  it("es negativo cuando el plazo ya pasó", () => {
    expect(horasRestantesAtencion(crearCaso({ horasDesdeLlegada: 100 }), PLAZOS)).toBe(-28);
  });

  it("respeta un plazo distinto configurado", () => {
    const cincoDias: Plazos = { ...PLAZOS, atencionDias: 5 };
    expect(horasRestantesAtencion(crearCaso({ horasDesdeLlegada: 100 }), cincoDias)).toBe(20);
  });
});

describe("horasRestantesVigencia", () => {
  it("sin resolución no hay vigencia", () => {
    expect(horasRestantesVigencia(crearCaso(), PLAZOS)).toBeNull();
  });

  it("cuenta desde que se resolvió", () => {
    expect(horasRestantesVigencia(crearCaso({ horasDesdeResolucion: 20 }), PLAZOS)).toBe(52);
  });
});

describe("estaPorVencer", () => {
  it("un caso abierto dentro de las últimas horas de aviso está por vencer", () => {
    expect(estaPorVencer(crearCaso({ horasDesdeLlegada: 50 }), PLAZOS)).toBe(true);
    expect(estaPorVencer(crearCaso({ horasDesdeLlegada: 72 }), PLAZOS)).toBe(true);
  });

  it("un caso con tiempo de sobra no lo está", () => {
    expect(estaPorVencer(crearCaso({ horasDesdeLlegada: 40 }), PLAZOS)).toBe(false);
  });

  it("uno que ya venció no está 'por vencer' (se archiva)", () => {
    expect(estaPorVencer(crearCaso({ horasDesdeLlegada: 80 }), PLAZOS)).toBe(false);
  });

  it("un caso resuelto o archivado nunca está por vencer", () => {
    expect(estaPorVencer(crearCaso({ horasDesdeLlegada: 60, estado: EstadoCaso.RESUELTO }), PLAZOS)).toBe(false);
    expect(estaPorVencer(crearCaso({ horasDesdeLlegada: 60, estado: EstadoCaso.ARCHIVADO }), PLAZOS)).toBe(false);
  });

  it("el aviso es configurable", () => {
    const aviso48: Plazos = { ...PLAZOS, avisoHoras: 48 };
    expect(estaPorVencer(crearCaso({ horasDesdeLlegada: 30 }), aviso48)).toBe(true);
  });
});

describe("aplicarArchivadoAutomatico", () => {
  it("archiva un caso abierto cuyo plazo de atención venció y deja constancia en el historial", () => {
    const [archivado] = aplicarArchivadoAutomatico([crearCaso({ horasDesdeLlegada: 100, estado: EstadoCaso.EN_GESTION })], PLAZOS);
    expect(archivado.estado).toBe(EstadoCaso.ARCHIVADO);
    expect(archivado.historial.at(-1)?.titulo).toBe("Archivado automáticamente");
    expect(archivado.historial.at(-1)?.detalle).toContain("3 días");
  });

  it("deja igual un caso abierto que sigue dentro del plazo", () => {
    const caso = crearCaso({ horasDesdeLlegada: 60 });
    expect(aplicarArchivadoAutomatico([caso], PLAZOS)).toEqual([caso]);
  });

  it("archiva una resolución que pasó su vigencia", () => {
    const [archivado] = aplicarArchivadoAutomatico(
      [crearCaso({ estado: EstadoCaso.RESUELTO, horasDesdeLlegada: 150, horasDesdeResolucion: 80 })],
      PLAZOS,
    );
    expect(archivado.estado).toBe(EstadoCaso.ARCHIVADO);
  });

  it("deja una resolución vigente en RESUELTO aunque el caso haya llegado hace mucho", () => {
    const caso = crearCaso({ estado: EstadoCaso.RESUELTO, horasDesdeLlegada: 150, horasDesdeResolucion: 20 });
    expect(aplicarArchivadoAutomatico([caso], PLAZOS)[0].estado).toBe(EstadoCaso.RESUELTO);
  });

  it("no toca los que ya están archivados", () => {
    const caso = crearCaso({ estado: EstadoCaso.ARCHIVADO, horasDesdeLlegada: 500 });
    expect(aplicarArchivadoAutomatico([caso], PLAZOS)).toEqual([caso]);
  });

  it("con un plazo más largo no archiva lo que antes habría vencido", () => {
    const cincoDias: Plazos = { ...PLAZOS, atencionDias: 5 };
    const caso = crearCaso({ horasDesdeLlegada: 100 });
    expect(aplicarArchivadoAutomatico([caso], cincoDias)[0].estado).toBe(EstadoCaso.CLASIFICADO);
  });
});
