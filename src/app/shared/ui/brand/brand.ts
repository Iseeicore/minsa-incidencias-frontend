import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-brand",
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: "flex items-center gap-3" },
  template: `
    <span class="text-2xl font-bold text-primary-700">MINSA</span>
    <span class="h-8 border-r border-gray-300"></span>
    <span class="text-sm font-medium text-gray-600">Gestión de incidencias</span>
  `,
})
export class Brand {}
