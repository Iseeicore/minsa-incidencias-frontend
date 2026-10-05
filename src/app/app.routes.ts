import type { Routes } from "@angular/router";
import { authGuard } from "@/core/auth/auth.guard";
import { moduloGuard } from "@/core/auth/modulo.guard";
import { ROUTE_PATH } from "@/shared/constants/routes";
import { ModuloCodigo } from "@/shared/enums/modulo-codigo.enum";

export const routes: Routes = [
  { path: "", pathMatch: "full", redirectTo: ROUTE_PATH.LOGIN },
  {
    path: ROUTE_PATH.LOGIN,
    loadComponent: () => import("@/features/auth/login/login-page").then((module) => module.LoginPage),
  },
  {
    path: "",
    canActivate: [authGuard],
    loadComponent: () => import("@/shared/layouts/app-shell/app-shell").then((module) => module.AppShell),
    children: [
      {
        path: ROUTE_PATH.INICIO,
        loadComponent: () => import("@/features/inicio/inicio-page").then((module) => module.InicioPage),
      },
      {
        path: ROUTE_PATH.CASOS,
        canActivate: [moduloGuard(ModuloCodigo.INCIDENCIAS)],
        loadComponent: () => import("@/features/casos/casos-page").then((module) => module.CasosPage),
      },
      {
        path: ROUTE_PATH.BANDEJAS,
        canActivate: [moduloGuard(ModuloCodigo.INCIDENCIAS)],
        loadComponent: () => import("@/features/casos/bandejas-page").then((module) => module.BandejasPage),
      },
      {
        path: ROUTE_PATH.DERIVACIONES,
        canActivate: [moduloGuard(ModuloCodigo.INCIDENCIAS)],
        loadComponent: () =>
          import("@/features/derivaciones/derivaciones-page").then((module) => module.DerivacionesPage),
      },
    ],
  },
  { path: "**", redirectTo: ROUTE_PATH.LOGIN },
];
