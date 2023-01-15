import { injecd, injecdReturn, spawnContainer } from ".";
import { it, expect, describe, beforeEach } from "vitest";

it.fails(".r throws outside container", () => injecd<string>().r);
it.fails(".option throws outside container", () => injecd<string>().optional);
it.fails(".or() throws outside container", () => injecd<string>().or("test"));

it("basic resolve", () => {
  const stringT = injecd<string>();
  const container = spawnContainer();

  container.registerInstance(stringT, "testing");
  const resolved = container.resolve(stringT);

  expect(resolved).toBe("testing");
});

describe("nested resolve", () => {
  type factoryType = () => string;
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
    container.registerFactory(parentT, (a = nestedT.optional) => {
      return () => a;
    });

    const factory = container.resolve(parentT);

    expect(factory()).toBeUndefined();
  });

  it.fails(".r without injection throws", () => {
    container.registerFactory(parentT, (a = nestedT.required) => {
      return () => a;
    });

    container.resolve(parentT);
  });

  it("class type works", () => {
    class Child {
      static tag = injecd<Child>();
      constructor(public id: number) {}
    }
    container.registerInstance(Child.tag, new Child(1));

    class Parent {
      childId: number;
      constructor(child = Child.tag.r) {
        this.childId = child.id;
      }
    }
    const resolved = container.resolveFactory(() => new Parent());

    expect(resolved.childId).toBe(1);
  });

  it("class type works", () => {
    class Child {
      static tag = injecd<Child>();
      constructor(public id: number) {}
    }

    class Parent {
      static tag = injecd<Parent>();
      childId: number;
      constructor(child = Child.tag.r) {
        this.childId = child.id;
      }
    }

    container.registerInstance(Child.tag, new Child(1));
    container.registerClass(Parent.tag, Parent);

    const resolved = container.resolve(Parent.tag);

    expect(resolved.childId).toBe(1);
  });
});

it("multiple containers", () => {
  const tag = injecd<number>();
  const container1 = spawnContainer();
  const container2 = spawnContainer();
  const container3 = spawnContainer();

  container1.registerInstance(tag, 1);
  container2.registerInstance(tag, 2);
  container3.registerInstance(tag, 3);

  expect(container1.resolve(tag)).toBe(1);
  expect(container2.resolve(tag)).toBe(2);
  expect(container3.resolve(tag)).toBe(3);
});
