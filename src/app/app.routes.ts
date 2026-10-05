import type { Routes } from "@angular/router";
import { authGuard } from "@/core/auth/auth.guard";
import { ROUTE_PATH } from "@/shared/constants/routes";

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
    ],
  },
  { path: "**", redirectTo: ROUTE_PATH.LOGIN },
];
