import { ChangeDetectionStrategy, Component, computed, signal } from "@angular/core";
import { CasosTabla } from "@/features/casos/components/casos-tabla";
import {
  ESTADO_OPCIONES,
  FILTRO_TODOS,
  PRIORIDAD_OPCIONES,
  TABS_OPCIONES,
} from "@/features/casos/constants/casos-constants";
import { CASOS_DEMO } from "@/features/casos/data/casos.demo";
import { FiltroTab } from "@/features/casos/enums/filtro-tab.enum";
import { filtrarCasos } from "@/features/casos/utils/filtrar-casos";
import { BadgeTone } from "@/shared/enums/badge.enum";
import { ButtonSize, ButtonTone, ButtonVariant } from "@/shared/enums/button.enum";
import { Badge } from "@/shared/ui/badge/badge";
import { Button } from "@/shared/ui/button/button";
import { Card } from "@/shared/ui/card/card";
import { SearchInput } from "@/shared/ui/search-input/search-input";
import { SelectField } from "@/shared/ui/select-field/select-field";
import { Tabs } from "@/shared/ui/tabs/tabs";

@Component({
  selector: "app-casos-page",
  imports: [Badge, Button, Card, CasosTabla, SearchInput, SelectField, Tabs],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: "./casos-page.html",
})
export class CasosPage {
  protected readonly BadgeTone = BadgeTone;
  protected readonly ButtonSize = ButtonSize;
  protected readonly ButtonTone = ButtonTone;
  protected readonly ButtonVariant = ButtonVariant;
  protected readonly tabsOpciones = TABS_OPCIONES;
  protected readonly prioridadOpciones = PRIORIDAD_OPCIONES;
  protected readonly estadoOpciones = ESTADO_OPCIONES;

  protected readonly tab = signal<string>(FiltroTab.TODOS);
  protected readonly texto = signal("");
  protected readonly prioridad = signal(FILTRO_TODOS);
  protected readonly estado = signal(FILTRO_TODOS);

  protected readonly casos = computed(() =>
    filtrarCasos(CASOS_DEMO, {
      tab: this.tab() as FiltroTab,
      texto: this.texto(),
      prioridad: this.prioridad(),
      estado: this.estado(),
    }),
  );

  protected readonly hayFiltros = computed(
    () =>
      this.tab() !== FiltroTab.TODOS ||
      this.texto().trim() !== "" ||
      this.prioridad() !== FILTRO_TODOS ||
      this.estado() !== FILTRO_TODOS,
  );

  protected limpiar(): void {
    this.tab.set(FiltroTab.TODOS);
    this.texto.set("");
    this.prioridad.set(FILTRO_TODOS);
    this.estado.set(FILTRO_TODOS);
  }
}
