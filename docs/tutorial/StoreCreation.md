# Store Creation

Here's our file that declares a `gold` Manager and exports its Conflux:

```javascript
// gold.js
import { Manage, Value, getConflux } from 'fluxuate'

@Manage('gold')
@Value(8000)
class GoldManager {}

export default getConflux(GoldManager)
```

Let's use it.

### Simple Store

```javascript
// store.js
import { createStore } from 'redux'
import gold from './gold'

const store = createStore(gold)

console.log(store.getState()) // 8000
```

This will work because the gold Conflux is just a Redux reducer. But it doesn't really give us anything we didn't already have. To enable coolness, we'll need to create and apply the Fluxuate middleware to the store:

```javascript
// store.js
import { applyMiddleware, createStore } from 'redux'
import { createFluxuateMiddleware } from 'fluxuate'
import gold from './gold'

const fluxuateMiddleware = createFluxuateMiddleware()
const store = createStore(gold, applyMiddleware(fluxuateMiddleware))

console.log(store.getState()) // 8000
console.log(gold.state) // 8000
```

### `Conflux.state`

Ah-hah! So I lied. The Conflux isn't **just** a normal Redux reducer. It has a couple dynamic properties that beef it up a little.

`Conflux.state` is a dynamic property (a getter) that retrieves the current value of the Conflux's Manager's state slice. Since a Manager knows what portion of state it controls, it can find the value of its state slice for us.

```javascript
// This means that
superNestedConflux.state

// is a shorthand for
store.getState().path.to.super.nested.value
```

All Confluxes have `state`, `action`, and `select` as dynamic properties. We'll learn about `action` and `select` later.

### K... but the store's state is wrong

Since we used the gold Conflux as the store's root reducer, the store's shape will match the value controlled by the gold Manager. In this case, it'll be a number. But we want it to be an object like:

```javascript
{
	gold: 8000
}
```

To fix this, we could use `Redux.combineReducers()` (or roll our own version of it):

```javascript
// store.js
import { applyMiddleware, combineReducers, createStore } from 'redux'
import { createFluxuateMiddleware } from 'fluxuate'
import gold from './gold'

const rootReducer = combineReducers({ gold })

const fluxuateMiddleware = createFluxuateMiddleware()
const store = createStore(rootReducer, applyMiddleware(fluxuateMiddleware))
```

So that's cool, but it just so happens that Fluxuate does this work for us.

### The Root Conflux

This is a special Conflux that Fluxuate creates for us. The Root Conflux does not have a Manager. Its job is to control the entire store. Basically, it is meant to be used as our store's root reducer (though, of course, we can use it anywhere we want). Fluxuate will constantly modify the Root Conflux's behavior as new Managers are declared.

So how do we get it?

```javascript
import { getConflux } from 'fluxuate'

const rootConflux = getConflux()
```

Yep, calling `getConflux()` with no arguments returns the Root Conflux. Let's plug it in:

```javascript
// store.js
import { applyMiddleware, createStore } from 'redux'
import { createFluxuateMiddleware, getConflux } from 'fluxuate'
import gold from './gold'

const rootConflux = getConflux()

const fluxuateMiddleware = createFluxuateMiddleware()

const store = createStore(rootConflux, applyMiddleware(fluxuateMiddleware))

console.log(store.getState()) // { gold: 8000 }
console.log(gold.state) // 8000
```

Sweet.

### Kill Boilerplate

So there are still a lot of moving parts here. Middleware creation/application, Confluxes, and whatnot. While it's all necessary, we really shouldn't have to worry about it in most cases. To this end, Fluxuate provides a handy little tool called `handleStoreCreation()`.

```javascript
// store.js
import { handleStoreCreation } from 'fluxuate'
import gold from './gold'

const store = handleStoreCreation()

console.log(store.getState()) // { gold: 8000 }
console.log(gold.state) // 8000
```

### Notes

- `Conflux.state` is just one of many features that are made available when we add the Fluxuate middleware to our store enhancer. As such, it is best practice to always add the Fluxuate middleware. Of course, we don't have to worry about it if we let Fluxuate handle the store creation.

- `handleStoreCreation()` is actually almost as flexible as `Redux.createStore()` itself. For full details, see the [API](/docs/api/handleStoreCreation.md).

### Next Step

Let's add some [Actions](/docs/tutorial/Actions.md).
