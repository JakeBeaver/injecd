import { Container } from "./container";

export const error = <T>(message: string): T => {
  throw new Error(message);
};

let c: Container | null = null;
const msg = "injecd container action outside of container scope";

export const currentContainer = {
  get: (): Container => c || error(msg),
  set: (container: Container | null) => (c = container),
};
