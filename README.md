# injecd

Dependency Injection made simple.

By leveraging default parameters, injecd minimizes the usual boilerplate present in TypeScript injection, while retaining type checking and automatic code complition!

## installation

```
npm install injecd
```

## importing

```
import { injecd, spawnContainer } from "injecd";
```

# Usage

### 1. Tag

```
const greeting$ = injecd<string>();
const class$ = injecd<A>();
```

### 2. Mark

```
class A {
    constructor(public greeting = greeting$.r) {}
}
```

### 3. Spawn

```
const container = spawnContainer();
```

### 4. Register

```
container.registerInstance(greeting$, "Hello World!");
container.registerFactory(class$, () => new A());
```

### 5. Resolve!

```
const instance = container.resolve(class$);

console.log(instance.greeting); // > Hello World!
```

## Tagging with type inferrence shorthands

Instead of `injecd<typeof weird>()`:

```
const weird = { weird: "untyped", inferred: "object" };
const weird$ = injecd(weird):
```

Instead of `injecd<ReturnType<typeof weirdFactory>>()`:

```
function weirdFactory(){
    return { weird: "untyped", inferred: "object" };
}
const weird$ = injecdReturn(weirdFactory);
```

## More information

For detailed usage examples refer to the [GitHub README](https://github.com/JakeBeaver/injecd#readme)
