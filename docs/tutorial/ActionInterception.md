# Action Interception

What if our character tries to spend more gold than he has? We'll need to intercept the `gold/spend` action before it gets dispatched to the store and cancel it if the character has insufficient gold. Fluxuate provides Before and After action hooks via the `@Before()` and `@After()` method decorators. Let's use `@Before()` here:

```javascript
@Before('spend')
hasSufficientGold(action, proceed, reject) {
	this.state - action.payload >= 0
		? proceed()
		: reject(`You don't have enough gold to do that!`)
}
```

Alright, a bunch of new stuff here. Let's break it down.

### Interceptor Params

The first parameter of all Before and After interceptors is the `action` object.

Since Before interceptors also have the ability to cancel an action, they get two functions called `proceed` and `reject` as their second and third arguments. All Before interceptors for a given action must call `proceed()` in order for the action to be dispatched normally.

```javascript
@Before('spend')
hasSufficientGold(action, proceed) {
	proceed()
}

@Before('spend')
hasSufficientInventory(action, proceed) {
	// proceed not called! the action will be canceled, even though they have sufficient gold
}
```

### Context

All Manager methods, including interceptors, are bound to their Conflux (not their Manager!). This means we always have access to `this.action`, `this.select` and `this.state`. It also means that we can't do `this.hasSufficientInventory()` and the like. If you find `this` confusing (yeah, that's a pun), don't use it! It's purely opt-in.

### Errors

Calling `reject()` will actually force the action to proceed, regardless of what any other interceptors might say (in fact, any not-yet-called interceptors will not be called). But it will set the action's payload to the first argument passed to `reject()` and set `action.error` to `true`.

Normal Fluxuate sub-reducers don't handle error actions. Since this is what we want in the case of our `GoldManager`, we don't have to do anything. But if we did want our state to change, we'd have to use the `@ReduceError()` decorator:

```javascript
@ReduceError('spend')
reduceFailedPurchase(state, payload) {
	return somethingCool
}
```

This can actually be extremely useful. Say we have an `alerts` Manager that pops up a message whenever something goes wrong:

```javascript
@Manage('alerts')
@Value([])
class AlertsManager {
	
	@ReduceError('/*') // Remember the global path?
	reduceAllErrors(state, text) {
		let newAlert = { text, type: 'danger' }
		return [ ...state, newAlert ]
	}
}
```

### Notes

- `proceed()` can only be called once. Subsequent attempts to proceed will have no effect.

- Don't ever dispatch actions inside a reducer or action creator (e.g. using `this.action.doSomething()`). Keep them pure!

### Next Step

Our `gold` Manager is done (for now)! As we move on to the `weapons` Manager, we'll need to look at how Confluxes interact. Let's learn about [Conflux Injection](/docs/tutorial/ConfluxInjection.md).
