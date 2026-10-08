import { AtajoFecha } from "@/features/casos/enums/atajo-fecha.enum";
import {
  diasDelRango,
  errorDeRango,
  esFechaValida,
  fechaCorta,
  fechaDeLima,
  rangoDeAtajo,
  sumarDias,
} from "@/features/casos/utils/fechas-lima";

describe("fechas en hora de Lima", () => {
  describe("fechaDeLima", () => {
    it("a las 21:00 de Lima (02:00 UTC del día siguiente) sigue siendo el mismo día", () => {
      expect(fechaDeLima(new Date("2026-03-15T02:00:00Z"))).toBe("2026-03-14");
    });

    it("pasada la medianoche de Lima (05:00 UTC) ya es el día nuevo", () => {
      expect(fechaDeLima(new Date("2026-03-15T04:59:59Z"))).toBe("2026-03-14");
      expect(fechaDeLima(new Date("2026-03-15T05:00:00Z"))).toBe("2026-03-15");
    });

    it("cruza el cambio de año con la hora de Lima", () => {
      expect(fechaDeLima(new Date("2027-01-01T03:00:00Z"))).toBe("2026-12-31");
    });
  });

  describe("fechaCorta", () => {
    it("escribe día, mes y año", () => {
      expect(fechaCorta("2026-10-08")).toBe("08/10/2026");
    });
  });

  describe("esFechaValida", () => {
    it.each(["2026-10-08", "2024-02-29", "2026-12-31"])("%s existe", (valor) => {
      expect(esFechaValida(valor)).toBe(true);
    });

    it.each(["", "2026-02-30", "2026-13-01", "2025-02-29", "08/10/2026", "2026-1-5", "2026-10-08T00:00"])(
      "«%s» no es una fecha válida",
      (valor) => {
        expect(esFechaValida(valor)).toBe(false);
      },
    );
  });

  describe("sumarDias y diasDelRango", () => {
    it("suma y resta días cruzando meses y años", () => {
      expect(sumarDias("2026-03-01", -1)).toBe("2026-02-28");
      expect(sumarDias("2024-03-01", -1)).toBe("2024-02-29");
      expect(sumarDias("2026-12-31", 1)).toBe("2027-01-01");
    });

    it("cuenta ambos extremos", () => {
      expect(diasDelRango("2026-10-08", "2026-10-08")).toBe(1);
      expect(diasDelRango("2026-10-01", "2026-10-31")).toBe(31);
      expect(diasDelRango("2024-01-01", "2024-12-31")).toBe(366);
    });
  });

  describe("rangoDeAtajo", () => {
    const ahora = new Date("2026-10-08T15:00:00Z");

    it("Hoy es el día de Lima en ambos extremos", () => {
      expect(rangoDeAtajo(AtajoFecha.HOY, ahora)).toEqual({ desde: "2026-10-08", hasta: "2026-10-08" });
    });

    it("7 días incluye hoy y los seis anteriores", () => {
      const rango = rangoDeAtajo(AtajoFecha.SIETE_DIAS, ahora);
      expect(rango).toEqual({ desde: "2026-10-02", hasta: "2026-10-08" });
      expect(diasDelRango(rango.desde, rango.hasta)).toBe(7);
    });

    it("30 días incluye hoy y los 29 anteriores, aun cruzando de mes", () => {
      const rango = rangoDeAtajo(AtajoFecha.TREINTA_DIAS, ahora);
      expect(rango).toEqual({ desde: "2026-09-09", hasta: "2026-10-08" });
      expect(diasDelRango(rango.desde, rango.hasta)).toBe(30);
    });

    it("Este mes va del día 1 a hoy", () => {
      expect(rangoDeAtajo(AtajoFecha.ESTE_MES, ahora)).toEqual({ desde: "2026-10-01", hasta: "2026-10-08" });
    });

    it("usa el día de Lima y no el de UTC: a las 02:00 UTC del 1 de noviembre todavía es 31 de octubre", () => {
      const madrugada = new Date("2026-11-01T02:00:00Z");
      expect(rangoDeAtajo(AtajoFecha.HOY, madrugada).hasta).toBe("2026-10-31");
      expect(rangoDeAtajo(AtajoFecha.ESTE_MES, madrugada).desde).toBe("2026-10-01");
    });
  });

  describe("errorDeRango", () => {
    it("sin fechas, o con una sola, no hay error: el otro extremo queda abierto", () => {
      expect(errorDeRango("", "")).toBeNull();
      expect(errorDeRango("2026-10-01", "")).toBeNull();
      expect(errorDeRango("", "2026-10-01")).toBeNull();
    });

    it("desde igual a hasta es válido; desde posterior a hasta no", () => {
      expect(errorDeRango("2026-10-08", "2026-10-08")).toBeNull();
      expect(errorDeRango("2026-10-09", "2026-10-08")).toBe("La fecha «Desde» no puede ser posterior a «Hasta».");
    });

    it("366 días contando ambos extremos es el máximo", () => {
      expect(errorDeRango("2024-01-01", "2024-12-31")).toBeNull();
      expect(errorDeRango("2026-01-01", "2027-01-01")).toBeNull();
      expect(errorDeRango("2026-01-01", "2027-01-02")).toBe("El rango de fechas no puede pasar de 366 días.");
    });

    it("una fecha que no existe se rechaza con un mensaje en español", () => {
      expect(errorDeRango("2026-02-30", "")).toBe("Escribe las fechas completas, con día, mes y año.");
      expect(errorDeRango("", "mañana")).toBe("Escribe las fechas completas, con día, mes y año.");
    });
  });
});
