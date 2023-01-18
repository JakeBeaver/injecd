import { InjecdTag } from "./injecd-tag";
import { LockedInjecdContainer } from "./locked-injecd-container";

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
