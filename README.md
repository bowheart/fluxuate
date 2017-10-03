# Fluxuate

Beautiful Redux

```javascript
@Manage('todos')
@Value([])
@Actions('create')
class TodosManager {
    
    @Reduce('create')
    reduceCreate(state, text) {
        let newTodo = { text, completed: false }
        return [ ...state, newTodo ]
    }
}

const store = handleStoreCreation()
const todos = getConflux(TodosManager)

todos.action.create('a new todo')
```


### Installation

Install using npm:

```
npm install --save fluxuate
```


or use unpkg:

```
<script src="https://unpkg.com/fluxuate/dist/fluxuate.js"></script>
```


### What Is It?

Fluxuate is a suite of opt-in, high-level abstractions on top of Redux. Fluxuate does not replace Redux in any way. Fluxuate is designed to get out of your way if you ever need to bump down to raw Redux or use another third-party library.

Fluxuate is designed to reduce boilerplate wherever possible. It is designed to be easy to read. It provides a declarative syntax for creating a Redux store and defining its behavior.

Note that Fluxuate is in beta. Expect sudden, breaking changes between minor versions.


### The Basics

In Fluxuate, pieces of the Redux state tree are controlled by Managers.

```javascript
import { Manage } from 'fluxuate'

@Manage('todos')
class TodosManager {}
```


Managers are a very high-level abstraction. They can define default initial state, bound action creators, sub-reducers, action interceptors, and selectors.

```javascript
import { Actions, Manage, Reduce, Select, Value } from 'fluxuate'

@Manage('todos')
@Value([]) // start off with an empty array
@Actions('create', 'delete')
class TodosManager {
    
    @Reduce('create')
    reduceCreate(state, text) {
        let newTodo = { text, completed: false }
        return [ ...state, newTodo ]
    }
    
    @Reduce('delete')
    reduceToggle(state, index) {
        return [
            ...state.slice(0, index),
            ...state.slice(index + 1)
        ]
    }
    
    @Select('incomplete')
    selectIncomplete() {
        return this.state.filter(todo => !todo.completed)
    }
}
```


Managers are not used directly. Fluxuate creates a Conflux for every Manager. A Conflux is just a normal Redux reducer specially designed to reduce just the portion of state controlled by its Manager.

```javascript
import { Actions, Manage, Reduce, Value, getConflux } from 'fluxuate'
import { createStore } from 'redux'

@Manage('todos')
@Value([])
@Actions('create', 'delete')
class TodosManager {
    ...
}

const todosConflux = getConflux(TodosManager)
const store = createStore(todosConflux)

store.getState() // []
store.dispatch({ type: 'todos/create', text: 'be a boss' })

export default todosConflux
```

Fluxuate also exposes a store creation shorthand.

```javascript
import { handleStoreCreation } from 'fluxuate'

const store = handleStoreCreation()

export default store
```


This will create the Redux store with an empty root reducer. We can load up our Manager whenever we want; before or after the store is created. Fluxuate will dynamically inject the Confluxes of newly-declared Managers into the reducer hierarchy. This makes code splitting a breeze!

```javascript
import store from './store/store'

// Let's say that now we need the `todos` Manager.
// Just import it and Fluxuate will inject its conflux into the reducer hierarchy.
// Fluxuate will also force our store to re-calculate the state.
import todos from './store/todos'

store.getState() // { todos: [] }
```


Apart from being normal Redux reducers, Confluxes have a few special properties.

```javascript
import store from './store/store'
import todos from './store/todos' // retrieve our todos conflux

todos.action.create('be a boss')
store.getState() // { todos: [ { text: 'be a boss', completed: false } ] }
todos.state // [ { text: 'be a boss', completed: false } ]
todos.select.incomplete() // [ { text: 'be a boss', completed: false } ]

todos.action.delete(0)
todos.state // []
```


`Conflux.state` is of particular note here. This is just a dynamic property (a getter) that will calculate the piece of state controlled by the Conflux's Manager. In this case, `todos.state` is an exact shorthand for `store.getState().todos`.

Fluxuate will dynamically create the reducer hierarchy.

```javascript
import { Manage, handleStoreCreation } from 'fluxuate'

@Manage('entities/todos/urgent')
class UrgentTodosManager {}

const store = handleStoreCreation()

store.getState() // { entities: { todos: { urgent: {} } } }
```


### To Be Continued...

That's it for the basics. But there's still plenty more to Fluxuate. Check out the [documentation](//bowheart.github.io/fluxuate) for a much more in-depth rundown.


### Bugs, Suggestions, Feedback, Pull Requests, etc...

Fluxuate is brand new! All suggestions and code contributions are super welcome. Let's make it awesome! Bugs can be sumitted to https://github.com/bowheart/fluxuate/issues


### License

The [MIT License](LICENSE)
