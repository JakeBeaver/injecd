let current: Map<InjecdTag<any>, () => any> | null = null;

export class InjecdTag<T> {
  get r(): T {
    if (!current) throw new Error("Cannot resolve outside container scope");
    const get = current.get(this);
    if (!get) throw new Error("Injecd tag not registered");
    return get() as T;
  }
}

export const injecd = <T>(_dummy?: T) => {
  return new InjecdTag<T>();
};

export const injecdReturn = <T extends () => unknown>(_dummyFactory?: T) => {
  return new InjecdTag<ReturnType<T>>();
};

const noValueYet = Symbol();

export class InjecdContainer {
  private static singleton: InjecdContainer;
  static get static(): InjecdContainer {
    if (!this.singleton) {
      this.singleton = new InjecdContainer();
      current = this.singleton.container;
    }
    return this.singleton;
  }
  private container = new Map();

  register<T>(tag: InjecdTag<T>, getInstance: () => T) {
    this.container.set(tag, getInstance);
    return this;
  }
  registerSingleton<T>(tag: InjecdTag<T>, factory: () => T) {
    let i: T | typeof noValueYet = noValueYet;
    return this.register(tag, () => {
      if (i === noValueYet) i = factory();
      return i;
    });
  }
  registerInstance<T>(tag: InjecdTag<T>, instance: T) {
    return this.registerSingleton(tag, () => instance);
  }
  registerClass<T>(tag: InjecdTag<T>, constructor: new () => T) {
    return this.register(tag, () => new constructor());
  }
  registerClassSingleton<T>(tag: InjecdTag<T>, constructor: new () => T) {
    return this.registerSingleton(tag, () => new constructor());
  }

  resolveFactory<T>(factory: () => T) {
    try {
      current = this.container;
      return factory();
    } finally {
      current = InjecdContainer.singleton.container;
    }
  }
  resolve<T>(tag: InjecdTag<T>) {
    return this.resolveFactory(() => tag.r);
  }
}
