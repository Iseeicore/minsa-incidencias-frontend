import type { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";

export interface Conteo {
  readonly cantidad: number;
  /** El servidor cuenta hasta un tope; con `conMas` hay más casos de los que se contaron. */
  readonly conMas: boolean;
}

export interface Conteos {
  /** Todos los estados, con los demás filtros. */
  readonly todos: Conteo;
  /** Lo que devuelve el listado con los filtros actuales, incluida la pestaña. */
  readonly total: Conteo;
  readonly porEstado: Readonly<Record<EstadoCaso, Conteo>>;
}
