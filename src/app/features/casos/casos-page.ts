import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { map } from "rxjs";
import { SessionStore } from "@/core/auth/session.store";
import { AreaSelector } from "@/features/casos/components/area-selector";
import { CasoRevision } from "@/features/casos/components/caso-revision";
import { CasosTabla } from "@/features/casos/components/casos-tabla";
import { ESTADO_OPCIONES, TABS_POR_TIPO_AREA, TABS_SIN_AREA } from "@/features/casos/constants/casos-constants";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import type { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { ListaCasosStore } from "@/features/casos/lista-casos.store";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { PaginadorCursor } from "@/shared/ui/paginador-cursor/paginador-cursor";
import { SearchInput } from "@/shared/ui/search-input/search-input";
import { SelectField } from "@/shared/ui/select-field/select-field";
import { Tabs } from "@/shared/ui/tabs/tabs";

const PARAMETRO_CASO = "caso";

@Component({
  selector: "app-casos-page",
  imports: [Alert, AreaSelector, Button, Card, CasoRevision, CasosTabla, PaginadorCursor, SearchInput, SelectField, Tabs],
  providers: [ListaCasosStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./casos-page.html",
})
export class CasosPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly casoDeLaDireccion = toSignal(
    this.route.queryParamMap.pipe(map((parametros) => parametros.get(PARAMETRO_CASO))),
    { initialValue: null },
  );

  private readonly sesion = inject(SessionStore);

  protected readonly lista = inject(ListaCasosStore);
  protected readonly area = this.sesion.area;
  protected readonly veTodasLasAreas = this.sesion.veTodasLasAreas;
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly CargaEstado = CargaEstado;
  protected readonly tabsOpciones = computed(() => {
    const area = this.sesion.area();
    return area ? TABS_POR_TIPO_AREA[area.tipo] : TABS_SIN_AREA;
  });
  protected readonly estadoOpciones = ESTADO_OPCIONES;
  protected readonly seleccionado = signal<string | null>(null);

  constructor() {
    effect(() => {
      const codigo = this.casoDeLaDireccion();
      if (codigo) untracked(() => this.seleccionado.set(codigo));
    });
  }

  protected cambiarTab(valor: string): void {
    void this.lista.cambiarTab(valor as FiltroTab);
  }

  protected alCambiarSeleccion(codigo: string | null): void {
    this.seleccionado.set(codigo);
    if (codigo === null && this.casoDeLaDireccion() !== null) {
      void this.router.navigate([], {
        relativeTo: this.route,
        queryParams: { [PARAMETRO_CASO]: null },
        queryParamsHandling: "merge",
        replaceUrl: true,
      });
    }
  }
}
