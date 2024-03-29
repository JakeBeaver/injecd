import { injecd, InjecdContainer, injecdReturn, InjecdTag } from ".";
import { it, expect, describe, beforeEach } from "vitest";

it.fails(".r throws outside container", () => injecd<string>().r);

it("doesnt fail with a static container", () => {
  const tag = injecd<string>();
  InjecdContainer.static.registerInstance(tag, "test");
  expect(tag.r).toBe("test");
});

it("basic resolve", () => {
  const value: InjecdTag<string> = injecd<string>();
  const container: InjecdContainer = new InjecdContainer();

  container.registerInstance(value, "testing");
  const resolved = container.resolve(value);

  expect(resolved).toBe("testing");
});

describe("nested resolve", () => {
  type factoryType = () => string;
  const getValue = injecd<factoryType>();
  const value = injecdReturn<factoryType>();
  let container: InjecdContainer;
  beforeEach(() => {
    container = new InjecdContainer();
  });
  it("nested resolve", () => {
    container.registerInstance(value, "a");
    container.register(getValue, (a = value.r) => {
      return () => a;
    });

    const factory = container.resolve(getValue);

    expect(factory()).toBe("a");
  });

  it.fails(".r without injection throws", () => {
    container.register(getValue, (a = value.r) => {
      return () => a;
    });

    container.resolve(getValue);
  });
});

describe("class resolve", () => {
  let container: InjecdContainer;
  beforeEach(() => {
    container = new InjecdContainer();
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
  it("resolve different instance", () => {
    class A {}
    const tag = injecd<A>();
    container.registerClass(tag, A);
    const r = () => container.resolve(tag);

    expect(r()).not.toBe(r());
  });
  it("resolve the same singleton class", () => {
    class A {}
    const tag = injecd<A>();
    container.registerClassSingleton(tag, A);
    const r = () => container.resolve(tag);

    expect(r()).toBe(r());
  });
  it("singleton instantiates lazy on resolve", () => {
    const num = injecd<number>();
    const tag = injecd<A>();
    class A {
      constructor(public n = num.r) {}
    }

    container.registerClassSingleton(tag, A);
    container.registerInstance(num, 1);

    const resolved = container.resolve(tag);

    expect(resolved.n).toBe(1);
  });
  it("resolve the same instance from singleton factory", () => {
    const A = () => ({});
    const tag = injecdReturn(A);
    container.registerSingleton(tag, A);
    const r = () => container.resolve(tag);

    expect(r()).toBe(r());
  });
  it("resolve different instance from factory", () => {
    const A = () => ({});
    const tag = injecdReturn(A);
    container.register(tag, A);
    const r = () => container.resolve(tag);

    expect(r()).not.toBe(r());
  });
});

it("multiple containers", () => {
  const tag = injecd<number>();
  const container1 = new InjecdContainer();
  const container2 = new InjecdContainer();
  const container3 = new InjecdContainer();

  container1.registerInstance(tag, 1);
  container2.registerInstance(tag, 2);
  container3.registerInstance(tag, 3);

  expect(container1.resolve(tag)).toBe(1);
  expect(container2.resolve(tag)).toBe(2);
  expect(container3.resolve(tag)).toBe(3);
});
