import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { TipoArea } from "@/shared/enums/tipo-area.enum";

/** Todas las categorías se pueden elegir al corregir; el servidor decide qué pasa con el caso al cambiarla. */
export function categoriasCorregibles(): readonly CategoriaCaso[] {
  return Object.values(CategoriaCaso);
}

/** Quien no es OTRANS ni el administrador (sin área) pierde de vista un caso corregido a corrupción. */
export function corregirASaleDeLaBandeja(tipoArea: TipoArea | null, categoria: CategoriaCaso | string): boolean {
  return categoria === CategoriaCaso.DENUNCIA_CORRUPCION && tipoArea !== null && tipoArea !== TipoArea.OTRANS;
}

/** Una denuncia de corrupción solo se deriva a un área OTRANS; los demás casos, a un establecimiento. */
export function tipoAreaDeDestino(categoria: CategoriaCaso | null): TipoArea {
  return categoria === CategoriaCaso.DENUNCIA_CORRUPCION ? TipoArea.OTRANS : TipoArea.ESTABLECIMIENTO;
}
