import { InjecdTag, InjecdContainer } from "./rewrite/rewrite";
import { it, expect } from "vitest";

it.fails(".r throws outside container", () => new InjecdTag<string>().r);

it("basic resolve", () => {
  // setup
  const tag = new InjecdTag();
  const container = new InjecdContainer();
  const instance = {};

  // register
  container.register(tag, () => instance);

  // resolve
  const resolved = container.resolve(tag);

  // check
  expect(resolved).toBe(instance);
});
