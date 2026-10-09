import { ChangeDetectionStrategy, Component, computed, effect, inject, signal, untracked } from "@angular/core";
import { toSignal } from "@angular/core/rxjs-interop";
import { ActivatedRoute, Router } from "@angular/router";
import { map } from "rxjs";
import { SessionStore } from "@/core/auth/session.store";
import { PLAZOS_TOKEN } from "@/core/config/plazos.config";
import { BandejaStore } from "@/features/casos/bandeja.store";
import { AvisoEnvio } from "@/features/casos/components/aviso-envio";
import { BandejaFiltros } from "@/features/casos/components/bandeja-filtros";
import { CasoRevision } from "@/features/casos/components/caso-revision";
import { CasosTabla } from "@/features/casos/components/casos-tabla";
import { BANDEJAS } from "@/features/casos/constants/casos-constants";
import type { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { bandejasConConteo, textoTotal } from "@/features/casos/utils/conteos-bandeja";
import { textoNotaPlazos } from "@/features/casos/utils/texto-nota-plazos";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { TabsVariante } from "@/shared/enums/tabs.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { PaginadorCursor } from "@/shared/ui/paginador-cursor/paginador-cursor";
import { Tabs } from "@/shared/ui/tabs/tabs";

const PARAMETRO_CASO = "caso";

@Component({
  selector: "app-bandeja-page",
  imports: [Alert, AvisoEnvio, BandejaFiltros, Button, Card, CasoRevision, CasosTabla, PaginadorCursor, Tabs],
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
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly CargaEstado = CargaEstado;
  protected readonly TabsVariante = TabsVariante;
  protected readonly notaPlazos = textoNotaPlazos(inject(PLAZOS_TOKEN));
  protected readonly bandejas = computed(() => bandejasConConteo(BANDEJAS, this.store.conteos()));
  protected readonly totalTexto = computed(() => textoTotal(this.store.total()));
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
