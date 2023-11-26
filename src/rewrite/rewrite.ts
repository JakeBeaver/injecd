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

export class InjecdContainer {
  private container = new Map<any, any>();

  register<T>(tag: InjecdTag<T>, getInstance: () => T) {
    this.container.set(tag, getInstance);
  }
  
  resolve<T>(tag: InjecdTag<T>) {
    try {
      currentContainer = this.container;
      return tag.r;
    } finally {
      currentContainer = null;
    }
  }
}


// // eslint-disable-next-line @typescript-eslint/no-unused-vars
// export const injecdReturn = <T extends () => unknown>(_dummyFactory?: T) => {
//     return new InjecdTag<ReturnType<T>>() as InjecdTag<ReturnType<T>>;
// };

// export class InjecdContainer {
//   private container = new Map<any, any>();

//   registerFactory<T>(tag: InjecdTag<T>, getInstance: () => T) {
//     this.container.set(tag, getInstance);
//   }
//   registerFactorySingleton<T>(tag: InjecdTag<T>, factory: () => T) {
//     let i: T | undefined;
//     return this.registerFactory(tag, () => {
//       if (!i) i = factory();
//       return i;
//     });
//   }
//   registerInstance<T>(tag: InjecdTag<T>, instance: T) {
//     this.registerFactorySingleton(tag, () => instance);
//   }
//   registerClass<T>(tag: InjecdTag<T>, constructor: new () => T) {
//     return this.registerFactory(tag, () => new constructor());
//   }
//   registerClassSingleton<T>(tag: InjecdTag<T>, constructor: new () => T) {
//     return this.registerFactorySingleton(tag, () => new constructor());
//   }

//   resolveFactory<T>(factory: () => T) {
//     try {
//       currentContainer = this.container;
//       return factory();
//     } finally {
//       currentContainer = null;
//     }
//   }
//   resolve<T>(tag: InjecdTag<T>) {
//     return this.resolveFactory(() => tag.r);
//   }
// }
