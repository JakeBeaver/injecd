const error = <T>(message: string): T => {
  throw message;
};

let currentContainer: InjecdContainer | null = null;
const getContainer = (): InjecdContainer =>
  currentContainer ||
  error("injecd container action outside of container scope");

class InjecdContainer {
  /**
   * Registers a factory function
   * @param tag Injecd tag created with `injecd()`
   * @param factory Function which will create an instance when resolving
   */
  registerFactory<T>(tag: InjecdTag<T>, factory: () => T) {
    this.scope(() => (tag as Tag<T>).internals.register(factory));
  }

  /**
   * Registers a class type as factory, singleton mode
   * @param tag Injecd tag created with `injecd()`
   * @param factory Function which will create an instance  and retained for all resolutions
   */
  registerFactorySingleton<T>(tag: InjecdTag<T>, factory: () => T) {
    let i: T | undefined;
    this.registerFactory(tag, () => {
      if (!i) i = factory();
      return i;
    });
  }

  /**
   * Registers a class type as factory, new instance every resolution
   * @param tag Injecd tag created with `injecd()`
   * @param constructor Class which will be instantiated on each resolution
   */
  registerClass<T>(tag: InjecdTag<T>, constructor: new () => T) {
    this.registerFactory(tag, () => new constructor());
  }

  /**
   * Registers a class type as factory, singleton mode
   * @param tag Injecd tag created with `injecd()`
   * @param constructor Class which will be instantiated once and retained for all resolutions
   */
  registerClassSingleton<T>(tag: InjecdTag<T>, constructor: new () => T) {
    let i: T | undefined;
    this.registerFactory(tag, () => {
      if (!i) i = new constructor();
      return i;
    });
  }

  /**
   * Registers specific instance
   * @param tag Injecd tag created with `injecd()`
   * @param instance Instance that will be resolved for this tag
   */
  registerInstance<T>(tag: InjecdTag<T>, instance: T) {
    this.registerFactory(tag, () => instance);
  }

  /**
   * Resolves the entity registered for given injecd tag\
   * Includes all injecd tagged dependencies
   * @param tag Injecd tag created with `injecd()`
   */
  resolve<T>(tag: InjecdTag<T>) {
    return this.scope(() => (tag as Tag<T>).internals.resolveHard());
  }

  /**
   * Resolves the entity from a factory function containing injecd tags\
   * Includes all injecd tagged dependencies of references injecd tags
   * @param injecd Injecd tag created with `injecd()`
   */
  resolveFactory<T>(factory: () => T) {
    return this.scope(() => factory());
  }

  private scope<T>(action: () => T) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      currentContainer = this;
      return action();
    } finally {
      currentContainer = null;
    }
  }
}

export interface InjecdTag<T> {
  /**
   * Resolution point for this injecd tag.\
   * Throws error if no entity registered for this tag in the container
   */
  r: T;
}

class Tag<T> implements InjecdTag<T> {
  get r() {
    return this.internals.resolveHard();
  }
  internals = new Internals<T>();
}

class Internals<T> {
  private getters = new Map<InjecdContainer, () => T>();
  register(get: () => T) {
    this.getters.set(getContainer(), get);
  }
  resolveSoft(): T | undefined {
    const get = this.getters.get(getContainer());
    return get?.();
  }
  resolveHard(): T {
    return (
      this.resolveSoft() || error("tried to resolve an unregistered injectable")
    );
  }
}

/**
 *  Create a new IoC container
 *  @returns new IoC container
 */
export const spawnContainer = () => new InjecdContainer();

/**
 * Create a new injecd tag for a container to register and resolve entitity or factory.\
 * In TS provide a type either using generics or provide a dummy to base the type on:
 * - `injecd<entityType>()`
 * - `injecd(dummy)` is short for `injecd<typeof dummy>()`
 * @param _dummy optional object for type inference
 * @returns new injecd tag
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const injecd = <T>(_dummy?: T) => {
  return new Tag<T>() as InjecdTag<T>;
};

/**
 * TS utility for simpler type inference using `injecd()`
 * - `injecdReturn<factoryType>()` is short for `injecdReturn<ReturnType<factoryType>>()`
 * - `injecdReturn(dummyFactory)` is short for `injecd<ReturnType<typeof dummyFactory>>()`
 * @param _dummyFactory optional object for type inference
 * @returns new injecd tag
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const injecdReturn = <T extends () => unknown>(_dummyFactory?: T) => {
  return new Tag<ReturnType<T>>() as InjecdTag<ReturnType<T>>;
};
