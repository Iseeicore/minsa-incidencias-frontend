import type { Routes } from "@angular/router";
import { authGuard } from "@/core/auth/auth.guard";
import { vistaGuard } from "@/core/auth/vista.guard";
import { ROUTE_PATH } from "@/shared/constants/routes";
import { VistaCodigo } from "@/shared/enums/vista-codigo.enum";

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
        canActivate: [vistaGuard(VistaCodigo.INICIO)],
        loadComponent: () => import("@/features/inicio/inicio-page").then((module) => module.InicioPage),
      },
      {
        path: ROUTE_PATH.CASOS,
        canActivate: [vistaGuard(VistaCodigo.CASOS)],
        loadComponent: () => import("@/features/casos/casos-page").then((module) => module.CasosPage),
      },
      {
        path: ROUTE_PATH.BANDEJAS,
        canActivate: [vistaGuard(VistaCodigo.BANDEJAS)],
        loadComponent: () => import("@/features/casos/bandejas-page").then((module) => module.BandejasPage),
      },
      {
        path: ROUTE_PATH.DERIVACIONES,
        canActivate: [vistaGuard(VistaCodigo.DERIVACIONES)],
        loadComponent: () =>
          import("@/features/derivaciones/derivaciones-page").then((module) => module.DerivacionesPage),
      },
      {
        path: ROUTE_PATH.QR,
        canActivate: [vistaGuard(VistaCodigo.QR)],
        loadComponent: () => import("@/features/qr/qr-page").then((module) => module.QrPage),
      },
      {
        path: ROUTE_PATH.SIN_ACCESO,
        loadComponent: () => import("@/features/sin-acceso/sin-acceso-page").then((module) => module.SinAccesoPage),
      },
    ],
  },
  { path: "**", redirectTo: ROUTE_PATH.LOGIN },
];
