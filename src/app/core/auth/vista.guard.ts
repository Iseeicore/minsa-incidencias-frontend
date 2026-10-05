import { inject } from "@angular/core";
import { type CanActivateFn, Router } from "@angular/router";
import { ROUTE } from "@/shared/constants/routes";
import { RUTA_DE_VISTA } from "@/shared/constants/vistas";
import { VistaCodigo } from "@/shared/enums/vista-codigo.enum";
import { SessionStore } from "./session.store";

/**
 * Solo mejora la experiencia: la autorización real la aplica el backend en cada petición. Sin la vista pedida lleva
 * a la primera que el usuario sí tiene; si no tiene ninguna, a la página de sin acceso (que no tiene guard).
 */
export function vistaGuard(vista: VistaCodigo): CanActivateFn {
  return () => {
    const router = inject(Router);
    const sesion = inject(SessionStore).sesion();
    if (!sesion) return router.createUrlTree([ROUTE.LOGIN]);
    if (sesion.vistas.includes(vista)) return true;
    const alternativa = Object.values(VistaCodigo).find((candidata) => sesion.vistas.includes(candidata));
    return router.createUrlTree([alternativa ? RUTA_DE_VISTA[alternativa] : ROUTE.SIN_ACCESO]);
  };
}
