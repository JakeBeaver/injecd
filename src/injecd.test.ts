import { spawnContainer, injecd, injecdReturn } from "./injecd";
import { it, expect, describe, beforeEach } from "vitest";

it.fails(".r throws outside container", () => injecd<string>().r);
it.fails(".option throws outside container", () => injecd<string>().option);
it.fails(".or() throws outside container", () => injecd<string>().or("test"));

it("basic resolve", () => {
  const stringT = injecd<string>();
  const container = spawnContainer();

  container.registerInstance(stringT, "testing");
  const resolved = container.resolve(stringT);

  expect(resolved).toBe("testing");
});

describe("nested resolve", () => {
  type factoryType = () => string
  const parentT = injecd<factoryType>();
  const nestedT = injecdReturn<factoryType>();
  let container: ReturnType<typeof spawnContainer>;
  beforeEach(() => {
    container = spawnContainer();
  });
  it("nested resolve", () => {
    container.registerInstance(nestedT, "a");
    container.registerFactory(parentT, (a = nestedT.r) => {
      return () => a;
    });

    const factory = container.resolve(parentT);

    expect(factory()).toBe("a");
  });

  it(".or() without injection gives default value", () => {
    container.registerFactory(parentT, (a = nestedT.or("b")) => {
      return () => a;
    });

    const factory = container.resolve(parentT);

    expect(factory()).toBe("b");
  });

  it(".option without injection gives default value", () => {
    container.registerFactory(parentT, (a = nestedT.option) => {
      return () => a;
    });

    const factory = container.resolve(parentT);

    expect(factory()).toBeUndefined();
  });
});
