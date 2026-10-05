import { HttpErrorResponse, type HttpInterceptorFn } from "@angular/common/http";
import { inject } from "@angular/core";
import { Router } from "@angular/router";
import { catchError, throwError } from "rxjs";
import { AUTH_PATH } from "@/core/auth/auth.paths";
import { SessionStore } from "@/core/auth/session.store";
import { ROUTE } from "@/shared/constants/routes";
import { HttpStatus } from "@/shared/enums/http-status.enum";

const RUTAS_DE_SESION: string[] = [AUTH_PATH.LOGIN, AUTH_PATH.LOGOUT, AUTH_PATH.ME];

export const unauthorizedInterceptor: HttpInterceptorFn = (req, next) => {
  const store = inject(SessionStore);
  const router = inject(Router);

  return next(req).pipe(
    catchError((error: unknown) => {
      const esDeSesion = RUTAS_DE_SESION.some((ruta) => req.url.endsWith(ruta));
      if (error instanceof HttpErrorResponse && error.status === HttpStatus.UNAUTHORIZED && !esDeSesion) {
        store.limpiar();
        void router.navigateByUrl(ROUTE.LOGIN);
      }
      return throwError(() => error);
    }),
  );
};
