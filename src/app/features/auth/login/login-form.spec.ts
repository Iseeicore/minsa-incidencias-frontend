import { TestBed } from "@angular/core/testing";
import { provideRouter, Router } from "@angular/router";
import { AuthError } from "@/core/auth/auth-error";
import { AuthService } from "@/core/auth/auth.service";
import { AuthErrorCode } from "@/core/auth/enums/auth-error-code.enum";
import { ROUTE } from "@/shared/constants/routes";
import { LoginForm } from "./login-form";

describe("LoginForm", () => {
  const login = vi.fn();

  beforeEach(() => login.mockReset());

  async function setup(auth: Pick<AuthService, "login"> = { login }) {
    TestBed.configureTestingModule({
      imports: [LoginForm],
      providers: [provideRouter([]), { provide: AuthService, useValue: auth }],
    });
    const fixture = TestBed.createComponent(LoginForm);
    const navigate = vi.spyOn(TestBed.inject(Router), "navigateByUrl").mockResolvedValue(true);
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    const type = (selector: string, value: string) => {
      const input = element.querySelector(selector) as HTMLInputElement;
      input.value = value;
      input.dispatchEvent(new Event("input"));
    };
    const submit = async () => {
      (element.querySelector("form") as HTMLFormElement).dispatchEvent(new Event("submit"));
      await fixture.whenStable();
    };
    return { element, navigate, type, submit };
  }

  it("con el formulario vacío muestra los errores y no llama al servicio", async () => {
    const { element, submit } = await setup();
    await submit();
    expect(element.textContent).toContain("Ingresa tu correo.");
    expect(element.textContent).toContain("Ingresa tu contraseña.");
    expect(login).not.toHaveBeenCalled();
  });

  it("con un correo inválido pide uno válido", async () => {
    const { element, type, submit } = await setup();
    type("#correo", "no-es-correo");
    type("#password", "clave");
    await submit();
    expect(element.textContent).toContain("Ingresa un correo válido.");
    expect(login).not.toHaveBeenCalled();
  });

  it("con datos válidos inicia sesión y navega al inicio", async () => {
    login.mockResolvedValue(undefined);
    const { navigate, type, submit } = await setup();
    type("#correo", "persona@minsa.gob.pe");
    type("#password", "clave");
    await submit();
    expect(login).toHaveBeenCalledWith({ correo: "persona@minsa.gob.pe", password: "clave" });
    expect(navigate).toHaveBeenCalledWith(ROUTE.INICIO);
  });

  it("con credenciales incorrectas muestra el mensaje y no navega", async () => {
    const rejectingAuth = {
      login: async () => {
        throw new AuthError(AuthErrorCode.INVALID_CREDENTIALS);
      },
    };
    const { element, navigate, type, submit } = await setup(rejectingAuth);
    type("#correo", "persona@minsa.gob.pe");
    type("#password", "mala");
    await submit();
    expect(element.querySelector("[role='alert']")?.textContent).toContain("Correo o contraseña incorrectos.");
    expect(navigate).not.toHaveBeenCalled();
  });
});
