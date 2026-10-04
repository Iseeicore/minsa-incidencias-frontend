import type { AbstractControl } from "@angular/forms";

export type ErrorMessages = Record<string, string>;

export function firstErrorMessage(control: AbstractControl, messages: ErrorMessages): string | null {
  const errors = control.errors;
  if (!errors) return null;
  const key = Object.keys(errors).find((errorKey) => errorKey in messages);
  return key ? (messages[key] ?? null) : null;
}
