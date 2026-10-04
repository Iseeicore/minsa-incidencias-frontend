import { buildQueryParams } from "./build-query-params";

describe("buildQueryParams", () => {
  it("omite undefined, null y cadenas vacías", () => {
    expect(buildQueryParams({ page: 1, q: "", estado: undefined, desde: null, activo: false })).toEqual({
      page: 1,
      activo: false,
    });
  });

  it("conserva el cero y el false", () => {
    expect(buildQueryParams({ page: 0, activo: false })).toEqual({ page: 0, activo: false });
  });
});
