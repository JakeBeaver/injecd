import { Container, Injectable } from "./injecd";
import { it, expect } from "vitest";

it("basic register resolve", () => {
  const str = new Injectable<string>();
  const container = new Container();

  container.registerInstance(str, "testing");

  expect(str.r).toBe("testing");
});
