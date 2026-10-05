import { computed, inject, Injectable, InjectionToken, signal } from "@angular/core";
import { PLAZOS_TOKEN } from "@/core/config/plazos.config";
import { CATEGORIA_LABEL, ROL_LABEL } from "@/features/casos/constants/casos-constants";
import { CASOS_DEMO } from "@/features/casos/data/casos.demo";
import { AccionCaso } from "@/features/casos/enums/accion-caso.enum";
import type { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { RolDemo } from "@/features/casos/enums/rol-demo.enum";
import type { Caso, ResultadoAccion } from "@/features/casos/types/caso.types";
import { accionesPermitidas, visiblePara } from "@/features/casos/utils/acciones-caso";
import { areaDe } from "@/features/casos/utils/area-de-categoria";
import { aplicarArchivadoAutomatico } from "@/features/casos/utils/plazos-caso";
import type { TimelineItem } from "@/shared/ui/timeline/timeline";

export const CASOS_INICIALES = new InjectionToken<readonly Caso[]>("CASOS_INICIALES", {
  providedIn: "root",
  factory: () => CASOS_DEMO,
});

export const MAX_RESOLUCION = 2000;

const ESTADOS_RESOLUBLES: readonly EstadoCaso[] = [
  EstadoCaso.REGISTRADO,
  EstadoCaso.CLASIFICADO,
  EstadoCaso.DERIVADO,
  EstadoCaso.EN_GESTION,
];

const formatoHora = new Intl.DateTimeFormat("es-PE", { hour: "2-digit", minute: "2-digit" });

function exito(mensaje: string): ResultadoAccion {
  return { ok: true, mensaje };
}

function fallo(error: string): Extract<ResultadoAccion, { ok: false }> {
  return { ok: false, error };
}

/**
 * Estado de los casos en memoria para la demostración. Aplica las mismas reglas que la base (transiciones
 * permitidas, revisión una sola vez, resolución obligatoria) para poder probar el flujo sin backend.
 * Cuando exista el backend este servicio pasa a llamar a sus endpoints y las reglas las aplica el servidor.
 */
@Injectable({ providedIn: "root" })
export class CasosStore {
  private readonly plazos = inject(PLAZOS_TOKEN);
  private readonly todos = signal<readonly Caso[]>(aplicarArchivadoAutomatico(inject(CASOS_INICIALES), this.plazos));

  readonly rol = signal<RolDemo>(RolDemo.REVISOR);
  readonly casos = computed(() => this.todos().filter((caso) => visiblePara(caso, this.rol())));

  cambiarRol(rol: RolDemo): void {
    this.rol.set(rol);
  }

  confirmar(codigo: string): ResultadoAccion {
    return this.ejecutar(codigo, AccionCaso.CONFIRMAR, (caso) => {
      if (caso.estado !== EstadoCaso.CLASIFICADO) return fallo("Solo se puede revisar un caso clasificado.");
      if (caso.revisadoPorHumano) return fallo("La categoría ya fue revisada: solo se confirma o se corrige una vez.");
      return {
        caso: this.conPaso({ ...caso, revisadoPorHumano: true }, "Categoría confirmada", "Una persona revisó la propuesta de la IA."),
        mensaje: "Categoría confirmada. Se guardó para mejorar la IA.",
      };
    });
  }

  corregir(codigo: string, nueva: CategoriaCaso): ResultadoAccion {
    return this.ejecutar(codigo, AccionCaso.CORREGIR, (caso) => {
      if (caso.estado !== EstadoCaso.CLASIFICADO) return fallo("Solo se puede revisar un caso clasificado.");
      if (caso.revisadoPorHumano) return fallo("La categoría ya fue revisada: solo se confirma o se corrige una vez.");
      if (nueva === caso.categoria) return fallo("Elige una categoría distinta de la actual; para dejarla igual, confírmala.");
      const anterior = caso.categoria ? CATEGORIA_LABEL[caso.categoria] : "sin categoría";
      return {
        caso: this.conPaso(
          { ...caso, categoria: nueva, corregida: true, revisadoPorHumano: true },
          "Categoría corregida",
          `De ${anterior} a ${CATEGORIA_LABEL[nueva]}. El caso corresponde a: ${areaDe(nueva)}.`,
        ),
        mensaje: `Categoría corregida a ${CATEGORIA_LABEL[nueva]}. Se guardó para mejorar la IA.`,
      };
    });
  }

  derivar(codigo: string): ResultadoAccion {
    return this.ejecutar(codigo, AccionCaso.DERIVAR, (caso) => {
      if (caso.estado !== EstadoCaso.CLASIFICADO) return fallo("Transición de estado no permitida.");
      if (!caso.revisadoPorHumano) return fallo("Primero una persona debe revisar la categoría.");
      const area = areaDe(caso.categoria);
      return {
        caso: this.conPaso({ ...caso, estado: EstadoCaso.DERIVADO }, "Derivado", `Al ${area}.`),
        mensaje: `Caso derivado al ${area}.`,
      };
    });
  }

  tomar(codigo: string): ResultadoAccion {
    return this.ejecutar(codigo, AccionCaso.TOMAR, (caso) => {
      if (caso.estado !== EstadoCaso.DERIVADO) return fallo("Transición de estado no permitida.");
      return {
        caso: this.conPaso({ ...caso, estado: EstadoCaso.EN_GESTION }, "En gestión", "El área tomó el caso."),
        mensaje: "El caso quedó en gestión.",
      };
    });
  }

  resolver(codigo: string, resolucion: string): ResultadoAccion {
    return this.ejecutar(codigo, AccionCaso.RESOLVER, (caso) => {
      if (!ESTADOS_RESOLUBLES.includes(caso.estado)) return fallo("Transición de estado no permitida.");
      const texto = resolucion.trim();
      if (texto === "") return fallo("La resolución no puede estar vacía.");
      if (texto.length > MAX_RESOLUCION) return fallo(`La resolución no puede pasar de ${MAX_RESOLUCION} caracteres.`);
      return {
        caso: this.conPaso(
          { ...caso, estado: EstadoCaso.RESUELTO, resolucion: texto, horasDesdeResolucion: 0 },
          "Resuelto",
          texto,
        ),
        mensaje: `Caso resuelto. Se archivará solo a los ${this.plazos.vigenciaResolucionDias} días.`,
      };
    });
  }

  private ejecutar(
    codigo: string,
    accion: AccionCaso,
    aplicar: (caso: Caso) => { caso: Caso; mensaje: string } | Extract<ResultadoAccion, { ok: false }>,
  ): ResultadoAccion {
    const caso = this.todos().find((candidato) => candidato.codigo === codigo);
    if (!caso) return fallo("No se encontró el caso.");
    if (!accionesPermitidas(caso, this.rol()).includes(accion)) {
      return fallo("No tienes permiso para esta acción sobre este caso.");
    }
    const resultado = aplicar(caso);
    if ("error" in resultado) return resultado;
    this.todos.update((lista) => lista.map((actual) => (actual.codigo === codigo ? resultado.caso : actual)));
    return exito(resultado.mensaje);
  }

  private conPaso(caso: Caso, titulo: string, detalle: string): Caso {
    const paso: TimelineItem = { titulo, detalle: `${detalle} (${ROL_LABEL[this.rol()]})`, hora: formatoHora.format(new Date()) };
    return { ...caso, historial: [...caso.historial, paso] };
  }
}
