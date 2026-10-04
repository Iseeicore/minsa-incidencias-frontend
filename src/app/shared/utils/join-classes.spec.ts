import { joinClasses } from "./join-classes";

describe("joinClasses", () => {
  it("une las clases con un espacio", () => {
    expect(joinClasses("a", "b")).toBe("a b");
  });

  it("descarta los valores vacíos o falsos", () => {
    expect(joinClasses("a", false, null, undefined, "", "b")).toBe("a b");
  });
});
