import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { TipoArea } from "@/shared/enums/tipo-area.enum";

/**
 * Categorías a las que puede cambiar un caso quien lo corrige. Un establecimiento no elige corrupción: esas
 * denuncias las toma OTRANS. Sin área (administrador) y en OTRANS se puede elegir cualquiera.
 */
export function categoriasCorregibles(tipoArea: TipoArea | null): readonly CategoriaCaso[] {
  const todas = Object.values(CategoriaCaso);
  if (tipoArea === null || tipoArea === TipoArea.OTRANS) return todas;
  return todas.filter((categoria) => categoria !== CategoriaCaso.DENUNCIA_CORRUPCION);
}

/** Una denuncia de corrupción solo se deriva a un área OTRANS; los demás casos, a un establecimiento. */
export function tipoAreaDeDestino(categoria: CategoriaCaso | null): TipoArea {
  return categoria === CategoriaCaso.DENUNCIA_CORRUPCION ? TipoArea.OTRANS : TipoArea.ESTABLECIMIENTO;
}
