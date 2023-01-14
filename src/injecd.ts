let idCounter = 1;
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
    this.id = idCounter++;
  }
  public registerInstance<T>(resolver: Injectable<T>, instance: T) {
    this.scope(() => resolver.internals.registerInstance(instance));
  }
  public registerFactory<T>(resolver: Injectable<T>, factory: () => T) {
    this.scope(() => resolver.internals.registerFactory(factory));
  }
  public resolve<T>(resolver: Injectable<T>) {
    return this.scope(() => resolver.internals.resolveHard());
  }
  public resolveFunc<T>(func: () => T) {
    return this.scope(() => func());
  }
}

class Injectable<T> {
  public internals = new InjectableInternals<T>();
  get r() {
    return this.internals.resolveHard();
  }
  get option() {
    return this.internals.resolveSoft();
  }
  or(defaultValue: T): T {
    return this.internals.resolveSoft() || defaultValue;
  }
}

class InjectableInternals<T> {
  private containers = new Map<number, () => T>();
  private getFactory(): (() => T) | undefined {
    return this.containers.get(getContainer());
  }
  private setFactory(getter: () => T) {
    this.containers.set(getContainer(), getter);
  }
  registerFactory(getter: () => T) {
    this.setFactory(getter);
  }
  registerInstance(instance: T) {
    this.setFactory(() => instance);
  }
  resolveHard(): T {
    const get = this.getFactory();
    if (!get) throw "tried to resolve an unregistered injectable";
    return get();
  }
  resolveSoft(): T | undefined {
    const get = this.getFactory();
    if (!get) return undefined;
    return get();
  }
}

export const spawnContainer = () => new Container();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const injecd = <T>(dummy?: T) => new Injectable<T>();
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const injecdByReturn = <T extends () => unknown>(dummyFactory?: T) =>
  new Injectable<ReturnType<T>>();
