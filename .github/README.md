# injecd

Dependency Injection made simple.

By leveraging default parameters, injecd minimizes the usual boilerplate present in TypeScript injection, while retaining type checking and automatic code complition!

[See injecd on npm](https://www.npmjs.com/package/injecd)

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

# In-depth usage examples

### functions

Let's say you want to be able to mock randomness in your function for coin throw bets

```
// random.ts
export function getRealRandom() {
    return Math.Random();
}

// getRealRandom passed as parameter for TS type inferring
const rng$ = injecd(getRealRandom);
```

```
// bets.ts
function checkGuessFactory(getRandom = rng$.r){
    return function checkGuess(guess: number){
        return guess === Math.floor(getRandom() * 6);
    }
}
```

```
// main.ts
const container = spawnContainer();
container.registerInstance(rng$, getRealRandom)

const checkGuess = containre.resolveFactory(checkGuessFactory)
```

```
// main.test.ts
const mockGetRandom = () => .1;
const checkGuess = checkGuessFactory(mockGetRandom);
expect(checkGuess(4)).toBeFalse();
```

### classes

Let's say you have a singleton service and want to inject it into some class

Create a tag for the type:

```
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

```
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

```
// main.ts
import { spawnContainer } from 'injecd';
import { SomeService$, singletonService } from './SomeService';
import { SomeClass$, SomeClass } from './SomeClass';

// create a container with a singleton service registered
const container = spawnContainer();
container.registerInstance(SomeService$, singletonService);

// register factory for SomeClass and resolve it later
container.registerFactory(SomeClass$, () => new SomeClass());
container.resolve(SomeClass$);

// or resolve directly without registering
container.resolveFactory(() => new SomeClass());
```

`SomeClass()` constructor has a default parameter SomeService, so it can be instantiated as parameterless but only within a container.

### alternatively the tag can be part of the class, like so:

```
class Child {
    static tag = injecd<Child>();
    constructor(public id: number) {}
}
container.registerInstance(Child.tag, new Child(1));

class Parent {
    childId: number;
    constructor(child = Child.tag.r) {
    this.childId = child.id;
    }
}
const resolvedB = container.resolveFactory(() => new Parent());

expect(resolvedB.childId).toBe(1);
```
