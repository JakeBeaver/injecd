import { InjecdTag } from "../abstractions/injecd-tag";
import { Container } from "./container";
import { error, currentContainer } from "./utils";

export class Tag<T> implements InjecdTag<T> {
  private getters = new Map<Container, () => T>();
  get r() {
    const get = this.getters.get(currentContainer.get());
    return get?.() || error<T>("tried to resolve an unregistered injectable");
  }
  register(get: () => T) {
    this.getters.set(currentContainer.get(), get);
  }
}
