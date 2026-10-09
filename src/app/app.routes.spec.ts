import { Component } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router, type Route } from "@angular/router";
import { routes } from "@/app.routes";
import { ROUTE_PATH } from "@/shared/constants/routes";

@Component({ selector: "app-destino", template: "" })
class Destino {}

const hijosDelShell = (routes.find((ruta) => ruta.children)?.children ?? []) as Route[];
const ruta = (path: string) => hijosDelShell.find((candidata) => candidata.path === path);

describe("rutas de la Bandeja", () => {
  it("/bandeja está protegida por la vista CASOS", () => {
    const bandeja = ruta(ROUTE_PATH.BANDEJA);
    expect(bandeja?.loadComponent).toBeDefined();
    expect(bandeja?.canActivate).toHaveLength(1);
  });

  it("/casos y /bandejas redirigen a /bandeja y ya no cargan pantalla", () => {
    for (const antigua of [ROUTE_PATH.CASOS_ANTIGUA, ROUTE_PATH.BANDEJAS_ANTIGUA]) {
      expect(ruta(antigua)).toMatchObject({ redirectTo: ROUTE_PATH.BANDEJA, pathMatch: "full" });
      expect(ruta(antigua)?.loadComponent).toBeUndefined();
    }
  });

  describe("al navegar", () => {
    async function navegar(url: string) {
      TestBed.configureTestingModule({
        providers: [
          provideRouter([
            { path: ROUTE_PATH.BANDEJA, component: Destino },
            ...[ROUTE_PATH.CASOS_ANTIGUA, ROUTE_PATH.BANDEJAS_ANTIGUA].map((antigua) => ruta(antigua) as Route),
          ]),
        ],
      });
      const router = TestBed.inject(Router);
      await router.navigateByUrl(url);
      return router.url;
    }

    it("/casos termina en /bandeja", async () => {
      expect(await navegar("/casos")).toBe("/bandeja");
    });

    it("/bandejas termina en /bandeja", async () => {
      expect(await navegar("/bandejas")).toBe("/bandeja");
    });

    it("/casos conserva los parámetros, por ejemplo el caso que abre el aviso de la campana", async () => {
      expect(await navegar("/casos?caso=MINSA-2026-000004")).toBe("/bandeja?caso=MINSA-2026-000004");
    });

    it("/bandejas conserva todos los parámetros", async () => {
      expect(await navegar("/bandejas?caso=MINSA-2026-000004&x=1")).toBe("/bandeja?caso=MINSA-2026-000004&x=1");
    });
  });
});
