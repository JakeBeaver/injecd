import { spawnContainer, injecd, injecdByReturn } from "./injecd";
import { it, expect } from "vitest";

it.fails(".r throws outside container", () => injecd<string>().r);
it.fails(".option throws outside container", () => injecd<string>().option);
it.fails(".or() throws outside container", () =>
  injecd<string>().or("test")
);

it("basic resolve", () => {
  const stringT = injecd<string>();
  const container = spawnContainer();

  container.registerInstance(stringT, "testing");
  const resolved = container.resolve(stringT);

  expect(resolved).toBe("testing");
});

it("nested resolve", () => {
  const nestedStringT = injecd<string>();
  const parentFuncT = injecdByReturn(parentFuncFactory);
  function parentFuncFactory(a: string = nestedStringT.r): () => string {
    return () => a;
  }
  const container = spawnContainer();
  container.registerInstance(nestedStringT, "a");
  container.registerFactory(parentFuncT, parentFuncFactory);

  const resolvedFunc = container.resolve(parentFuncT);
  expect(resolvedFunc()).toBe("a");
});

it(".or() without injection gives default value", () => {
  const nestedStringT = injecd<string>();
  const parentFuncT = injecdByReturn(parentFuncFactory);
  function parentFuncFactory(a: string = nestedStringT.or("default value")): () => string {
    return () => a;
  }
  const container = spawnContainer();
  container.registerFactory(parentFuncT, parentFuncFactory);

  const resolvedFunc = container.resolve(parentFuncT);
  expect(resolvedFunc()).toBe("default value");
});

it(".option without injection gives default value", () => {
  const nestedStringT = injecd<string>();
  const parentFuncT = injecdByReturn(parentFuncFactory);
  function parentFuncFactory(a = nestedStringT.option): () => string | undefined {
    return () => a;
  }
  
  const container = spawnContainer();
  container.registerFactory(parentFuncT, parentFuncFactory);

  const resolvedFunc = container.resolve(parentFuncT);
  expect(resolvedFunc()).toBeUndefined();
});
