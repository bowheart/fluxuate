# Selectors

Selectors are a common utility for computing derived state. Every good app should store the absolute minimum amount of data possible and use selectors to compute the rest of the data needed by the app.

While excellent third-party Redux selection libraries exist (such as [Reselect](https://github.com/reactjs/reselect)), and they are completely compatible with Fluxuate, the concept is so essential to a good application that it deserved a front seat in Fluxuate's ecosystem.

Recall our `entities/weapons` Manager:

```javascript
@Manage('entities/weapons')
class WeaponsDbManager {
	dagger = { cost: 500 }
	crossbow = { cost: 2600 }
}
```

A simple selector that computes the combined cost of all weapons would look like the following:

```javascript
import { Select } from 'fluxuate'

...
	
	@Select('totalCost')
	selectTotalCost() {
		return Object.keys(this.state)
			.map(weaponName => this.state[weaponName])
			.reduce((state, { cost }) => state + cost, 0)
	}
	
...
```

Looping over all entities in a collection can be an expensive task. To prevent this from running on every state update, selectors can be memoized. A memoized selector will only recalculate its value when the value of one of its dependencies changes.

Let's memoize our example selector:

```javascript
@Select('totalCost')
selectTotalCost(memoize) {
	return memoize(this.state)(
		weaponsState => Object.keys(weaponsState)
			.map(weaponName => weaponsState[weaponName])
			.reduce((state, { cost }) => state + cost, 0)
	)
}
```

The first argument of all selectors is a function called `memoize`. We call `memoize()` with the values we want to capture. `memoize()` returns another function that accepts the selector's `calculator` function as its only argument:

```javascript
memoize(val1, val2)(calculator)
```

The calculator function will receive the values passed to `memoize()` as arguments.

### Selector Factories

Suppose we want to add a `minCost` filter to our `totalCost` selector.

```javascript
@Select('totalCost')
selectTotalCost(memoize, minCost = 0) {
	return memoize(this.state, minCost)(
		(weaponsState, minCost) => Object.keys(weaponsState)
			.map(weaponName => weaponsState[weaponName])
			.filter(weaponData => weaponData.cost > minCost)
			.reduce((state, { cost }) => state + cost, 0)
	)
}
```

Now if we use our selector multiple times, we'll lose the power of memoization:

```javascript
weaponsDb.select.totalCost(200)
weaponsDb.select.totalCost(1000) // forces a recalculation
weaponsDb.select.totalCost(200) // oops! Also forces a recalculation
```

Sometimes we want to use a memoized selector for several different values at once. Since a selector recalculates its value every time one of its inputs changes, the successive calls to the selector will force a recalculation. To accomplish this, we can use a selector factory.

Any selector that returns a function becomes a selector factory. Every time a selector factory is called, it essentially creates a new selector.

```javascript
@Select('totalCost')
selectTotalCost(memoize, minCost = 0) {
	return () => memoize(this.state, minCost)(
		weaponsState => Object.keys(weaponsState)
			.map(weaponName => weaponsState[weaponName])
			.filter(weaponData => weaponData.cost > minCost)
			.reduce((state, { cost }) => state + cost, 0)
	)
}
```

Now we can use it:

```javascript
let lowCostSelector = weaponsDb.select.totalCost(200)
let highCostSelector = weaponsDb.select.totalCost(1000)

lowCostSelector()
highCostSelector()
lowCostSelector()
```

### Let's Use This Thing

To find the cost of a weapon, we've been using the following code:

```javascript
let weaponData = weaponsDb.state[weaponName]
let weaponCost = weaponData && weaponData.cost
```

Let's create a selector on the `entities/weapons` Manager that does this for us:

```javascript
import { Manage, Select } from 'fluxuate'

@Manage('entities/weapons')
class WeaponsDbManager {
	dagger = { cost: 500 }
	crossbow = { cost: 2600 }
	
	@Select('cost')
	selectCost(memoize, weaponName) {
		let weaponData = this.state[weaponName]
		return weaponData && weaponData.cost
	}
}
```

To make our app more declarative, let's create another selector that just grabs a weapon's data:

```javascript
@Manage('entities/weapons')
class WeaponsDbManager {
	dagger = { cost: 500 }
	crossbow = { cost: 2600 }
	
	@Select('byName')
	selectByName(memoize, weaponName) {
		return this.state[weaponName] || {}
	}
	
	@Select('cost')
	selectCost(memoize, weaponName) {
		return this.select.byName(weaponName).cost || 0
	}
}
```

### `Conflux.select`

This is another property that all Confluxes have. `Conflux.select` retrieves an object containing all the selectors declared in that Conflux's Manager.

Let's use our new selectors:

```javascript
// gold.js
import weaponsDb from './entities/weapons'
	
...
	
	@Reduce('/weapons/buy')
	reduceWeaponsBuy(state, weaponName) {
		return state - weaponsDb.select.cost(weaponName)
	}
	
	@Reduce('/weapons/sell')
	reduceWeaponsSell(state, weaponName) {
		return state + weaponsDb.select.cost(weaponName)
	}
	
...
```

```javascript
// weapons.js
import weaponsDb from './entities/weapons'
import gold from './gold'

...
	
	@Before('buy')
	hasSufficientGold({ payload:weaponName }, proceed, reject) {
		return gold.state - weaponsDb.select.cost(weaponName) >= 0
			? proceed()
			: reject(`You don't have enough gold to buy that weapon!`)
	}
	
...
```

### `hasSufficientGold()`

We have one more optimization we can make with selectors. We have two methods that perform the `hasSufficientGold` calculation. Let's offload this to a selector on the `gold` Manager:

```javascript
@Select('hasSufficientGold')
selectHasSufficientGold(memoize, costOfItem) {
	return this.state - costOfItem >= 0
}
```

And use it:

```javascript
// gold.js
...
	
	@Before('spend')
	hasSufficientGold(action, proceed, reject) {
		this.select.hasSufficientGold(action.payload)
			? proceed()
			: reject(`You don't have enough gold to do that!`)
	}
	
...
```

```javascript
// weapons.js
import weaponsDb from './entities/weapons'
import gold from './gold'

...
	
	@Before('buy')
	hasSufficientGold({ payload:weaponName }, proceed, reject) {
		return gold.select.hasSufficientGold(weaponsDb.select.cost(weaponName))
			? proceed()
			: reject(`You don't have enough gold to buy that weapon!`)
	}
	
...
```

### Notes

- Since memoization adds some overhead, only memoize selectors when you're sure that it might give some performance benefit. A good rule of thumb is to only memoize selectors whose algorithms are worse than O(1).

### Next Step

[The Modular Manager](/docs/tutorial/TheModularManager.md)
