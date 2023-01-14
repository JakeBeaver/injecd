let idCounter = 1;
let currentContainerId = 0;
export class Container {
  private id: number;
  private activate = () => (currentContainerId = this.id);
  public static get current() {
    if (!currentContainerId) throw "Some container must be initialized";
    return currentContainerId;
  }
  constructor() {
    this.id = idCounter++;
  }
  public registerInstance<T>(resolver: Injectable<T>, instance: T) {
    this.activate();
    resolver.DO_NOT_USE_registerInstance(instance);
  }
  public registerFactory<T>(resolver: Injectable<T>, factory: () => T) {
    this.activate();
    resolver.DO_NOT_USE_registerFactory(factory);
  }
  public resolve<T>(resolver: Injectable<T>) {
    this.activate();
    return resolver.resolve();
  }
  public resolveFunc<T>(func: () => T) {
    this.activate();
    return func();
  }
}

export class Injectable<T> {
  private containers = new Map<number, () => T>();
  DO_NOT_USE_registerFactory(getter: () => T) {
    this.containers.set(currentContainerId, getter);
  }
  DO_NOT_USE_registerInstance(instance: T) {
    this.containers.set(currentContainerId, () => instance);
  }
  resolve(): T {
    const getter = this.containers.get(currentContainerId);
    if (!getter) throw "resolver must be registered!";
    return getter();
  }
  get r() {
    return this.resolve();
  }
}
