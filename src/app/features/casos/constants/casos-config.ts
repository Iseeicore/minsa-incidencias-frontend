import { InjectionToken } from "@angular/core";

const ESPERA_BUSQUEDA_MS = 300;

/** Reloj de la pantalla; se reemplaza en las pruebas para fijar «hoy». */
export const AHORA = new InjectionToken<() => Date>("AHORA", {
  providedIn: "root",
  factory: () => () => new Date(),
});

/** Cuánto espera el buscador a que la persona termine de escribir antes de preguntarle al servidor. */
export const BUSQUEDA_DEBOUNCE_MS = new InjectionToken<number>("BUSQUEDA_DEBOUNCE_MS", {
  providedIn: "root",
  factory: () => ESPERA_BUSQUEDA_MS,
});
