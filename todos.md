# Items to implement

- Path-to-regex style matches.

```javascript
@Reduce('create/(success|failure)')
```

- Relative paths

```javascript
@Reduce('../shop/buy')
reduceShopBuy(state, action) {
	return {...state, cash: state.cash - action.cost}
}
```

- Immutability. Allow integration with Immutable or really anything. This'll require some way to override the default Conflux creation behavior (the part of Fluxuate that mimics `combineReducers()`).

- Multiple stores. Fluxuate subscribes to the "single-store first" philosophy. So auto-store-modification-when-manager-is-defined should stay. But we could allow new root Confluxes to be manually compiled. A Manager could then be added to multiple stores:

```javascript
@Manage('breakfast/cereal')
class CerealManager {}

@Manage('lunch/pizza')
class LunchPizzaManager {}

@Manage('dinner/pizza')
class DinnerPizzaManager {}

const rootConflux = getConflux()
const mealStore = createStore(rootConflux)

const pizzaMealsConflux = compileConflux(LunchPizzaManager, DinnerPizzaManager)
const pizzaMealsStore = createStore(pizzaMealsConflux)

const pizzaReducer = combineReducers({
	lunch: getConflux(DinnerPizzaManager),
	dinner: getConflux(LunchPizzaManager)
})
const pizzaStore = createStore(pizzaReducer)
```

or maybe a `createStoreContract()` function:

```javascript
const customConflux = createStoreContract({
	lunch: {
		pizza: null
	},
	dinner: {
		pizza: null
	}
})
```

That way the Managers can still be loaded dynamically. If a loaded Manager's path matches a path in `customStore`'s contract, that Manager's Conflux will also be added to the `customStore`'s root Conflux. (But then how would the custom store's `replaceReducer()` be called?). Other option:

```javascript
const customConflux = createConflux([
	LunchPizzaManager, // loaded up-front
	'dinner/pizza' // dynamically loaded later
])
const customStore = handleStoreCreation(customConflux)

getConflux(LunchPizzaManager).getState(customStore)
```

- Memoize selectors.

```javascript
// not memoized:
@Select('subtotal')
selectSubtotal() {
	return this.state.reduce((state, next) => state + next, 0)
}

// memoized:
@Select('subtotal')
selectSubtotal(memoize) {
	return memoize(this.state)(
		items => items.reduce((state, next) => state + next)
	)
}

@Select('tax')
@Use('/shop/taxPercent')
selectTax(taxPercent, memoize) {
	return memoize(this.select.subtotal(), taxPercent.state)(
		(subtotal, taxPercentState) => subtotal * (taxPercentState / 100)
	)
}

@Select('total')
selectTotal(memoize) {
	return this.select.subtotal() + this.select.tax() // we could memoize this, but it would probably be less efficient than just using the '+' operator every time.
}




// to create a selector factory:
@Select('byId')
@Use('/some/dependency')
selectById(dependency, memoize, todoId) {
	return () => memoize(this.state, dependency.state)(
		(todos, depState) => todos[todoId]
	)
}
```


### Decorators to create:

- `@TimeTravel()` class decorator. This'll modify the state controlled by the Manager to be an object like `{past: [], present: ..., future: []}`. The `state` property of the Manager's Conflux will then refer to the `present` value.
- `@ProcessedActions()` and `@ProcessedAction()` - Adds '<action>/start', '<action>/end' action creators
- `@UnboundActions()` and `@UnboundAction()`
- `@Extend(managerNamespace, extensionRole)`
- `@Enhance(enhancer)` class decorator. This supplies a Higher-Order Reducer that'll wrap the Manager's Conflux.
