import { ChangeDetectionStrategy, Component, computed, input, signal } from "@angular/core";
import { FormControl, ReactiveFormsModule } from "@angular/forms";
import { IconName } from "@/shared/enums/icon-name.enum";
import { Icon } from "@/shared/ui/icon/icon";
import { TextInput } from "@/shared/ui/text-input/text-input";

@Component({
  selector: "app-password-input",
  imports: [ReactiveFormsModule, Icon, TextInput],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "relative block" },
  template: `
    <input
      appTextInput
      withEndIcon
      [id]="fieldId()"
      [type]="visible() ? 'text' : 'password'"
      [formControl]="control()"
      [invalid]="invalid()"
      [attr.autocomplete]="autocomplete()"
      [attr.placeholder]="placeholder()"
    />
    <button
      type="button"
      class="absolute inset-y-0 right-0 flex items-center px-3 text-gray-500 hover:text-gray-700"
      [attr.aria-label]="toggleLabel()"
      [attr.aria-pressed]="visible()"
      (click)="toggle()"
    >
      <app-icon [name]="icon()" />
    </button>
  `,
})
export class PasswordInput {
  readonly control = input.required<FormControl<string>>();
  readonly fieldId = input.required<string>();
  readonly invalid = input(false);
  readonly autocomplete = input("current-password");
  readonly placeholder = input("");

  protected readonly visible = signal(false);
  protected readonly icon = computed(() => (this.visible() ? IconName.EYE_OFF : IconName.EYE));
  protected readonly toggleLabel = computed(() => (this.visible() ? "Ocultar contraseña" : "Mostrar contraseña"));

  protected toggle(): void {
    this.visible.update((value) => !value);
  }
}
