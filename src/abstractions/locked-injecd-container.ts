import { InjecdTag } from "./injecd-tag";

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
