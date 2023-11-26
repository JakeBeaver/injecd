let currentContainer: Map<any, any> | null = null;

export class InjecdTag<T> {
  get r(): T {
    if (!currentContainer)
      throw new Error("Trying to resolve outside injecd container scope");
    if (!currentContainer.has(this))
      throw new Error("Injecd tag not registered");
    return currentContainer.get(this)() as T;
  }
}

export const injecd = <T>(_dummy?: T) => {
  return new InjecdTag<T>() as InjecdTag<T>;
};

export const injecdReturn = <T extends () => unknown>(_dummyFactory?: T) => {
  return new InjecdTag<ReturnType<T>>() as InjecdTag<ReturnType<T>>;
};

export class InjecdContainer {
  private static _staticContainer: InjecdContainer;
  static get static(): InjecdContainer {
    if (!this._staticContainer) {
      this._staticContainer = new InjecdContainer();
      currentContainer = this._staticContainer.container;
    }
    return this._staticContainer;
  }
  private container = new Map();

  register<T>(tag: InjecdTag<T>, getInstance: () => T) {
    this.container.set(tag, getInstance);
    return this;
  }
  registerSingleton<T>(tag: InjecdTag<T>, factory: () => T) {
    let i: T | undefined;
    return this.register(tag, () => {
      if (!i) i = factory();
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
      currentContainer = this.container;
      return factory();
    } finally {
      currentContainer = InjecdContainer._staticContainer.container;
    }
  }
  resolve<T>(tag: InjecdTag<T>) {
    return this.resolveFactory(() => tag.r);
  }
}
