import { TestBed } from "@angular/core/testing";
import { BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import { ListaUsuariosStore } from "@/features/usuarios/lista-usuarios.store";
import { UsuariosApi } from "@/features/usuarios/services/usuarios.api";
import { crearUsuario } from "@/features/usuarios/testing/usuario-builder";
import type { ListaUsuarios } from "@/features/usuarios/types/usuario.types";
import { RolCodigo } from "@/shared/enums/rol-codigo.enum";
import { TipoArea } from "@/shared/enums/tipo-area.enum";

const HOSPITAL: AreaOpcion = {
  id: "10",
  codigo: "EESS-6206",
  nombre: "Hospital Dos de Mayo",
  tipoArea: TipoArea.ESTABLECIMIENTO,
  establecimiento: { codigoRenipress: "6206", nivelAtencion: null, categoria: null },
};

function lista(cantidad: number, siguiente: string | null = null): ListaUsuarios {
  return {
    usuarios: Array.from({ length: cantidad }, (_, indice) => crearUsuario({ id: String(indice + 1), nombreCompleto: `Persona ${indice + 1}` })),
    siguiente,
    hayMas: siguiente !== null,
  };
}

const esperar = (ms = 15) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("ListaUsuariosStore", () => {
  async function setup(respuesta: ListaUsuarios = lista(3)) {
    const api = {
      listar: vi.fn().mockResolvedValue(respuesta),
      crear: vi.fn(),
      actualizar: vi.fn(),
      restablecerClave: vi.fn(),
    };
    TestBed.configureTestingModule({
      providers: [ListaUsuariosStore, { provide: UsuariosApi, useValue: api }, { provide: BUSQUEDA_DEBOUNCE_MS, useValue: 0 }],
    });
    const store = TestBed.inject(ListaUsuariosStore);
    await esperar();
    return { api, store };
  }

  const ultimaConsulta = (api: { listar: ReturnType<typeof vi.fn> }) => api.listar.mock.lastCall?.[0];

  it("al crearse carga la primera página: 20 usuarios y sin filtros", async () => {
    const { api, store } = await setup();
    expect(api.listar).toHaveBeenCalledTimes(1);
    expect(ultimaConsulta(api)).toEqual({ limite: 20 });
    expect(store.estadoCarga()).toBe(CargaEstado.LISTO);
    expect(store.usuarios()).toHaveLength(3);
  });

  it("cuenta los activos de la lista", async () => {
    const { store } = await setup({
      usuarios: [crearUsuario({ id: "1" }), crearUsuario({ id: "2", activo: false }), crearUsuario({ id: "3" })],
      siguiente: null,
      hayMas: false,
    });
    expect(store.activos()).toBe(2);
  });

  it("irASiguiente pide el cursor del servidor e irAAnterior vuelve por la pila", async () => {
    const { api, store } = await setup(lista(20, "c2"));
    await store.irASiguiente();
    expect(ultimaConsulta(api)).toEqual({ limite: 20, cursor: "c2" });
    expect(store.pagina()).toBe(2);
    expect(store.hayAnterior()).toBe(true);
    await store.irAAnterior();
    expect(ultimaConsulta(api)).toEqual({ limite: 20 });
    expect(store.pagina()).toBe(1);
  });

  it("buscar espera a que la persona termine y manda q desde el principio", async () => {
    const { api, store } = await setup();
    store.escribirTexto("  rosa ");
    await esperar();
    expect(ultimaConsulta(api)).toEqual({ limite: 20, q: "rosa" });
    expect(api.listar).toHaveBeenCalledTimes(2);
    expect(store.hayFiltros()).toBe(true);
  });

  it("filtrar por área manda su código y quitarla lo saca", async () => {
    const { api, store } = await setup();
    await store.cambiarArea(HOSPITAL);
    expect(ultimaConsulta(api)).toEqual({ limite: 20, area: "EESS-6206" });
    await store.cambiarArea(null);
    expect(ultimaConsulta(api)).toEqual({ limite: 20 });
  });

  it("limpiar quita texto y área y vuelve a pedir", async () => {
    const { api, store } = await setup();
    store.escribirTexto("rosa");
    await store.cambiarArea(HOSPITAL);
    await store.limpiar();
    expect(ultimaConsulta(api)).toEqual({ limite: 20 });
    expect(store.hayFiltros()).toBe(false);
  });

  it("un fallo de carga deja el mensaje y permite reintentar", async () => {
    const { api, store } = await setup();
    api.listar.mockRejectedValueOnce(new IncidenciaError(0, null));
    await store.cargar();
    expect(store.estadoCarga()).toBe(CargaEstado.ERROR);
    expect(store.error()).toContain("No se pudieron cargar los usuarios");
    expect(store.error()).toContain("conectar");
    await store.cargar();
    expect(store.error()).toBeNull();
  });

  it("si la página quedó vacía retrocede a la anterior", async () => {
    const { api, store } = await setup(lista(20, "c2"));
    api.listar.mockResolvedValueOnce(lista(0));
    await store.irASiguiente();
    expect(store.pagina()).toBe(1);
    expect(store.usuarios()).toHaveLength(20);
  });

  describe("acciones", () => {
    it("crear devuelve la clave inicial, vuelve a pedir la página y no la guarda en la lista", async () => {
      const { api, store } = await setup();
      const creado = crearUsuario({ id: "9", nombreCompleto: "Nuevo" });
      api.crear.mockResolvedValue({ usuario: creado, claveInicial: "Abc234Def567Ghj89Kmn" });
      const antes = api.listar.mock.calls.length;

      const resultado = await store.crear({ nombreCompleto: "Nuevo", correo: "n@minsa.gob.pe", rol: RolCodigo.GESTOR });
      await esperar();

      expect(resultado).toEqual({ ok: true, usuario: creado, claveInicial: "Abc234Def567Ghj89Kmn" });
      expect(api.listar.mock.calls.length).toBe(antes + 1);
      expect(JSON.stringify(store.usuarios())).not.toContain("Abc234Def567Ghj89Kmn");
    });

    it("crear traduce los errores 409 del servidor", async () => {
      const { api, store } = await setup();
      api.crear.mockRejectedValue(new IncidenciaError(409, "LIMITE_USUARIOS_ESTABLECIMIENTO"));
      const resultado = await store.crear({ nombreCompleto: "Nuevo", correo: "n@minsa.gob.pe", rol: RolCodigo.GESTOR });
      expect(resultado.ok === false && resultado.error).toContain("ya tiene 3 usuarios activos");
    });

    it("cambiar devuelve el usuario y vuelve a pedir la página; un error no la recarga", async () => {
      const { api, store } = await setup();
      api.actualizar.mockResolvedValue(crearUsuario({ activo: false }));
      const antes = api.listar.mock.calls.length;
      const ok = await store.cambiar("1", { activo: false });
      await esperar();
      expect(ok).toMatchObject({ ok: true });
      expect(api.listar.mock.calls.length).toBe(antes + 1);

      api.actualizar.mockRejectedValue(new IncidenciaError(409, "AUTOEDICION_NO_PERMITIDA"));
      const fallo = await store.cambiar("1", { activo: false });
      expect(fallo.ok === false && fallo.error).toContain("tu propio rol");
      expect(api.listar.mock.calls.length).toBe(antes + 1);
    });

    it("restablecerClave devuelve la clave nueva sin tocar la lista", async () => {
      const { api, store } = await setup();
      api.restablecerClave.mockResolvedValue({ usuario: crearUsuario(), claveInicial: "Nueva234Clave567Xyz" });
      const antes = api.listar.mock.calls.length;
      const resultado = await store.restablecerClave("1");
      expect(resultado).toMatchObject({ ok: true, claveInicial: "Nueva234Clave567Xyz" });
      expect(api.listar.mock.calls.length).toBe(antes);
    });
  });
});
