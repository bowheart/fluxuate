# Quick Start

### Installation

```
npm install --save fluxuate
```

### Basic Concepts

Apart from all the concepts of Redux itself, the core concepts of Fluxuate are the Manager and the Conflux.

##### Manager

- Controls a portion of the app's state.
- Defines how its state can be changed and viewed.
- A very high-level abstraction. Never used directly.
- Has a 1:1 mapping to a Conflux.
- You can think of a Manager as a Conflux Manifest. A Manager tells Fluxuate how to create its Conflux.

##### Conflux

- A Redux reducer.
- Designed to reduce just the portion of state controlled by its Manager.
- Is used directly to dispatch actions and get the current value of the Manager's state slice and derivations thereof.
- Does *not* have a 1:1 mapping to a Manager. Fluxuate will dynamically fill in all the un-managed gaps in the state tree with bare Confluxes. There's also:
- The Root Conflux
  - Does not belong to any one Manager. It's created automatically based on...everything.
  - Controls the root store object.
  - Delegates state reduction to the appropriate Confluxes for any given action.
  - Is similar to using `combineReducers()` to create a root reducer in Redux.

### A Small Example

```javascript
import { Actions, Manage, Reduce, getConflux } from 'fluxuate'
import { createStore } from 'redux'

@Manage('store')
@Actions('addTodo')
class StoreManager {
	todos = []
	
	@Reduce('addTodo')
	reduceAddTodo(state, text) {
		let newTodo = { text, completed: false }
		return { ...state, todos: [ ...state.todos, newTodo ] }
	}
}

const storeConflux = getConflux(StoreManager)
const store = createStore(storeConflux)

store.dispatch({
    type: 'store/addTodo',
    payload: 'win all the things'
})
```

This example shows how Fluxuate and Redux can live in harmony. Fluxuate isn't meant to replace any part of Redux. Its purpose is to provide a suite of opt-in, high-level abstractions on top of Redux. Fluxuate never locks you in to doing things the "Fluxuate way". Bumping down to raw Redux or using another library for a certain task are painless.

Now forget what you have learned. Let's do things the Fluxuate way:

### A Smaller Example

```javascript
import { Actions, Manage, Reduce, Value, getConflux, handleStoreCreation } from 'fluxuate'

@Manage('todos') // this Manager will control the "todos" property of the store
@Value([]) // set the default value controlled by this Manager
@Actions('add') // bound action creator for the "todos/add" action
class TodosManager {
	
	@Reduce('add') // reduce only the "todos/add" action
	reduceAdd(state, text) { // "state" will be the current value of this Manager's state
		let newTodo = { text, completed: false }
		return [ ...state, newTodo ]
	}
}

const store = handleStoreCreation() // opt-in store creation shorthand
const todos = getConflux(TodosManager) // get the Conflux to interface with our Manager

todos.action.add('be a boss') // dispatch an action or three
todos.state // [ { text: 'be a boss', completed: false } ]
```

A Fluxuate Manager is just a decorated ES6 class.

- `@Manage()` tells Fluxuate which portion of state our Manager controls.

- `@Value()` tells Fluxuate the default initial value of our Manager's state.

- `@Actions()` gives our Manager's Conflux some action creators.

- `@Reduce()` creates a sub-reducer that our Manager's Conflux will defer to when it receives an action of the specified type.

- `handleStoreCreation()` is an optional shorthand that tells Fluxuate to create the Redux store for us using the information it's collected so far.

- `getConflux()` retrieves our Manager's Conflux.

- `Conflux.action` retrieves a simple object containing all the bound action creators specified by the Conflux's Manager.

- `Conflux.state` is a dynamic property that retrieves the current value of the piece of state controlled by the Conflux's Manager.

Note that we didn't use class fields in this example. Instead, we used the special `@Value()` decorator. Class fields are great when we want our Manager's value to be an object with known fields. But when those fields are dynamic, or we want to use a different data structure (or use a primitive), we need to use `@Value()`.

### That's Where It's @

The beauty of Fluxuate lies in its decorators. Any method on a Fluxuate Manager can be re-purposed indefinitely by decorating it more. A reducer, for example, is not limited to reducing only one type of action. This helps Fluxuate stay as thoroughly dynamic as Redux itself, while providing a more declarative, user-friendly syntax.

```javascript
@Manage('gold')
@Value(500)
@Actions('earn', 'spend')
class GoldManager {
	
	@Reduce('spend') // reduces the "gold/spend" action
	@Reduce('/potions/buy') // also reduces the "potions/buy" action
	reduceSpend(state, payload) {
		return state - payload
	}
}
```

### Paths

Fluxuate tries to emphasize the "tree" aspect of the state tree. Nodes in the tree are delineated by using paths. For example, given the following state tree:

```javascript
{
    todos: {
        urgent: []
    }
}
```

a Manager for the `todos.urgent` piece of state would be created like so:

```javascript
@Manage('todos/urgent')
@Value([])
class UrgentTodosManager {}
```

Fluxuate also encourages all actions to be structured around the state tree. Thus paths can be used to denote the actions to which a Manager method subscribes.

- Most method decorators take one or more paths as arguments.
- Paths are relative by default (relative to their Manager's namespace).
- Prefixing a path with a slash (`/`) makes it absolute.
- The special paths `*` and `/*` match all local and global actions, respectively.

```javascript
@Manage('gold')
@Value(500)
@Actions('earn', 'spend')
class GoldManager {
	
	@Reduce('*') // reduces "gold/earn", "gold/spend", and "gold/really/anything"
	reduceLocalAction(state, payload) { ... }
	
	@Reduce('/*') // reduces literally everything
	reduceGlobalAction(state, payload) { ... }
	
	@Reduce('earn') // equivalent to "/gold/earn"
	@Reduce('spend', '/potions/buy') // a decorator can define multiple paths
	reduceChange(state, payload) { ... }
}
```

Namespacing action types around the state tree makes them easier to remember and reason about. While this is awesome, it's still opt-in.

```javascript
// Let's use a normal constant...
export const ADD_TODO = 'ADD_TODO'

// ...a total non-Fluxuate action creator...
export function addTodo(text) {
	return { type: ADD_TODO, text }
}

// ... and a little Fluxuate
@Manage('todos')
@Value([])
class TodosManager {
	
	@Reduce(`/${ADD_TODO}`)
	reduceAddTodo(state, payload) { ... }
}
```

### The State Tree

Fluxuate will dynamically create the reducer hierarchy:

```javascript
@Manage('food/pizza')
class PizzaManager {}

const food = getConflux('food')

food.state // {pizza: {}}
```

If this is the only Manager we define, Fluxuate will ensure that our state tree looks like this:

```javascript
{
	food: {
		pizza: {}
	}
}
```

In this example, if no `food` Manager had been defined, a Conflux will be created for it dynamically. If a `food` Manager is defined later, its Conflux will be swapped in for the dynamically created one:

```javascript
@Manage('food')
class FoodManager {
	iceCream = {}
}

const food = getConflux(FoodManager)

food.state // {pizza: {}, iceCream: {}}
```

> Note: In most cases, it is not recommended to nest Managers. In this example, the parent and child will now be competing for the same piece of state (`state.food.pizza`). Not to mention that the `pizza` object is defined implicitly, as far as the `food` Manager is concerned. Rather, every leaf node in the state tree should get a Manager ("leaf node" being very loosely defined here).

This example also illustrates one of Fluxuate's greatest strengths: Code splitting. Fluxuate doesn't care whether Managers are defined before or after the store is created. It'll dynamically create the reducer hierarchy no matter what. If the store has been created, the state will be re-calculated when a new Manager is defined.

### Interception

Actions can be intercepted before and after they're sent through the store's reducers. Interceptors perform requests, logs, and just side-effects in general. Before interceptors can also cancel or alter the actions they intercept. As with everything, these are purely opt-in.

```javascript
@Manage('gold')
@Value(500)
@Actions('spend')
class GoldManager {
	
	@Before('spend')
	hasSufficientGold(action, proceed) {
		if (this.state - action.payload >= 0) {
			proceed() // only send the action if they have money for it
		}
	}
	
	@Reduce('spend')
	reduceSpend(state, payload) {
		return state - payload
	}
	
	@After('spend')
	logExpenditure(action) {
		console.log(`Spent ${action.payload} gold. Gold remaining: ${this.state}`)
	}
}
```

### Notes

Fluxuate subscribes to the single-store-first philosophy. There are lots (and I mean lots) of Redux concepts that are drastically simplified when the whole app is able to assume that there is only one Redux store. Since having a single store is a Redux best practice, the vast majority of apps can make this assumption. Fluxuate is heavily tailored toward this assumption but, like everything in Fluxuate, there are plenty of escape hatches. Using them will simply make your app more verbose. You can use them if you want, but it usually isn't necessary. See [this Redux recipe](http://redux.js.org/docs/recipes/IsolatingSubapps.html) for more info.
