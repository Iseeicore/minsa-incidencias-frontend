import { inject } from "@angular/core";
import { type CanActivateFn, Router } from "@angular/router";
import { ROUTE } from "@/shared/constants/routes";
import { SessionStore } from "./session.store";

export const authGuard: CanActivateFn = async () => {
  const store = inject(SessionStore);
  const router = inject(Router);
  if (store.autenticado() || (await store.cargar())) return true;
  return router.createUrlTree([ROUTE.LOGIN]);
};
