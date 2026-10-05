import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { BandejasStore } from "@/features/casos/bandejas.store";
import { CasoRevision } from "@/features/casos/components/caso-revision";
import { CasosTabla } from "@/features/casos/components/casos-tabla";
import { LIMITE_BANDEJA, TAMANO_PAGINA } from "@/features/casos/constants/casos-constants";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Alert } from "@/shared/ui/alert/alert";
import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { Paginador } from "@/shared/ui/paginador/paginador";
import { Tabs, type TabOption } from "@/shared/ui/tabs/tabs";

const BANDEJAS: readonly { readonly value: BandejaTab; readonly label: string; readonly ayuda: string }[] = [
  { value: BandejaTab.PARA_ACTUAR, label: "Para actuar", ayuda: "Casos donde tu rol puede hacer algo ahora." },
  { value: BandejaTab.REVISION_IA, label: "En revisión IA", ayuda: "Clasificados por la IA que ninguna persona revisó." },
  { value: BandejaTab.POR_DERIVAR, label: "Por derivar", ayuda: "Categoría ya revisada, pendientes de enviar al área." },
  { value: BandejaTab.EN_GESTION, label: "En gestión", ayuda: "Derivados o que el área está atendiendo." },
  { value: BandejaTab.POR_VENCER, label: "Por vencer", ayuda: "Abiertos que están por cumplir el plazo de atención o que ya lo cumplieron." },
  { value: BandejaTab.RESUELTOS, label: "Resueltos", ayuda: "Con resolución vigente; se archivan cuando cumplen su vigencia." },
  { value: BandejaTab.ARCHIVADOS, label: "Archivados", ayuda: "Resueltos que cumplieron su vigencia y los que vencieron sin atenderse." },
];

@Component({
  selector: "app-bandejas-page",
  imports: [Alert, Button, Card, CasoRevision, CasosTabla, Paginador, Tabs],
  providers: [BandejasStore],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./bandejas-page.html",
})
export class BandejasPage {
  protected readonly store = inject(BandejasStore);

  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly CargaEstado = CargaEstado;
  protected readonly limite = LIMITE_BANDEJA;
  protected readonly tamano = TAMANO_PAGINA;
  protected readonly tab = signal<string>(BandejaTab.PARA_ACTUAR);
  protected readonly pagina = signal(1);
  protected readonly seleccionado = signal<string | null>(null);

  protected readonly hayDatos = computed(() => Object.keys(this.store.porEstado()).length > 0);

  protected readonly opciones = computed<readonly TabOption[]>(() =>
    BANDEJAS.map((bandeja) => ({
      value: bandeja.value,
      label: this.hayDatos() ? `${bandeja.label} (${this.store.cantidad(bandeja.value)})` : bandeja.label,
    })),
  );

  protected readonly actual = computed(() => BANDEJAS.find((bandeja) => bandeja.value === this.tab()) ?? BANDEJAS[0]);
  protected readonly casosDeLaBandeja = computed(() => this.store.casosDe(this.tab() as BandejaTab));
  protected readonly totalPaginas = computed(() => Math.max(Math.ceil(this.casosDeLaBandeja().length / this.tamano), 1));
  protected readonly paginaActual = computed(() => Math.min(Math.max(this.pagina(), 1), this.totalPaginas()));
  protected readonly casos = computed(() => {
    const desde = (this.paginaActual() - 1) * this.tamano;
    return this.casosDeLaBandeja().slice(desde, desde + this.tamano);
  });

  protected cambiarTab(valor: string): void {
    this.tab.set(valor);
    this.pagina.set(1);
  }
}
