import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from "@angular/forms";
import { Router } from "@angular/router";
import { AuthError } from "@/core/auth/auth-error";
import { AuthService } from "@/core/auth/auth.service";
import { AuthErrorCode } from "@/core/auth/enums/auth-error-code.enum";
import { ROUTE } from "@/shared/constants/routes";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Button } from "@/shared/ui/button/button";
import { FormField } from "@/shared/ui/form-field/form-field";
import { Icon } from "@/shared/ui/icon/icon";
import { PasswordInput } from "@/shared/ui/password-input/password-input";
import { TextInput } from "@/shared/ui/text-input/text-input";
import { firstErrorMessage } from "@/shared/utils/form-errors";
import { AUTH_ERROR_MESSAGES, LOGIN_FIELD_MESSAGES } from "@/features/auth/constants/auth-messages";

@Component({
  selector: "app-login-form",
  imports: [ReactiveFormsModule, Button, FormField, Icon, PasswordInput, TextInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./login-form.html",
})
export class LoginForm {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  protected readonly IconName = IconName;

  protected readonly form = new FormGroup({
    correo: new FormControl("", { nonNullable: true, validators: [Validators.required, Validators.email] }),
    password: new FormControl("", { nonNullable: true, validators: [Validators.required] }),
  });

  protected readonly submitting = signal(false);
  protected readonly submitted = signal(false);
  protected readonly serverError = signal<string | null>(null);

  private readonly formValue = toSignal(this.form.valueChanges, { initialValue: this.form.getRawValue() });

  protected readonly errors = computed(() => {
    this.formValue();
    if (!this.submitted()) return { correo: null, password: null };
    return {
      correo: firstErrorMessage(this.form.controls.correo, LOGIN_FIELD_MESSAGES.correo),
      password: firstErrorMessage(this.form.controls.password, LOGIN_FIELD_MESSAGES.password),
    };
  });

  protected async submit(): Promise<void> {
    this.submitted.set(true);
    this.form.updateValueAndValidity();
    if (this.form.invalid || this.submitting()) return;

    this.submitting.set(true);
    this.serverError.set(null);
    try {
      await this.auth.login(this.form.getRawValue());
      await this.router.navigateByUrl(ROUTE.INICIO);
    } catch (error) {
      const code = error instanceof AuthError ? error.code : AuthErrorCode.UNKNOWN;
      this.serverError.set(AUTH_ERROR_MESSAGES[code]);
    } finally {
      this.submitting.set(false);
    }
  }
}
