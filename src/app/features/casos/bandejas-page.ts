import { ChangeDetectionStrategy, Component, computed, inject, signal } from "@angular/core";
import { PLAZOS_TOKEN } from "@/core/config/plazos.config";
import { CasosStore } from "@/features/casos/casos.store";
import { CasoRevision } from "@/features/casos/components/caso-revision";
import { CasosTabla } from "@/features/casos/components/casos-tabla";
import { CasosFiltros } from "@/features/casos/components/casos-filtros";
import { RolDemoSelector } from "@/features/casos/components/rol-demo-selector";
import { FILTRO_TODOS } from "@/features/casos/constants/casos-constants";
import { BandejaTab } from "@/features/casos/enums/bandeja-tab.enum";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { filtrarBandeja } from "@/features/casos/utils/filtrar-bandeja";
import { filtrarCasos } from "@/features/casos/utils/filtrar-casos";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Badge } from "@/shared/ui/badge/badge";
import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";

const BANDEJAS: readonly { readonly value: BandejaTab; readonly label: string; readonly ayuda: string }[] = [
  { value: BandejaTab.PARA_ACTUAR, label: "Para actuar", ayuda: "Casos donde tu rol puede hacer algo ahora." },
  { value: BandejaTab.REVISION_IA, label: "En revisión IA", ayuda: "Clasificados por la IA que ninguna persona revisó." },
  { value: BandejaTab.POR_DERIVAR, label: "Por derivar", ayuda: "Categoría ya revisada, pendientes de enviar al área." },
  { value: BandejaTab.EN_GESTION, label: "En gestión", ayuda: "Derivados o que el área está atendiendo." },
  { value: BandejaTab.POR_VENCER, label: "Por vencer", ayuda: "Abiertos que están por cumplir el plazo de atención." },
  { value: BandejaTab.RESUELTOS, label: "Resueltos", ayuda: "Con resolución vigente; se archivan solos." },
  { value: BandejaTab.ARCHIVADOS, label: "Archivados", ayuda: "Resueltos que cumplieron su vigencia y los que vencieron sin atenderse." },
];

@Component({
  selector: "app-bandejas-page",
  imports: [Badge, Button, Card, CasoRevision, CasosFiltros, CasosTabla, RolDemoSelector],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./bandejas-page.html",
})
export class BandejasPage {
  private readonly store = inject(CasosStore);

  protected readonly plazos = inject(PLAZOS_TOKEN);
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly BandejaTab = BandejaTab;
  protected readonly tab = signal<string>(BandejaTab.PARA_ACTUAR);
  protected readonly seleccionado = signal<string | null>(null);

  protected readonly texto = signal("");
  protected readonly categoria = signal<string>(FiltroTab.TODOS);
  protected readonly prioridad = signal(FILTRO_TODOS);
  protected readonly estado = signal(FILTRO_TODOS);

  protected readonly opciones = computed(() =>
    BANDEJAS.map((bandeja) => ({
      ...bandeja,
      cantidad: filtrarBandeja(this.store.casos(), bandeja.value, this.store.rol(), this.plazos).length,
    })),
  );

  protected readonly actual = computed(() => BANDEJAS.find((bandeja) => bandeja.value === this.tab()) ?? BANDEJAS[0]);

  protected readonly delaBandeja = computed(() =>
    filtrarBandeja(this.store.casos(), this.tab() as BandejaTab, this.store.rol(), this.plazos),
  );

  protected readonly casos = computed(() =>
    filtrarCasos(this.delaBandeja(), {
      tab: this.categoria() as FiltroTab,
      texto: this.texto(),
      prioridad: this.prioridad(),
      estado: this.estado(),
    }),
  );

  protected readonly hayFiltros = computed(
    () =>
      this.categoria() !== FiltroTab.TODOS ||
      this.texto().trim() !== "" ||
      this.prioridad() !== FILTRO_TODOS ||
      this.estado() !== FILTRO_TODOS,
  );

  protected limpiar(): void {
    this.texto.set("");
    this.categoria.set(FiltroTab.TODOS);
    this.prioridad.set(FILTRO_TODOS);
    this.estado.set(FILTRO_TODOS);
  }

  protected seleccionar(bandeja: BandejaTab): void {
    this.tab.set(bandeja);
  }
}
