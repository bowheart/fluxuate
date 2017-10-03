# Conflux Injection

Here's our finished `gold` Manager:

```javascript
import { Actions, Action, Before, Manage, Reduce, Value, getConflux } from 'fluxuate'

@Manage('gold')
@Value(8000)
@Actions('earn', 'spend')
class GoldManager {
	
	@Reduce('earn')
	reduceEarn(state, amount) {
		return state + amount
	}
	
	@Before('spend')
	hasSufficientGold(action, proceed, reject) {
		this.state - action.payload >= 0
			? proceed()
			: reject(`You don't have enough gold to do that!`)
	}
	
	@Reduce('spend')
	reduceSpend(state, amount) {
		return state - amount
	}
}

export default getConflux(GoldManager)
```

Recall the state we're trying to build:

```javascript
{
	gold: 8000,
	weapons: [ 'dagger' ],
	entities: {
		weapons: {
			dagger: {
				cost: 500
			},
			crossbow: {
				cost: 2600
			}
		}
	}
}
```

Let's move on to the `weapons` Manager. We already know how to do all this:

```javascript
@Manage('weapons')
@Value([ 'dagger' ])
@Actions('buy', 'sell')
class WeaponsManager {
	
	@Reduce('buy')
	reduceBuy(state, weaponName) {
		return [ ...state, weaponName ]
	}
	
	@Reduce('sell')
	reduceSell(state, weaponName) {
		let index = state.indexOf(weaponName)
		
		if (index === -1) return state // should never happen
		
		return [
			...state.slice(0, index),
			...state.slice(index + 1)
		]
	}
}
```

Nothing too fancy. But you may have noticed a dependency. Two things, really:

1. We don't want to allow our character to buy a weapon if he doesn't have enough gold.
2. We need to update the gold in our character's pouch when he does buy or sell a weapon.
3. We need to know how much a weapon costs.

Let's start with number 3:

### Conflux Injection

Let's build out our `entities/weapons` Manager real quick:

```javascript
@Manage('entities/weapons')
class WeaponsDbManager {
	dagger = { cost: 500 }
	crossbow = { cost: 2600 }
}
```

Assuming the weapons list is static, this is all we need for now. We now have all our Managers! Our default state tree looks exactly how we wanted it.

Now we need to read this information from our `weapons` Manager. To do this, let's use the special `@Use()` decorator:

```javascript
@Before('buy')
@Use('/entities/weapons')
hasSufficientGold(weapons, action, proceed, reject) {
	let weaponData = weapons.state[action.payload]
	let weaponCost = weaponData && weaponData.cost
	
	// TODO: Do they have enough gold?
}
```

`@Use()` is a type of dependency injection. It grabs the Conflux for the specified Manager and injects it into the decorated method. Note that the `weapons` Conflux is the first argument of `hasSufficientGold()`. All injected Confluxes will be added to the beginning of the method's argument list in the order the decorators appear.

To complete this interceptor, we'll also need the `gold` Manager's Conflux:

```javascript
@Before('buy')
@Use('/entities/weapons')
@Use('/gold')
hasSufficientGold(weapons, gold, { payload:weaponName }, proceed, reject) {
	let weaponData = weapons.state[weaponName]
	let weaponCost = weaponData && weaponData.cost
	
	return gold.state - weaponCost >= 0
		? proceed()
		: reject(`You don't have enough gold to buy that weapon!`)
}
```

### Notes

- `@Use()` creates an implicit dependency. Don't use it unless you need it. Prefer explicit dependencies wherever possible:

```javascript
import weaponsDb from './entities/weapons'
```

- The main purpose of `@Use()` is to avoid circular dependencies between Managers. The code smell of implicit dependencies is less unpleasant than that of circular dependencies. `@Use()` prefers the former over the latter, throwing an error if the implicit dependency is not met to mitigate its reticence. This allows you to "lift the dependency up". In other words:

```
// instead of this dependency graph:
MyComponent -> ModuleA -> ModuleB -> ModuleA -> etc...

// we get this:
MyComponent -> ModuleA
MyComponent -> ModuleB
```

### Some Cleanup

The `weapons` Manager seems to be a hub of activity while the other Managers are relatively "dumb". In this case we should use explicit dependencies. Let's throw those in and complete our `weapons` Manager:

```javascript
import { Actions, Before, Manage, Reduce, Value, getConflux } from 'fluxuate'
import weaponsDb from './entities/weapons'
import gold from './gold'

@Manage('weapons')
@Value([ 'dagger' ])
@Actions('buy', 'sell')
class WeaponsManager {
	
	@Before('buy')
	hasSufficientGold({ payload:weaponName }, proceed, reject) {
		let weaponData = weaponsDb.state[weaponName]
		let weaponCost = weaponData && weaponData.cost
		
		return gold.state - weaponCost >= 0
			? proceed()
			: reject(`You don't have enough gold to buy that weapon!`)
	}
	
	@Reduce('buy')
	reduceBuy(state, weaponName) {
		return [ ...state, weaponName ]
	}
	
	@Reduce('sell')
	reduceSell(state, weaponName) {
		let index = state.indexOf(weaponName)
		
		if (index === -1) return state // should never happen
		
		return [
			...state.slice(0, index),
			...state.slice(index + 1)
		]
	}
}

export default getConflux(WeaponsManager)
```

### Finishing It Up

That leaves us with number 2 on our todo list above:

> 2. We need to update the gold in our character's pouch when he does buy or sell a weapon.

There is no way for the `weapons` Manager to directly change the piece of state controlled by the `gold` Manager. To accomplish this, we could use a Before or After Interceptor to dispatch a `gold/earn` or `gold/spend` action. That approach has its pros and cons, but we won't go into them here.

In most cases, all we'll need to do to accomplish this is add a sub-reducer to the appropriate Manager. Let's add the following to our `gold` Manager:

```javascript
import weaponsDb from './entities/weapons'

...

@Reduce('/weapons/buy')
reduceWeaponsBuy(state, weaponName) {
	let weaponData = weaponsDb.state[weaponName]
	let weaponCost = weaponData && weaponData.cost
	
	return state - weaponCost
}

@Reduce('/weapons/sell')
reduceWeaponsSell(state, weaponName) {
	let weaponData = weaponsDb.state[weaponName]
	let weaponCost = weaponData && weaponData.cost
	
	return state + weaponCost
}

...
```

### Next Step

We have a lot of duplication now. Let's clean it all up with [Selectors](/docs/tutorial/Selectors.md).
