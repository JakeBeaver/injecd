let numberOfContainers = 0;
let currentContainerId: number | null = null;
const error = <T>(message: string): T => {
  throw message;
};
const getContainer = (): number =>
  currentContainerId ||
  error("injecd container action outside of container scope");

class Container {
  private id: number;
  private scope<T>(action: () => T) {
    currentContainerId = this.id;
    const output = action();
    currentContainerId = null;
    return output;
  }
  public static get current() {
    return currentContainerId || error("Some container must be initialized");
  }
  constructor() {
    this.id = ++numberOfContainers;
  }

  /**
   * Registers specific instance
   * @param tag Injecd tag created with `injecd()`
   * @param instance Instance that will be resolved for this tag
   */
  public registerInstance<T>(tag: InjecdTag<T>, instance: T) {
    this.scope(() => tag.internals.registerInstance(instance));
  }

  /**
   * Registers a factory function
   * @param tag Injecd tag created with `injecd()`
   * @param factory Function which will create an instance when resolving
   */
  public registerFactory<T>(tag: InjecdTag<T>, factory: () => T) {
    this.scope(() => tag.internals.registerFactory(factory));
  }

  /**
   * Resolves the entity registered for given injecd tag\
   * Includes all injecd tagged dependencies
   * @param tag Injecd tag created with `injecd()`
   */
  public resolve<T>(tag: InjecdTag<T>) {
    return this.scope(() => tag.internals.resolveHard());
  }

  /**
   * Resolves the entity from a factory function containing injecd tags\
   * Includes all injecd tagged dependencies of references injecd tags
   * @param injecd Injecd tag created with `injecd()`
   */
  public resolveFactory<T>(factory: () => T) {
    return this.scope(() => factory());
  }
}

class InjecdTag<T> {
  /**
   * NO TOUCHY! >:-[
   */
  public internals = new Internals<T>();

  /**
   * Resolution point for this injecd tag.\
   * Throws error if no entity registered for this tag in the container
   * @property r
   * @property required
   */
  get required() {
    return this.r;
  }
  /**
   * Resolution point for this injecd tag.\
   * Throws error if no entity registered for this tag in the container
   * @property r
   * @property required
   */
  get r() {
    return this.internals.resolveHard();
  }

  /**
   * Resolution point for this injecd tag.\
   * Resolves `undefined` if no entity registered for this tag in the container
   * @property o
   * @property optional
   */
  get optional() {
    return this.o;
  }

  /**
   * Resolution point for this injecd tag.\
   * Resolves to `undefined` if no entity registered for this tag in the container
   * @property o
   * @property optional
   */
  get o() {
    return this.internals.resolveSoft();
  }

  /**
   * Resolution point for this injecd tag.\
   * Resolves to defaultValue if no entity registered in the container
   * @param defaultValue Entity that will be passed here if no entity registered for this tag in the container
   */
  or(defaultValue: T): T {
    return this.internals.resolveSoft() || defaultValue;
  }
}

class Internals<T> {
  private containers = new Map<number, () => T>();
  private getFactory(): (() => T) | undefined {
    return this.containers.get(getContainer());
  }
  private setFactory(get: () => T) {
    this.containers.set(getContainer(), get);
  }
  registerFactory(get: () => T) {
    this.setFactory(get);
  }
  registerInstance(instance: T) {
    this.setFactory(() => instance);
  }
  resolveHard(): T {
    const get = this.getFactory();
    return get?.() || error("tried to resolve an unregistered injectable");
  }
  resolveSoft(): T | undefined {
    const get = this.getFactory();
    return get?.();
  }
}

/**
 * @returns number of containers in existance
 */
export const getNumberOfContainers = () => numberOfContainers;

/**
 *  Create a new IoC container
 *  @returns new IoC container
 */
export const spawnContainer = () => new Container();

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
  return new InjecdTag<T>();
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
  return new InjecdTag<ReturnType<T>>();
};
