import { InjecdContainer } from "../abstractions/injecd-container";
import { InjecdTag } from "../abstractions/injecd-tag";
import { Tag } from "./tag";
import { currentContainer } from "./utils";

export class Container implements InjecdContainer {
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
      currentContainer.set(this);
      return action();
    } finally {
      currentContainer.set(null);
    }
  }
}
