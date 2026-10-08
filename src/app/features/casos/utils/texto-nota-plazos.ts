import type { Plazos } from "@/core/config/plazos.config";

function dias(cantidad: number): string {
  return cantidad === 1 ? "1 día" : `${cantidad} días`;
}

export function textoNotaPlazos(plazos: Plazos): string {
  return `Plazo de atención: ${dias(plazos.atencionDias)} desde que llega el caso. Una resolución dura ${dias(plazos.vigenciaResolucionDias)}. Pasado el plazo, el caso se archiva solo.`;
}
