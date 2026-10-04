import { ChangeDetectionStrategy, Component } from "@angular/core";

@Component({
  selector: "app-inicio-page",
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="p-6">
      <h1 class="text-2xl font-semibold">Panel de gestión</h1>
      <p class="text-gray-600">En construcción.</p>
    </main>
  `,
})
export class InicioPage {}
