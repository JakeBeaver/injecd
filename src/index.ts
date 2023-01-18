const error = <T>(message: string): T => {
  throw message;
};

let currentContainer: Container | null = null;
const getContainer = (): Container =>
  currentContainer ||
  error("injecd container action outside of container scope");

class Container implements InjecdContainer {
  registerFactory<T>(tag: InjecdTag<T>, factory: () => T): InjecdContainer {
    this.scope(() => (tag as Tag<T>).register(factory));
    return this;
  }

  registerFactorySingleton<T>(tag: InjecdTag<T>, factory: () => T) {
    let i: T | undefined;
    return this.registerFactory(tag, () => {
      if (!i) i = factory();
      return i;
    });
  }

  registerClass<T>(tag: InjecdTag<T>, constructor: new () => T) {
    return this.registerFactory(tag, () => new constructor());
  }

  registerClassSingleton<T>(tag: InjecdTag<T>, constructor: new () => T) {
    let i: T | undefined;
    return this.registerFactory(tag, () => {
      if (!i) i = new constructor();
      return i;
    });
  }

  registerInstance<T>(tag: InjecdTag<T>, instance: T) {
    return this.registerFactory(tag, () => instance);
  }

  lock() {
    return {
      resolve: this.resolve.bind(this),
      resolveFactory: this.resolveFactory.bind(this),
    };
  }

  resolve<T>(tag: InjecdTag<T>) {
    return this.scope(() => (tag as Tag<T>).r);
  }

  resolveFactory<T>(factory: () => T) {
    return this.scope(() => factory());
  }

  scope<T>(action: () => T) {
    try {
      // eslint-disable-next-line @typescript-eslint/no-this-alias
      currentContainer = this;
      return action();
    } finally {
      currentContainer = null;
    }
  }
}

class Tag<T> implements InjecdTag<T> {
  private getters = new Map<Container, () => T>();
  get r() {
    const get = this.getters.get(getContainer());
    return get?.() || error<T>("tried to resolve an unregistered injectable");
  }
  register(get: () => T) {
    this.getters.set(getContainer(), get);
  }
}

export interface InjecdContainer extends LockedInjecdContainer {
  /**
   * Registers a factory function
   * @param tag Injecd tag created with `injecd()`
   * @param factory Function which will create an instance when resolving
   */
  registerFactory<T>(tag: InjecdTag<T>, factory: () => T): InjecdContainer;

  /**
   * Registers a class type as factory, singleton mode
   * @param tag Injecd tag created with `injecd()`
   * @param factory Function which will create an instance  and retained for all resolutions
   */
  registerFactorySingleton<T>(
    tag: InjecdTag<T>,
    factory: () => T
  ): InjecdContainer;

  /**
   * Registers a class type as factory, new instance every resolution
   * @param tag Injecd tag created with `injecd()`
   * @param constructor Class which will be instantiated on each resolution
   */
  registerClass<T>(
    tag: InjecdTag<T>,
    constructor: new () => T
  ): InjecdContainer;

  /**
   * Registers a class type as factory, singleton mode
   * @param tag Injecd tag created with `injecd()`
   * @param constructor Class which will be instantiated once and retained for all resolutions
   */
  registerClassSingleton<T>(
    tag: InjecdTag<T>,
    constructor: new () => T
  ): InjecdContainer;

  /**
   * Registers specific instance
   * @param tag Injecd tag created with `injecd()`
   * @param instance Instance that will be resolved for this tag
   */
  registerInstance<T>(tag: InjecdTag<T>, instance: T): InjecdContainer;

  /**
   * Creates a version of the container with `resolve` methods only
   */
  lock(): LockedInjecdContainer;
}

export interface LockedInjecdContainer {
  /**
   * Resolves the entity registered for given injecd tag\
   * Includes all injecd tagged dependencies
   * @param tag Injecd tag created with `injecd()`
   */
  resolve<T>(tag: InjecdTag<T>): T;

  /**
   * Resolves the entity from a factory function containing injecd tags\
   * Includes all injecd tagged dependencies of references injecd tags
   * @param injecd Injecd tag created with `injecd()`
   */
  resolveFactory<T>(factory: () => T): T;
}

export interface InjecdTag<T> {
  /**
   * Resolution point for this injecd tag.\
   * Throws error if no entity registered for this tag in the container
   */
  r: T;
}

/**
 *  Create a new IoC container
 */
export const spawnContainer = () => new Container() as InjecdContainer;

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
