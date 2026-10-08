import { signal } from "@angular/core";
import { TestBed } from "@angular/core/testing";
import type { AreaSesion } from "@/core/auth/auth.types";
import { SessionStore } from "@/core/auth/session.store";
import { BUSQUEDA_DEBOUNCE_MS } from "@/features/casos/constants/casos-config";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { AreasApi } from "@/features/casos/services/areas.api";
import type { AreaOpcion } from "@/features/casos/types/area.types";
import { UsuariosApi } from "@/features/usuarios/services/usuarios.api";
import { crearUsuario } from "@/features/usuarios/testing/usuario-builder";
import type { ListaUsuarios, Usuario } from "@/features/usuarios/types/usuario.types";
import { RolCodigo } from "@/shared/enums/rol-codigo.enum";
import { TipoArea } from "@/shared/enums/tipo-area.enum";
import { UsuariosPage } from "./usuarios-page";

const CLAVE = "Zx7Qm2Rt9Kd4Wp6Hs3Nb";
const HOSPITAL_SESION: AreaSesion = { codigo: "EESS-6206", nombre: "Hospital Dos de Mayo", tipo: TipoArea.ESTABLECIMIENTO };

const HOSPITAL: AreaOpcion = {
  id: "10",
  codigo: "EESS-6206",
  nombre: "Hospital Dos de Mayo",
  tipoArea: TipoArea.ESTABLECIMIENTO,
  establecimiento: { codigoRenipress: "6206", nivelAtencion: null, categoria: null },
};
const OTRANS: AreaOpcion = { id: "1", codigo: "OTRANS", nombre: "OTRANS", tipoArea: TipoArea.OTRANS, establecimiento: null };

const YO = crearUsuario({ id: "00000000-0000-4000-8000-000000000001", nombreCompleto: "Mario Responsable", correo: "mario@minsa.gob.pe", rol: RolCodigo.ESTABLECIMIENTO });
const ROSA = crearUsuario({ id: "00000000-0000-4000-8000-000000000002" });
const LUIS = crearUsuario({ id: "00000000-0000-4000-8000-000000000003", nombreCompleto: "Luis Mamani", correo: "luis@minsa.gob.pe", activo: false });

function lista(usuarios: readonly Usuario[] = [YO, ROSA, LUIS], hayMas = false): ListaUsuarios {
  return { usuarios, siguiente: hayMas ? "cursor-2" : null, hayMas };
}

const esperar = (ms = 15) => new Promise<void>((resolver) => setTimeout(resolver, ms));

describe("UsuariosPage", () => {
  const areasApi = { listar: vi.fn() };

  async function setup(opciones: { area?: AreaSesion | null; respuesta?: ListaUsuarios } = {}) {
    const area = opciones.area === undefined ? HOSPITAL_SESION : opciones.area;
    const api = {
      listar: vi.fn().mockResolvedValue(opciones.respuesta ?? lista()),
      crear: vi.fn(),
      actualizar: vi.fn(),
      restablecerClave: vi.fn(),
    };
    areasApi.listar.mockReset();
    areasApi.listar.mockResolvedValue({ areas: [HOSPITAL], siguiente: null, hayMas: false });
    TestBed.configureTestingModule({
      imports: [UsuariosPage],
      providers: [
        { provide: UsuariosApi, useValue: api },
        { provide: AreasApi, useValue: areasApi },
        { provide: BUSQUEDA_DEBOUNCE_MS, useValue: 0 },
        {
          provide: SessionStore,
          useValue: {
            area: signal(area),
            veTodasLasAreas: signal(area === null),
            sesion: signal({ correo: "Mario@minsa.gob.pe" }),
          },
        },
      ],
    });
    const fixture = TestBed.createComponent(UsuariosPage);
    document.body.appendChild(fixture.nativeElement);
    await fixture.whenStable();
    await esperar();
    await fixture.whenStable();
    const element = fixture.nativeElement as HTMLElement;

    const asentar = async () => {
      await fixture.whenStable();
      await esperar();
      await fixture.whenStable();
    };
    const dialogos = () => Array.from(element.querySelectorAll<HTMLElement>("[role='dialog']"));
    const dialogo = () => dialogos().at(-1) ?? null;
    const botones = (raiz: ParentNode = element) => Array.from(raiz.querySelectorAll<HTMLButtonElement>("button"));
    const boton = (texto: string, raiz: ParentNode = element) => botones(raiz).find((candidato) => candidato.textContent?.includes(texto));
    const pulsar = async (texto: string, raiz: ParentNode = element) => {
      const objetivo = boton(texto, raiz);
      if (!objetivo) throw new Error(`No hay un botón con el texto "${texto}"`);
      objetivo.click();
      await asentar();
    };
    const escribir = async (selector: string, valor: string, raiz: ParentNode = element) => {
      const campo = raiz.querySelector<HTMLInputElement | HTMLSelectElement>(selector) as HTMLInputElement;
      campo.value = valor;
      campo.dispatchEvent(new Event(campo.tagName === "SELECT" ? "change" : "input"));
      await asentar();
    };
    const elegirArea = async (texto: string, raiz: ParentNode) => {
      await escribir("app-area-selector input", texto, raiz);
      const opcion = raiz.querySelector("app-area-selector [role='option']") as HTMLElement;
      opcion.dispatchEvent(new MouseEvent("mousedown", { bubbles: true, cancelable: true }));
      await asentar();
    };
    const filas = () => element.querySelectorAll("tbody tr").length;
    return { api, fixture, element, asentar, dialogo, dialogos, boton, pulsar, escribir, elegirArea, filas };
  }

  afterEach(() => document.body.replaceChildren());

  describe("la lista", () => {
    it("muestra el título y los usuarios con sus seis columnas dentro de una región desplazable", async () => {
      const { element, filas } = await setup();
      expect(element.querySelector("h1")?.textContent).toContain("Usuarios");
      const encabezados = Array.from(element.querySelectorAll("thead th")).map((th) => th.textContent?.trim());
      expect(encabezados).toEqual(["Nombre", "Correo", "Rol", "Área", "Estado", "Acciones"]);
      expect(element.querySelector("app-scroll-area[role='region']")).not.toBeNull();
      expect(filas()).toBe(3);
    });

    it("muestra el rol con su nombre visible, el área y el estado de cada persona", async () => {
      const { element } = await setup();
      const texto = element.querySelector("tbody")?.textContent ?? "";
      expect(texto).toContain("Responsable de establecimiento");
      expect(texto).toContain("Gestor");
      expect(texto).toContain("Hospital Dos de Mayo");
      expect(texto).toContain("Inactivo");
      expect(texto).not.toContain("ESTABLECIMIENTO");
    });

    it("pide la primera página de 20 usuarios", async () => {
      const { api } = await setup();
      expect(api.listar).toHaveBeenCalledWith({ limite: 20 });
    });

    it("el paginador de cursor muestra la página y si hay más", async () => {
      const { element, api, asentar } = await setup({ respuesta: lista([YO, ROSA, LUIS], true) });
      expect(element.querySelector("app-paginador-cursor")?.textContent).toContain("Página 1 · 3 usuarios · hay más");
      api.listar.mockResolvedValueOnce(lista([ROSA], false));
      const siguiente = Array.from(element.querySelectorAll<HTMLButtonElement>("app-paginador-cursor button"))[1];
      siguiente.click();
      await asentar();
      expect(api.listar).toHaveBeenLastCalledWith({ limite: 20, cursor: "cursor-2" });
      expect(element.querySelector("app-paginador-cursor")?.textContent).toContain("Página 2");
    });

    it("buscar manda q al servidor cuando la persona deja de escribir", async () => {
      const { element, api, asentar } = await setup();
      const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
      input.value = "rosa";
      input.dispatchEvent(new Event("input"));
      await asentar();
      expect(api.listar).toHaveBeenLastCalledWith({ limite: 20, q: "rosa" });
    });

    it("sin resultados lo dice y ofrece limpiar; sin filtros solo dice que no hay usuarios", async () => {
      const { element, api, asentar, pulsar } = await setup();
      api.listar.mockResolvedValue(lista([]));
      const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
      input.value = "zzz";
      input.dispatchEvent(new Event("input"));
      await asentar();
      expect(element.textContent).toContain("No hay usuarios con estos filtros");
      await pulsar("Limpiar filtros");
      expect(element.textContent).toContain("Todavía no hay usuarios");
      expect(element.textContent).not.toContain("Limpiar filtros");
    });

    it("si falla la carga lo dice y permite reintentar", async () => {
      const { element, api, asentar, pulsar } = await setup();
      api.listar.mockRejectedValueOnce(new IncidenciaError(0, null));
      const input = element.querySelector<HTMLInputElement>("input[type='search']") as HTMLInputElement;
      input.value = "a";
      input.dispatchEvent(new Event("input"));
      await asentar();
      expect(element.querySelector("[role='alert']")?.textContent).toContain("No se pudieron cargar los usuarios");
      await pulsar("Reintentar");
      expect(element.textContent).not.toContain("No se pudieron cargar los usuarios");
    });
  });

  describe("según quien mira", () => {
    it("el establecimiento ve cuántos usuarios activos tiene, no filtra por área y ve su establecimiento", async () => {
      const { element } = await setup();
      expect(element.textContent).toContain("2 de 3 usuarios activos");
      expect(element.querySelector("app-area-selector")).toBeNull();
      expect(element.querySelector("header")?.textContent).toContain("Establecimiento: Hospital Dos de Mayo");
    });

    it("avisa cuando el establecimiento llegó al tope de usuarios activos", async () => {
      const tres = [YO, ROSA, crearUsuario({ id: "00000000-0000-4000-8000-000000000004", nombreCompleto: "Ana Vega" })];
      const { element } = await setup({ respuesta: lista(tres) });
      expect(element.textContent).toContain("3 de 3 usuarios activos");
      expect(element.textContent).toContain("desactiva antes a un usuario");
    });

    it("con la lista partida en páginas aclara que la cuenta es de esa página", async () => {
      const { element } = await setup({ respuesta: lista([YO, ROSA, LUIS], true) });
      expect(element.textContent).toContain("2 de 3 usuarios activos en esta página");
    });

    it("el administrador (sin área) filtra por área y no ve el contador de cupo", async () => {
      const { element, api, elegirArea } = await setup({ area: null });
      expect(element.textContent).not.toContain("usuarios activos");
      expect(element.querySelector("app-area-selector")).not.toBeNull();
      await elegirArea("dos de mayo", element);
      expect(api.listar).toHaveBeenLastCalledWith({ limite: 20, area: "EESS-6206" });
    });
  });

  describe("crear un usuario", () => {
    async function abrirCrear(opciones: Parameters<typeof setup>[0] = {}) {
      const contexto = await setup(opciones);
      await contexto.pulsar("Nuevo usuario");
      return contexto;
    }

    it("el establecimiento solo puede asignar Gestor o Responsable de establecimiento y no elige área", async () => {
      const { dialogo } = await abrirCrear();
      const opciones = Array.from(dialogo()?.querySelectorAll("option") ?? []).map((opcion) => opcion.textContent?.trim());
      expect(opciones).toEqual(["Elige un rol", "Gestor", "Responsable de establecimiento"]);
      expect(dialogo()?.querySelector("app-area-selector")).toBeNull();
    });

    it("el administrador puede asignar todos los roles", async () => {
      const { dialogo } = await abrirCrear({ area: null });
      const opciones = Array.from(dialogo()?.querySelectorAll("option") ?? []).map((opcion) => opcion.textContent?.trim());
      expect(opciones).toEqual(["Elige un rol", "Administrador", "Gestor", "OTRANS", "Responsable de establecimiento"]);
    });

    it("sin datos no envía y muestra qué falta", async () => {
      const { api, dialogo, pulsar } = await abrirCrear();
      await pulsar("Crear usuario", dialogo() as HTMLElement);
      const texto = dialogo()?.textContent ?? "";
      expect(texto).toContain("Escribe el nombre completo");
      expect(texto).toContain("Escribe el correo");
      expect(texto).toContain("Elige un rol");
      expect(api.crear).not.toHaveBeenCalled();
    });

    it("rechaza un correo mal escrito y un nombre demasiado corto", async () => {
      const { api, dialogo, escribir, pulsar } = await abrirCrear();
      await escribir("#usuario-nombre", "Al", dialogo() as HTMLElement);
      await escribir("#usuario-correo", "no-es-correo", dialogo() as HTMLElement);
      await escribir("select", "GESTOR", dialogo() as HTMLElement);
      await pulsar("Crear usuario", dialogo() as HTMLElement);
      expect(dialogo()?.textContent).toContain("al menos 3 caracteres");
      expect(dialogo()?.textContent).toContain("Escribe un correo válido");
      expect(api.crear).not.toHaveBeenCalled();
    });

    it("crea al usuario con el correo en minúsculas, sin mandar área, y muestra la clave una sola vez", async () => {
      const { api, dialogo, dialogos, escribir, pulsar } = await abrirCrear();
      api.crear.mockResolvedValue({ usuario: crearUsuario({ nombreCompleto: "Pedro Ríos", correo: "pedro@minsa.gob.pe" }), claveInicial: CLAVE });
      await escribir("#usuario-nombre", "  Pedro Ríos ", dialogo() as HTMLElement);
      await escribir("#usuario-correo", " Pedro@Minsa.gob.pe ", dialogo() as HTMLElement);
      await escribir("select", "GESTOR", dialogo() as HTMLElement);
      await pulsar("Crear usuario", dialogo() as HTMLElement);

      expect(api.crear).toHaveBeenCalledWith({ nombreCompleto: "Pedro Ríos", correo: "pedro@minsa.gob.pe", rol: "GESTOR" });
      expect(dialogos()).toHaveLength(1);
      const texto = dialogo()?.textContent ?? "";
      expect(texto).toContain("Usuario creado");
      expect(texto).toContain(CLAVE);
      expect(texto).toContain("No se volverá a mostrar");
      expect(texto).toContain("pedro@minsa.gob.pe");
    });

    it("el administrador debe elegir el área, que sale del tipo que pide el rol", async () => {
      const { api, dialogo, escribir, pulsar, elegirArea } = await abrirCrear({ area: null });
      expect(dialogo()?.querySelector("app-area-selector")).toBeNull();
      await escribir("#usuario-nombre", "Pedro Ríos", dialogo() as HTMLElement);
      await escribir("#usuario-correo", "pedro@minsa.gob.pe", dialogo() as HTMLElement);
      await escribir("select", "GESTOR", dialogo() as HTMLElement);
      expect(dialogo()?.querySelector("app-area-selector")).not.toBeNull();

      await pulsar("Crear usuario", dialogo() as HTMLElement);
      expect(dialogo()?.textContent).toContain("Elige el área del usuario");
      expect(api.crear).not.toHaveBeenCalled();

      await elegirArea("dos de mayo", dialogo() as HTMLElement);
      expect(areasApi.listar).toHaveBeenCalledWith({ q: "dos de mayo", limite: 8, tipo: "ESTABLECIMIENTO" });
      api.crear.mockResolvedValue({ usuario: crearUsuario(), claveInicial: CLAVE });
      await pulsar("Crear usuario", dialogo() as HTMLElement);
      expect(api.crear).toHaveBeenCalledWith({
        nombreCompleto: "Pedro Ríos",
        correo: "pedro@minsa.gob.pe",
        rol: "GESTOR",
        area: "EESS-6206",
      });
    });

    it("para OTRANS el selector pide áreas de tipo OTRANS", async () => {
      areasApi.listar.mockResolvedValue({ areas: [OTRANS], siguiente: null, hayMas: false });
      const { dialogo, escribir, elegirArea } = await abrirCrear({ area: null });
      await escribir("select", "OTRANS", dialogo() as HTMLElement);
      await elegirArea("otr", dialogo() as HTMLElement);
      expect(areasApi.listar).toHaveBeenCalledWith({ q: "otr", limite: 8, tipo: "OTRANS" });
    });

    it("el rol Administrador no lleva área", async () => {
      const { api, dialogo, escribir, pulsar } = await abrirCrear({ area: null });
      await escribir("#usuario-nombre", "Ana Admin", dialogo() as HTMLElement);
      await escribir("#usuario-correo", "ana@minsa.gob.pe", dialogo() as HTMLElement);
      await escribir("select", "ADMINISTRADOR", dialogo() as HTMLElement);
      expect(dialogo()?.querySelector("app-area-selector")).toBeNull();
      api.crear.mockResolvedValue({ usuario: crearUsuario({ rol: RolCodigo.ADMINISTRADOR, area: null }), claveInicial: CLAVE });
      await pulsar("Crear usuario", dialogo() as HTMLElement);
      expect(api.crear).toHaveBeenCalledWith({ nombreCompleto: "Ana Admin", correo: "ana@minsa.gob.pe", rol: "ADMINISTRADOR" });
    });

    it.each([
      ["LIMITE_USUARIOS_ESTABLECIMIENTO", "Este establecimiento ya tiene 3 usuarios activos"],
      ["CORREO_REPETIDO", "Ya existe un usuario con ese correo"],
    ])("un 409 %s se explica y el panel queda abierto con lo escrito", async (codigo, mensaje) => {
      const { api, dialogo, escribir, pulsar } = await abrirCrear();
      api.crear.mockRejectedValue(new IncidenciaError(409, codigo));
      await escribir("#usuario-nombre", "Pedro Ríos", dialogo() as HTMLElement);
      await escribir("#usuario-correo", "pedro@minsa.gob.pe", dialogo() as HTMLElement);
      await escribir("select", "GESTOR", dialogo() as HTMLElement);
      await pulsar("Crear usuario", dialogo() as HTMLElement);

      expect(dialogo()?.querySelector("[role='alert']")?.textContent).toContain(mensaje);
      expect((dialogo()?.querySelector("#usuario-nombre") as HTMLInputElement).value).toBe("Pedro Ríos");
      expect(dialogo()?.textContent).not.toContain(CLAVE);
    });

    it("cancelar cierra el panel sin llamar al servidor y la próxima vez abre vacío", async () => {
      const { api, dialogo, dialogos, escribir, pulsar } = await abrirCrear();
      await escribir("#usuario-nombre", "Pedro Ríos", dialogo() as HTMLElement);
      await pulsar("Cancelar", dialogo() as HTMLElement);
      expect(dialogos()).toHaveLength(0);
      expect(api.crear).not.toHaveBeenCalled();

      await pulsar("Nuevo usuario");
      expect((dialogo()?.querySelector("#usuario-nombre") as HTMLInputElement).value).toBe("");
    });
  });

  describe("la clave inicial", () => {
    async function crearConClave() {
      const contexto = await setup();
      const consola = [
        vi.spyOn(console, "log"),
        vi.spyOn(console, "info"),
        vi.spyOn(console, "warn"),
        vi.spyOn(console, "error"),
        vi.spyOn(console, "debug"),
      ];
      await contexto.pulsar("Nuevo usuario");
      contexto.api.crear.mockResolvedValue({ usuario: crearUsuario({ nombreCompleto: "Pedro Ríos" }), claveInicial: CLAVE });
      await contexto.escribir("#usuario-nombre", "Pedro Ríos", contexto.dialogo() as HTMLElement);
      await contexto.escribir("#usuario-correo", "pedro@minsa.gob.pe", contexto.dialogo() as HTMLElement);
      await contexto.escribir("select", "GESTOR", contexto.dialogo() as HTMLElement);
      await contexto.pulsar("Crear usuario", contexto.dialogo() as HTMLElement);
      return { ...contexto, consola };
    }

    afterEach(() => vi.restoreAllMocks());

    it("el botón Copiar la manda al portapapeles y lo avisa", async () => {
      const escribirTexto = vi.fn().mockResolvedValue(undefined);
      Object.defineProperty(navigator, "clipboard", { value: { writeText: escribirTexto }, configurable: true });
      const { dialogo, pulsar } = await crearConClave();
      await pulsar("Copiar clave", dialogo() as HTMLElement);
      expect(escribirTexto).toHaveBeenCalledWith(CLAVE);
      expect(dialogo()?.textContent).toContain("Clave copiada");
    });

    it("si no se puede copiar lo dice y deja la clave a la vista para copiarla a mano", async () => {
      Object.defineProperty(navigator, "clipboard", {
        value: { writeText: vi.fn().mockRejectedValue(new Error("denegado")) },
        configurable: true,
      });
      const { dialogo, pulsar } = await crearConClave();
      await pulsar("Copiar clave", dialogo() as HTMLElement);
      expect(dialogo()?.textContent).toContain("No se pudo copiar");
      expect(dialogo()?.textContent).toContain(CLAVE);
    });

    it("al cerrar el diálogo la clave se borra de la pantalla y de la memoria de la página", async () => {
      const { dialogos, element, pulsar } = await crearConClave();
      expect(element.textContent).toContain(CLAVE);
      await pulsar("Listo, ya la copié");
      expect(dialogos()).toHaveLength(0);
      expect(element.textContent).not.toContain(CLAVE);
      expect(element.querySelector("app-clave-inicial-dialogo")?.textContent).not.toContain(CLAVE);
    });

    it("Escape también cierra el diálogo y borra la clave", async () => {
      const { dialogos, element, fixture } = await crearConClave();
      document.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape" }));
      await fixture.whenStable();
      expect(dialogos()).toHaveLength(0);
      expect(element.textContent).not.toContain(CLAVE);
    });

    it("la clave no se guarda en el navegador ni se escribe en la consola, y la lista que se recarga no la trae", async () => {
      const { element, consola } = await crearConClave();
      expect(localStorage.length).toBe(0);
      expect(sessionStorage.length).toBe(0);
      for (const espia of consola) {
        const llamadas = JSON.stringify(espia.mock.calls);
        expect(llamadas).not.toContain(CLAVE);
      }
      expect(element.querySelector("tbody")?.textContent).not.toContain(CLAVE);
    });
  });

  describe("editar un usuario", () => {
    async function abrirEdicion(nombre: string, opciones: Parameters<typeof setup>[0] = {}) {
      const contexto = await setup(opciones);
      const boton = Array.from(contexto.element.querySelectorAll<HTMLButtonElement>("tbody button")).find((candidato) =>
        candidato.textContent?.includes(nombre),
      ) as HTMLButtonElement;
      boton.click();
      await contexto.asentar();
      return contexto;
    }

    it("muestra los datos de la persona y las tres opciones: rol, cuenta y clave", async () => {
      const { dialogo } = await abrirEdicion("Rosa Quispe");
      const texto = dialogo()?.textContent ?? "";
      expect(texto).toContain("Editar usuario");
      expect(texto).toContain("rosa@minsa.gob.pe");
      expect(texto).toContain("Cambiar el rol");
      expect(texto).toContain("Desactivar usuario");
      expect(texto).toContain("Restablecer clave");
    });

    it("cambia el rol entre los que puede asignar un establecimiento", async () => {
      const { api, dialogo, escribir, pulsar, boton } = await abrirEdicion("Rosa Quispe");
      const opciones = Array.from(dialogo()?.querySelectorAll("option") ?? []).map((opcion) => opcion.textContent?.trim());
      expect(opciones).toEqual(["Elige un rol", "Gestor", "Responsable de establecimiento"]);
      expect(boton("Guardar rol", dialogo() as HTMLElement)?.disabled).toBe(true);

      api.actualizar.mockResolvedValue(crearUsuario({ rol: RolCodigo.ESTABLECIMIENTO }));
      await escribir("select", "ESTABLECIMIENTO", dialogo() as HTMLElement);
      expect(boton("Guardar rol", dialogo() as HTMLElement)?.disabled).toBe(false);
      await pulsar("Guardar rol", dialogo() as HTMLElement);

      expect(api.actualizar).toHaveBeenCalledWith(ROSA.id, { rol: "ESTABLECIMIENTO" });
      expect(dialogo()?.querySelector("[role='status']")?.textContent).toContain("El rol se actualizó");
    });

    it("desactivar pide confirmación y solo entonces llama al servidor", async () => {
      const { api, dialogo, pulsar } = await abrirEdicion("Rosa Quispe");
      api.actualizar.mockResolvedValue(crearUsuario({ activo: false }));
      await pulsar("Desactivar usuario", dialogo() as HTMLElement);
      expect(api.actualizar).not.toHaveBeenCalled();
      expect(dialogo()?.textContent).toContain("ya no podrá ingresar");

      await pulsar("Sí, desactivar", dialogo() as HTMLElement);
      expect(api.actualizar).toHaveBeenCalledWith(ROSA.id, { activo: false });
      expect(dialogo()?.textContent).toContain("El usuario quedó desactivado");
      expect(dialogo()?.textContent).toContain("Activar usuario");
    });

    it("volver de la confirmación no cambia nada", async () => {
      const { api, dialogo, pulsar, boton } = await abrirEdicion("Rosa Quispe");
      await pulsar("Desactivar usuario", dialogo() as HTMLElement);
      await pulsar("Volver", dialogo() as HTMLElement);
      expect(api.actualizar).not.toHaveBeenCalled();
      expect(boton("Desactivar usuario", dialogo() as HTMLElement)).toBeDefined();
    });

    it("un usuario inactivo se activa con confirmación", async () => {
      const { api, dialogo, pulsar } = await abrirEdicion("Luis Mamani");
      api.actualizar.mockResolvedValue(crearUsuario({ id: LUIS.id, activo: true }));
      await pulsar("Activar usuario", dialogo() as HTMLElement);
      await pulsar("Sí, activar", dialogo() as HTMLElement);
      expect(api.actualizar).toHaveBeenCalledWith(LUIS.id, { activo: true });
    });

    it("al activar a alguien con el tope lleno explica que ya hay 3 activos", async () => {
      const { api, dialogo, pulsar } = await abrirEdicion("Luis Mamani");
      api.actualizar.mockRejectedValue(new IncidenciaError(409, "LIMITE_USUARIOS_ESTABLECIMIENTO"));
      await pulsar("Activar usuario", dialogo() as HTMLElement);
      await pulsar("Sí, activar", dialogo() as HTMLElement);
      expect(dialogo()?.querySelector("[role='alert']")?.textContent).toContain("Este establecimiento ya tiene 3 usuarios activos");
    });

    it("restablecer la clave pide confirmación y muestra la clave nueva una sola vez en otro diálogo", async () => {
      const { api, dialogo, dialogos, pulsar, element } = await abrirEdicion("Rosa Quispe");
      api.restablecerClave.mockResolvedValue({ usuario: ROSA, claveInicial: CLAVE });
      await pulsar("Restablecer clave", dialogo() as HTMLElement);
      expect(api.restablecerClave).not.toHaveBeenCalled();
      expect(dialogo()?.textContent).toContain("la actual dejará de servir");

      await pulsar("Sí, restablecer la clave", dialogo() as HTMLElement);
      expect(api.restablecerClave).toHaveBeenCalledWith(ROSA.id);
      expect(dialogos()).toHaveLength(1);
      expect(dialogo()?.textContent).toContain("Clave restablecida");
      expect(dialogo()?.textContent).toContain(CLAVE);
      expect(dialogo()?.textContent).toContain("No se volverá a mostrar");

      await pulsar("Listo, ya la copié");
      expect(element.textContent).not.toContain(CLAVE);
    });

    describe("sobre uno mismo", () => {
      it("no se puede cambiar el propio rol ni desactivarse, y se explica", async () => {
        const { dialogo, boton, escribir } = await abrirEdicion("Mario Responsable");
        expect(dialogo()?.textContent).toContain("No puedes cambiar tu propio rol ni desactivar tu propia cuenta");
        expect(boton("Desactivar usuario", dialogo() as HTMLElement)?.disabled).toBe(true);
        await escribir("select", "GESTOR", dialogo() as HTMLElement);
        expect(boton("Guardar rol", dialogo() as HTMLElement)?.disabled).toBe(true);
      });

      it("si el servidor rechaza la autoedición lo explica", async () => {
        const { api, dialogo, pulsar } = await abrirEdicion("Rosa Quispe");
        api.actualizar.mockRejectedValue(new IncidenciaError(409, "AUTOEDICION_NO_PERMITIDA"));
        await pulsar("Desactivar usuario", dialogo() as HTMLElement);
        await pulsar("Sí, desactivar", dialogo() as HTMLElement);
        expect(dialogo()?.querySelector("[role='alert']")?.textContent).toContain("No puedes cambiar tu propio rol");
      });
    });

    describe("como administrador", () => {
      it("al pasar a un administrador a otro rol pide el área según el rol y la manda", async () => {
        const admin = crearUsuario({ id: "00000000-0000-4000-8000-000000000009", nombreCompleto: "Ana Admin", correo: "ana@minsa.gob.pe", rol: RolCodigo.ADMINISTRADOR, area: null });
        const { api, dialogo, escribir, elegirArea, boton, pulsar } = await abrirEdicion("Ana Admin", {
          area: null,
          respuesta: lista([admin]),
        });
        expect(dialogo()?.querySelector("app-area-selector")).toBeNull();
        await escribir("select", "GESTOR", dialogo() as HTMLElement);
        expect(dialogo()?.querySelector("app-area-selector")).not.toBeNull();
        expect(boton("Guardar rol", dialogo() as HTMLElement)?.disabled).toBe(true);

        await elegirArea("dos de mayo", dialogo() as HTMLElement);
        expect(boton("Guardar rol", dialogo() as HTMLElement)?.disabled).toBe(false);
        api.actualizar.mockResolvedValue(crearUsuario({ id: admin.id, rol: RolCodigo.GESTOR }));
        await pulsar("Guardar rol", dialogo() as HTMLElement);
        expect(api.actualizar).toHaveBeenCalledWith(admin.id, { rol: "GESTOR", area: "EESS-6206" });
      });

      it("cambiar entre roles del mismo tipo de área no pide área", async () => {
        const { dialogo, escribir } = await abrirEdicion("Rosa Quispe", { area: null });
        await escribir("select", "ESTABLECIMIENTO", dialogo() as HTMLElement);
        expect(dialogo()?.querySelector("app-area-selector")).toBeNull();
      });
    });
  });
});
