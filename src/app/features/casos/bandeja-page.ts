import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { map } from "rxjs";
import { SessionStore } from "@/core/auth/session.store";
import { BandejaStore } from "@/features/casos/bandeja.store";
import { AreaSelector } from "@/features/casos/components/area-selector";
import { AvisoEnvio } from "@/features/casos/components/aviso-envio";
import { CasoRevision } from "@/features/casos/components/caso-revision";
import { CasosTabla } from "@/features/casos/components/casos-tabla";
import {
  ATAJOS_FECHA,
  BANDEJAS,
  OPCIONES_FILTRO_MOTIVO,
  PLACEHOLDER_BUSQUEDA,
  TABS_POR_TIPO_AREA,
  TABS_SIN_AREA,
} from "@/features/casos/constants/casos-constants";
import type { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import type { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { DateField } from "@/shared/ui/date-field/date-field";
import { PaginadorCursor } from "@/shared/ui/paginador-cursor/paginador-cursor";
import { SearchInput } from "@/shared/ui/search-input/search-input";
import { SelectField } from "@/shared/ui/select-field/select-field";
import { Tabs, type TabOption } from "@/shared/ui/tabs/tabs";

const PARAMETRO_CASO = "caso";

@Component({
  selector: "app-bandeja-page",
  imports: [
    Alert,
    AreaSelector,
    AvisoEnvio,
    Button,
    Card,
    CasoRevision,
    CasosTabla,
    DateField,
    PaginadorCursor,
    SearchInput,
    SelectField,
    Tabs,
  ],
  providers: [BandejaStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./bandeja-page.html",
})
export class BandejaPage {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly sesion = inject(SessionStore);
  private readonly casoDeLaDireccion = toSignal(
    this.route.queryParamMap.pipe(map((parametros) => parametros.get(PARAMETRO_CASO))),
    { initialValue: null },
  );

  protected readonly store = inject(BandejaStore);
  protected readonly area = this.sesion.area;
  protected readonly veTodasLasAreas = this.sesion.veTodasLasAreas;
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly CargaEstado = CargaEstado;
  protected readonly bandejas: readonly TabOption[] = BANDEJAS;
  protected readonly atajos = ATAJOS_FECHA;
  protected readonly motivoOpciones = OPCIONES_FILTRO_MOTIVO;
  protected readonly placeholderBusqueda = PLACEHOLDER_BUSQUEDA;
  protected readonly categoriasOpciones = computed(() => {
    const area = this.sesion.area();
    return area ? TABS_POR_TIPO_AREA[area.tipo] : TABS_SIN_AREA;
  });
  protected readonly actual = computed(
    () => BANDEJAS.find((bandeja) => bandeja.value === this.store.bandeja()) ?? BANDEJAS[0],
  );
  protected readonly seleccionado = signal<string | null>(null);

  constructor() {
    effect(() => {
      const codigo = this.casoDeLaDireccion();
      if (codigo) untracked(() => this.seleccionado.set(codigo));
    });
  }

  protected cambiarBandeja(valor: string): void {
    void this.store.cambiarBandeja(valor as BandejaTab);
  }

  protected cambiarCategoria(valor: string): void {
    void this.store.cambiarCategoria(valor as FiltroTab);
  }

  protected alCambiarDesde(valor: string): void {
    void this.store.cambiarFechas(valor, this.store.hasta());
  }

  protected alCambiarHasta(valor: string): void {
    void this.store.cambiarFechas(this.store.desde(), valor);
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
