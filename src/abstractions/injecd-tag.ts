export interface InjecdTag<T> {
  /**
   * Resolution point for this injecd tag.\
   * Throws error if no entity registered for this tag in the container
   */
  r: T;
}
