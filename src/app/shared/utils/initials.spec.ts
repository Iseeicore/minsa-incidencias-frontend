import { firstName, initials } from "./initials";

describe("initials", () => {
  it("toma la inicial de las dos primeras palabras", () => {
    expect(initials("ana maría pérez")).toBe("AM");
  });

  it("con una sola palabra devuelve una inicial", () => {
    expect(initials("Ana")).toBe("A");
  });

  it("ignora espacios sobrantes y el texto vacío", () => {
    expect(initials("  Ana   Pérez ")).toBe("AP");
    expect(initials("   ")).toBe("");
  });
});

describe("firstName", () => {
  it("devuelve la primera palabra", () => {
    expect(firstName("Ana María Pérez")).toBe("Ana");
  });

  it("devuelve vacío si no hay nombre", () => {
    expect(firstName("")).toBe("");
  });
});
