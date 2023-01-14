import { it, expect } from "vitest";
import { getNumberOfContainers, spawnContainer } from "./injecd";
it("fresh module per file", () => {
  expect(getNumberOfContainers()).toBe(0);
  spawnContainer();
  expect(getNumberOfContainers()).toBe(1);
});