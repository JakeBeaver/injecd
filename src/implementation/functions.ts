import { InjecdContainer } from "../abstractions/injecd-container";
import { InjecdTag } from "../abstractions/injecd-tag";
import { Container } from "./container";
import { Tag } from "./tag";

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
