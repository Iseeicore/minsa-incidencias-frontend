import { inject } from "@angular/core";
import { type CanActivateFn, Router } from "@angular/router";
import { ROUTE } from "@/shared/constants/routes";
import type { ModuloCodigo } from "@/shared/enums/modulo-codigo.enum";
import { SessionStore } from "./session.store";

/** Solo mejora la experiencia: la autorización real la aplica el backend en cada petición. */
export function moduloGuard(modulo: ModuloCodigo): CanActivateFn {
  return () => {
    const store = inject(SessionStore);
    if (store.sesion()?.modulos.includes(modulo)) return true;
    return inject(Router).createUrlTree([ROUTE.INICIO]);
  };
}
