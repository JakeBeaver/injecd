# injecd

Dependency Injection made simple.

By leveraging default parameters, injecd minimizes the usual boilerplate present in TypeScript injection, while retaining type checking and automatic code completion!

[See injecd on npm](https://www.npmjs.com/package/injecd)

## installation

```
npm install injecd
```

## importing

```ts
import { injecd, spawnContainer } from "injecd";
```

# Usage

### 1. Tag

```ts
const greeting$ = injecd<string>();
const class$ = injecd<A>();
```

### 2. Mark

```ts
class A {
  constructor(public greeting = greeting$.r) {}
}
```

### 3. Spawn

```ts
const container = spawnContainer();
```

### 4. Register

```ts
container.registerInstance(greeting$, "Hello World!");
container.registerClass(class$, A);
```

### 5. Resolve!

```ts
const instance = container.resolve(class$);

console.log(instance.greeting); // > Hello World!
```

## Tagging with type inferrence shorthands

Instead of `injecd<typeof weird>()`:

```ts
const weird = { weird: "untyped", inferred: "object" };
const weird$ = injecd(weird):
```

Instead of `injecd<ReturnType<typeof weirdFactory>>()`:

```ts
function weirdFactory(){
    return { weird: "untyped", inferred: "object" };
}
const weird$ = injecdReturn(weirdFactory);
```

# In-depth usage examples

### functions

Let's say you want to be able to mock randomness in your function for coin throw bets

```ts
// random.ts
export function getRealRandom() {
    return Math.Random();
}

// getRealRandom passed as parameter for TS type inferring
const rng$ = injecd(getRealRandom);
```

```ts
// bets.ts
function checkGuessFactory(getRandom = rng$.r){
    return function checkGuess(guess: number){
        return guess === Math.floor(getRandom() * 6);
    }
}
```

```ts
// main.ts
const container = spawnContainer();
container.registerInstance(rng$, getRealRandom)

const checkGuess = containre.resolveFactory(checkGuessFactory)
```

```ts
// main.test.ts
const mockGetRandom = () => .1;
const checkGuess = checkGuessFactory(mockGetRandom);
expect(checkGuess(4)).toBeFalse();
```

### classes

Let's say you have a singleton service and want to inject it into some class

Create a tag for the type:

```ts
// SomeService.ts
import { injecd } from 'injecd';

// Create an injecd tag for SomeService
// Classes hoist, so tag can be right above declaration:

export const SomeService$ = injecd<SomeService>();
export class SomeService {
    // ...
}

// simulating a singleton service
export const singletonService = new SomeService();
```

Import the tag and use the 'r' property as the default value

```ts
// SomeClass.ts
import { SomeService$ } from './SomeService';

// same deal
export const SomeClass$ = injecd<SomeClass>();
export class SomeClass {
    // use property 'r' as default value
    constructor(service = SomeService$.r) { }
    // ...
}
```

create container

```ts
// main.ts
import { spawnContainer } from 'injecd';
import { SomeService$, singletonService } from './SomeService';
import { SomeClass$, SomeClass } from './SomeClass';

// create a container with a singleton service registered
const container = spawnContainer();
container.registerInstance(SomeService$, singletonService);

// register SomeClass and resolve it later
container.registerClass(SomeClass$, SomeClass);
container.resolve(SomeClass$);

// or resolve directly without registering
container.resolveFactory(() => new SomeClass());
```

`SomeClass()` constructor has a default parameter SomeService, so it can be instantiated as parameterless but only within a container.

### alternatively the tag can be part of the class, like so:

```ts
    class Child {
      static tag = injecd<Child>();
      constructor(public id: number) {}
    }

    class Parent {
      static tag = injecd<Parent>();
      childId: number;
      constructor(child = Child.tag.r) {
        this.childId = child.id;
      }
    }

    container.registerInstance(Child.tag, new Child(1));
    container.registerClass(Parent.tag, Parent);

    const resolved = container.resolve(Parent.tag);

    expect(resolved.childId).toBe(1);
```
