import { TestBed } from "@angular/core/testing";
import { CasosStore } from "@/features/casos/casos.store";
import { CargaEstado } from "@/features/casos/enums/carga-estado.enum";
import { CategoriaCaso } from "@/features/casos/enums/categoria-caso.enum";
import { EstadoCaso } from "@/features/casos/enums/estado-caso.enum";
import { IncidenciaError } from "@/features/casos/services/incidencia-error";
import { IncidenciasApi } from "@/features/casos/services/incidencias.api";
import { crearDetalle } from "@/features/casos/testing/caso-builder";
import type { CasoDetalle, RespuestaAccion } from "@/features/casos/types/caso.types";

function pendiente<T>() {
  let resolver!: (valor: T) => void;
  let rechazar!: (error: unknown) => void;
  const promesa = new Promise<T>((alResolver, alRechazar) => {
    resolver = alResolver;
    rechazar = alRechazar;
  });
  return { promesa, resolver, rechazar };
}

function respuesta(caso: CasoDetalle | null, mensaje = "Hecho"): RespuestaAccion {
  return { mensaje, caso };
}

describe("CasosStore", () => {
  function setup() {
    const api = {
      detalle: vi.fn(),
      confirmar: vi.fn(),
      corregir: vi.fn(),
      derivar: vi.fn(),
      tomar: vi.fn(),
      resolver: vi.fn(),
    };
    TestBed.configureTestingModule({ providers: [{ provide: IncidenciasApi, useValue: api }] });
    return { api, store: TestBed.inject(CasosStore) };
  }

  describe("abrir", () => {
    it("carga el detalle y pasa de cargando a listo", async () => {
      const { api, store } = setup();
      const espera = pendiente<CasoDetalle>();
      api.detalle.mockReturnValue(espera.promesa);

      const apertura = store.abrir("MINSA-2026-000001");
      expect(store.estadoDetalle()).toBe(CargaEstado.CARGANDO);

      espera.resolver(crearDetalle({ codigo: "MINSA-2026-000001" }));
      await apertura;
      expect(store.estadoDetalle()).toBe(CargaEstado.LISTO);
      expect(store.detalle()?.codigo).toBe("MINSA-2026-000001");
      expect(store.errorDetalle()).toBeNull();
      expect(api.detalle).toHaveBeenCalledWith("MINSA-2026-000001");
    });

    it("un caso que el rol no ve (404) deja el mensaje de no disponible", async () => {
      const { api, store } = setup();
      api.detalle.mockRejectedValue(new IncidenciaError(404, "NOT_FOUND"));
      await store.abrir("MINSA-2026-000009");
      expect(store.estadoDetalle()).toBe(CargaEstado.ERROR);
      expect(store.detalle()).toBeNull();
      expect(store.errorDetalle()).toContain("ya no está disponible");
    });

    it("un fallo de red deja el mensaje de conexión y permite reintentar", async () => {
      const { api, store } = setup();
      api.detalle.mockRejectedValueOnce(new IncidenciaError(0, null));
      await store.abrir("MINSA-2026-000001");
      expect(store.errorDetalle()).toContain("conectar");

      api.detalle.mockResolvedValueOnce(crearDetalle());
      await store.reintentar();
      expect(store.estadoDetalle()).toBe(CargaEstado.LISTO);
      expect(store.errorDetalle()).toBeNull();
    });

    it("la respuesta lenta de un caso anterior no pisa al caso que se abrió después", async () => {
      const { api, store } = setup();
      const lenta = pendiente<CasoDetalle>();
      api.detalle.mockReturnValueOnce(lenta.promesa);
      api.detalle.mockResolvedValueOnce(crearDetalle({ codigo: "MINSA-2026-000002" }));

      const primera = store.abrir("MINSA-2026-000001");
      await store.abrir("MINSA-2026-000002");
      lenta.resolver(crearDetalle({ codigo: "MINSA-2026-000001" }));
      await primera;

      expect(store.detalle()?.codigo).toBe("MINSA-2026-000002");
    });

    it("cerrar limpia el detalle y descarta la respuesta que llegue tarde", async () => {
      const { api, store } = setup();
      const lenta = pendiente<CasoDetalle>();
      api.detalle.mockReturnValue(lenta.promesa);
      const apertura = store.abrir("MINSA-2026-000001");
      store.cerrar();
      lenta.resolver(crearDetalle());
      await apertura;
      expect(store.detalle()).toBeNull();
      expect(store.estadoDetalle()).toBe(CargaEstado.INICIAL);
    });
  });

  describe("acciones", () => {
    it.each([
      ["confirmar", (store: CasosStore) => store.confirmar("MINSA-2026-000001"), ["MINSA-2026-000001"]],
      ["derivar", (store: CasosStore) => store.derivar("MINSA-2026-000001", "EESS-6206"), ["MINSA-2026-000001", "EESS-6206"]],
      ["tomar", (store: CasosStore) => store.tomar("MINSA-2026-000001"), ["MINSA-2026-000001"]],
      [
        "corregir",
        (store: CasosStore) => store.corregir("MINSA-2026-000001", CategoriaCaso.QUEJA),
        ["MINSA-2026-000001", CategoriaCaso.QUEJA],
      ],
      ["resolver", (store: CasosStore) => store.resolver("MINSA-2026-000001", "Se atendió"), ["MINSA-2026-000001", "Se atendió"]],
    ] as const)("%s llama al servidor, actualiza el detalle y avisa que algo cambió", async (nombre, ejecutar, argumentos) => {
      const { api, store } = setup();
      api[nombre].mockResolvedValue(respuesta(crearDetalle({ estado: EstadoCaso.DERIVADO }), "Listo"));
      const antes = store.cambios();

      const resultado = await ejecutar(store);

      expect(api[nombre]).toHaveBeenCalledWith(...argumentos);
      expect(resultado).toEqual({ ok: true, mensaje: "Listo" });
      expect(store.detalle()?.estado).toBe(EstadoCaso.DERIVADO);
      expect(store.cambios()).toBe(antes + 1);
    });

    it("si la corrección saca el caso de la vista, el detalle queda vacío y el mensaje se devuelve", async () => {
      const { api, store } = setup();
      api.detalle.mockResolvedValue(crearDetalle());
      await store.abrir("MINSA-2026-000001");
      api.corregir.mockResolvedValue(respuesta(null, "El caso pasó al área de corrupción."));

      const resultado = await store.corregir("MINSA-2026-000001", CategoriaCaso.DENUNCIA_CORRUPCION);

      expect(resultado).toEqual({ ok: true, mensaje: "El caso pasó al área de corrupción." });
      expect(store.detalle()).toBeNull();
      expect(store.cambios()).toBe(1);
    });

    it("un 403 devuelve el error sin tocar el detalle ni avisar de cambios", async () => {
      const { api, store } = setup();
      api.detalle.mockResolvedValue(crearDetalle());
      await store.abrir("MINSA-2026-000001");
      api.derivar.mockRejectedValue(new IncidenciaError(403, "FORBIDDEN"));

      const resultado = await store.derivar("MINSA-2026-000001", "EESS-6206");

      expect(resultado.ok).toBe(false);
      expect(resultado.ok === false && resultado.error).toContain("No tienes permiso");
      expect(store.detalle()).not.toBeNull();
      expect(store.cambios()).toBe(0);
    });

    it("un 409 avisa que otra persona pudo actuar y pide recargar las listas", async () => {
      const { api, store } = setup();
      api.confirmar.mockRejectedValue(new IncidenciaError(409, "CONFLICT"));
      const resultado = await store.confirmar("MINSA-2026-000001");
      expect(resultado.ok === false && resultado.error).toContain("otra persona");
      expect(store.cambios()).toBe(1);
    });

    it("un 404 al actuar también recarga las listas", async () => {
      const { api, store } = setup();
      api.tomar.mockRejectedValue(new IncidenciaError(404, "NOT_FOUND"));
      const resultado = await store.tomar("MINSA-2026-000001");
      expect(resultado.ok === false && resultado.error).toContain("ya no está disponible");
      expect(store.cambios()).toBe(1);
    });

    it("un 422 al corregir explica que la categoría debe ser distinta", async () => {
      const { api, store } = setup();
      api.corregir.mockRejectedValue(new IncidenciaError(422, "UNPROCESSABLE"));
      const resultado = await store.corregir("MINSA-2026-000001", CategoriaCaso.RECLAMO);
      expect(resultado.ok === false && resultado.error).toContain("distinta");
    });

    it("no permite resolver con la resolución vacía ni pasarse del máximo, sin llamar al servidor", async () => {
      const { api, store } = setup();
      const vacia = await store.resolver("MINSA-2026-000001", "   ");
      expect(vacia.ok === false && vacia.error).toContain("no puede estar vacía");
      const larga = await store.resolver("MINSA-2026-000001", "x".repeat(4001));
      expect(larga.ok === false && larga.error).toContain("4000");
      expect(api.resolver).not.toHaveBeenCalled();
    });

    it("manda la resolución sin espacios sobrantes", async () => {
      const { api, store } = setup();
      api.resolver.mockResolvedValue(respuesta(crearDetalle({ estado: EstadoCaso.RESUELTO })));
      await store.resolver("MINSA-2026-000001", "  Se atendió  ");
      expect(api.resolver).toHaveBeenCalledWith("MINSA-2026-000001", "Se atendió");
    });
  });
});
