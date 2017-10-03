# Reducers

Our Manager is looking pretty good:

```javascript
@Manage('gold')
@Value(8000)
@Actions('earn', 'spend')
class GoldManager {}
```

But now that we've got action creation set up, we need to define reducers that respond to our dispatched actions and update the store's state. We've already got a reducer in the form of our Conflux:

```javascript
const goldReducer = getConflux(GoldManager)
```

But all this reducer knows how to do is initialize the default state of our Manager (`8000`). It won't actually handle any actions or return any new state after it's been initialized.

To accomplish this, we need to give it some sub-reducers. Confluxes are delegators. They use reducer composition to hand a given action off to all the sub-reducers who subscribe to that action type.

In Fluxuate, a sub-reducer is defined using the `@Reduce()` decorator:

```javascript
import { Actions, Manage, Reduce, Value, getConflux } from 'fluxuate'

@Manage('gold')
@Value(8000)
@Actions('earn', 'spend')
class GoldManager {
	
	@Reduce('earn')
	reduceEarn(state, payload) {
		return state + payload
	}
	
	@Reduce('spend')
	reduceSpend(state, payload) {
		return state - payload
	}
}

export default getConflux(GoldManager)
```

To create a sub-reducer, just decorate a Manager method with `@Reduce()`. As with most of Fluxuate's method decorators, `@Reduce()` takes one or more action paths as arguments. Here we've defined two sub-reducers that reduce the `gold/earn` and `gold/spend` actions, respectively.

### Notes

- The `state` variable that gets passed into a Fluxuate reducer will be bound to the context of its Manager. So the sub-reducers of our `gold` Manager will receive a number.

- Don't get reducers and sub-reducers confused! This can be especially difficult since sub-reducers are reducers by every technicality. This distinction will become important when we look at using Higher-Order Reducers to enhance our Confluxes.

### Next Step

Let's look at [Paths](/docs/tutorial/Paths.md).
