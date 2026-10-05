import { HttpClient, provideHttpClient, withInterceptors } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { firstValueFrom } from "rxjs";
import { SessionStore } from "@/core/auth/session.store";
import { ROUTE } from "@/shared/constants/routes";
import { unauthorizedInterceptor } from "./unauthorized.interceptor";

describe("unauthorizedInterceptor", () => {
  function setup() {
    const limpiar = vi.fn();
    TestBed.configureTestingModule({
      providers: [
        provideRouter([]),
        provideHttpClient(withInterceptors([unauthorizedInterceptor])),
        provideHttpClientTesting(),
        { provide: SessionStore, useValue: { limpiar } },
      ],
    });
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    return { http: TestBed.inject(HttpClient), controller: TestBed.inject(HttpTestingController), limpiar, navigate };
  }

  it("ante un 401 en cualquier llamada limpia la sesión y manda al login", async () => {
    const { http, controller, limpiar, navigate } = setup();
    const resultado = firstValueFrom(http.get("/api/incidencias"));
    controller.expectOne("/api/incidencias").flush(null, { status: 401, statusText: "Unauthorized" });

    await expect(resultado).rejects.toMatchObject({ status: 401 });
    expect(limpiar).toHaveBeenCalled();
    expect(navigate).toHaveBeenCalledWith(ROUTE.LOGIN);
  });

  it.each(["/auth/login", "/auth/me", "/auth/logout"])("no redirige por un 401 de %s (lo maneja quien llama)", async (ruta) => {
    const { http, controller, limpiar, navigate } = setup();
    const resultado = firstValueFrom(http.get(`http://api.local${ruta}`));
    controller.expectOne(`http://api.local${ruta}`).flush(null, { status: 401, statusText: "Unauthorized" });

    await expect(resultado).rejects.toMatchObject({ status: 401 });
    expect(limpiar).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });

  it("no hace nada ante otros errores", async () => {
    const { http, controller, limpiar, navigate } = setup();
    const resultado = firstValueFrom(http.get("/api/x"));
    controller.expectOne("/api/x").flush(null, { status: 500, statusText: "Error" });

    await expect(resultado).rejects.toMatchObject({ status: 500 });
    expect(limpiar).not.toHaveBeenCalled();
    expect(navigate).not.toHaveBeenCalled();
  });
});
