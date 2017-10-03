# The Conflux

Here's our gold Manager so far:

```javascript
@Manage('gold')
@Value(8000)
class GoldManager {}
```

Every Fluxuate Manager has a Conflux. You can think of a Manager as a Conflux manifest; it tells Fluxuate how to create the underlying Conflux.

The Conflux is what the rest of our application will actually use.

Let's get our Conflux:

```javascript
import { Manage, Value, getConflux } from 'fluxuate'

@Manage('gold')
@Value(8000)
class GoldManager {}

export default getConflux(GoldManager)
```

### Retrieving the Conflux

There are two ways to get a Manager's Conflux.

**Method 1**: Pass the Manager itself to `getConflux()`. This is by far the preferred method.

```javascript
const gold = getConflux(GoldManager)
```

**Method 2**: Pass the Manager's namespace to `getConflux()`. Using this method, you still have to ensure that the Manager is defined before using it. Plus you're using a string, so you might want to introduce a constant (blekh).

```javascript
const gold = getConflux('gold')
```

### Some Details

A Conflux is just a normal Redux reducer. It's a pure function that takes the current state and the next action as input. It will ensure that that state defaults to the default value specified by the Manager.

A Conflux is designed to reduce just the portion of state controlled by its Manager. So when using a Conflux deep in the reducer hierarchy, you just need to ensure that it gets passed its appropriate portion of state. Of course, you don't have to worry about this if you let Fluxuate handle the entire state tree.

Since a Conflux is just a Redux reducer, it can be used anywhere you'd use a reducer, including as the root reducer for your store.

### Next Step

We'll look at some examples of using our Conflux as we explore methods of [store creation](/docs/tutorial/StoreCreation.md).
