import { ChangeDetectionStrategy, Component, input } from "@angular/core";

@Component({
  selector: "app-form-field",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "flex flex-col gap-1" },
  template: `
    <label class="text-sm font-medium text-gray-700" [for]="fieldId()">{{ label() }}</label>
    <ng-content />
    @if (error(); as message) {
      <p class="text-sm text-danger-600" [id]="fieldId() + '-error'" role="alert">{{ message }}</p>
    }
  `,
})
export class FormField {
  readonly label = input.required<string>();
  readonly fieldId = input.required<string>();
  readonly error = input<string | null>(null);
}
