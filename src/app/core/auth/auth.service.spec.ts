import { provideHttpClient } from "@angular/common/http";
import { HttpTestingController, provideHttpClientTesting } from "@angular/common/http/testing";
import { TestBed } from "@angular/core/testing";
import { environment } from "@env/environment";
import { AuthService } from "./auth.service";
import { AuthErrorCode } from "./enums/auth-error-code.enum";

describe("AuthService", () => {
  const credentials = { correo: "persona@minsa.gob.pe", password: "clave" };
  const url = `${environment.apiUrl}/auth/login`;

  function setup() {
    TestBed.configureTestingModule({ providers: [provideHttpClient(), provideHttpClientTesting()] });
    return { service: TestBed.inject(AuthService), http: TestBed.inject(HttpTestingController) };
  }

  it("envía las credenciales a la URL del entorno con cookies (withCredentials)", async () => {
    const { service, http } = setup();
    const result = service.login(credentials);

    const request = http.expectOne(url);
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
    http.expectOne(url).flush(null, { status: 401, statusText: "Unauthorized" });
    await expect(result).rejects.toMatchObject({ code: AuthErrorCode.INVALID_CREDENTIALS });
  });

  it("traduce un fallo de red", async () => {
    const { service, http } = setup();
    const result = service.login(credentials);
    http.expectOne(url).error(new ProgressEvent("error"));
    await expect(result).rejects.toMatchObject({ code: AuthErrorCode.NETWORK });
  });
});
