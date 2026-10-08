import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "@env/environment";
import { AuthService } from "./auth.service";
import { AuthErrorCode } from "./enums/auth-error-code.enum";

describe("AuthService", () => {
  const credentials = { correo: "persona@minsa.gob.pe", password: "clave" };
  const base = environment.apiUrl;

  function setup() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { service: TestBed.inject(AuthService), http: TestBed.inject(HttpTestingController) };
  }

  it("envía las credenciales a la URL del entorno con cookies (withCredentials)", async () => {
    const { service, http } = setup();
    const result = service.login(credentials);

    const request = http.expectOne(`${base}/auth/login`);
    expect(request.request.method).toBe("POST");
    expect(request.request.body).toEqual(credentials);
    expect(request.request.withCredentials).toBe(true);
    request.flush(null);

    await expect(result).resolves.toBeUndefined();
    http.verify();
  });

  it("traduce un 401 a credenciales inválidas", async () => {
    const { service, http } = setup();
    const result = service.login(credentials);
    http.expectOne(`${base}/auth/login`).flush(null, { status: 401, statusText: "Unauthorized" });
    await expect(result).rejects.toMatchObject({ code: AuthErrorCode.INVALID_CREDENTIALS });
  });

  it("traduce un fallo de red", async () => {
    const { service, http } = setup();
    const result = service.login(credentials);
    http.expectOne(`${base}/auth/login`).error(new ProgressEvent("error"));
    await expect(result).rejects.toMatchObject({ code: AuthErrorCode.NETWORK });
  });

  it("me() pide la sesión con cookies y devuelve nombre, correo, vistas, roles y área", async () => {
    const { service, http } = setup();
    const result = service.me();

    const request = http.expectOne(`${base}/auth/me`);
    expect(request.request.method).toBe("GET");
    expect(request.request.withCredentials).toBe(true);
    const area = { codigo: "EESS-6206", nombre: "Hospital Dos de Mayo", tipo: "ESTABLECIMIENTO" };
    request.flush({ nombreCompleto: "Ana", correo: "ana@minsa.gob.pe", vistas: ["INICIO", "CASOS"], roles: ["GESTOR"], area });

    await expect(result).resolves.toEqual({
      nombreCompleto: "Ana",
      correo: "ana@minsa.gob.pe",
      vistas: ["INICIO", "CASOS"],
      roles: ["GESTOR"],
      area,
    });
  });

  it("me() sin sesión se rechaza", async () => {
    const { service, http } = setup();
    const result = service.me();
    http.expectOne(`${base}/auth/me`).flush(null, { status: 401, statusText: "Unauthorized" });
    await expect(result).rejects.toMatchObject({ code: AuthErrorCode.INVALID_CREDENTIALS });
  });

  it("logout() envía un POST con cookies", async () => {
    const { service, http } = setup();
    const result = service.logout();

    const request = http.expectOne(`${base}/auth/logout`);
    expect(request.request.method).toBe("POST");
    expect(request.request.withCredentials).toBe(true);
    request.flush(null);

    await expect(result).resolves.toBeUndefined();
  });
});
