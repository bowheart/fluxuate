# The Big Picture

Let's review a little:

- Managers are created by decorating an ES6 class with the `@Manage()` decorator.


- Action creators are created by either:
  - Decorating a Manager with the `@Actions()` decorator
  - Decorating a Manager method with the `@Action()` decorator


- Confluxes are automatically created when a Manager is declared.


- Confluxes can be retrieved via `getConflux(ManagerConstructor)` or `getConflux('managerNamespace')`.


- The root conflux is retrieved by calling `getConflux()` with no arguments.


- Sub-reducers are added to a conflux by decorating a method on its Manager with the `@Reduce()` decorator.


- Actions can be intercepted before or after they're dispatched to the store by decorating a Manager method with the `@Before()` or `@After()` decorators.


- Selectors are created by decorating a Manager method with the `@Select()` decorator.


- Confluxes have 3 main properties:
  - `Conflux.state` - retrieves the current state of the piece of state managed by the Conflux's Manager.
  - `Conflux.action` - retrieves an object containing all the actions declared on the Conflux's Manager.
  - `Conflux.select` - retrieves an object containing all the selectors declared on the Conflux's Manager.


Let's put everything together:

##### gold.js

```javascript
import { Actions, Action, Before, Manage, Reduce, Select, Value, getConflux } from 'fluxuate'
import weaponsDb from './entities/weapons'

@Manage('gold')
@Value(8000)
@Actions('earn', 'spend')
class GoldManager {
	
	@Reduce('earn')
	reduceEarn(state, amount) {
		return state + amount
	}
	
	@Before('spend')
	hasSufficientGold({ payload:amount }, proceed, reject) {
		this.select.hasSufficientGold(amount)
			? proceed()
			: reject(`You don't have enough gold to do that!`)
	}
	
	@Reduce('spend')
	reduceSpend(state, payload) {
		return state - payload
	}
	
	@Reduce('/weapons/buy')
	reduceWeaponsBuy(state, weaponName) {
		return state - weaponsDb.select.cost(weaponName)
	}
	
	@Reduce('/weapons/sell')
	reduceWeaponsSell(state, weaponName) {
		return state + weaponsDb.select.cost(weaponName)
	}
	
	@Select('hasSufficientGold')
	selectHasSufficientGold(memoize, costOfItem) {
		return this.state - costOfItem >= 0
	}
}

export default getConflux(GoldManager)
```

##### weapons.js

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
		return gold.select.hasSufficientGold(weaponsDb.select.cost(weaponName))
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
		
		if (index === -1) return state
		
		return [
			...state.slice(0, index),
			...state.slice(index + 1)
		]
	}
}

export default getConflux(WeaponsManager)
```

##### entities/weapons.js

```javascript
import { Manage, Select, getConflux } from 'fluxuate'

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

export default getConflux(WeaponsDbManager)
```

##### store.js

```javascript
import { handleStoreCreation } from 'fluxuate'
import gold from './gold'

export default handleStoreCreation()
```

And that's it! Not counting whitespace it's 80 lines of code by my calculation. Let's play with it a little:

```javascript
import store from './store/store'

// calling
store.getState()
// will shouw us the default state:
{
	gold: 8000,
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

// wait, why isn't { weapons: [ 'dagger' ] } in there?
// the `weapons` Manager has not been imported yet!
// store.js loaded the `gold` Manager.
// gold.js imported the `entities/weapons` Manager.


import gold from './store/gold'

gold.action.earn(200)
gold.action.spend(4000)
gold.select.hasSufficientGold(5000) // false
gold.action.spend(5000) // will fail
gold.state // 4200


// Now let's say our app needs the weapons Manager.
// Let's add it to our store! All we need to do is import it:

import weapons from './store/weapons'

weapons.action.buy('crossbow')
gold.state // 1600
weapons.action.sell('dagger')
weapons.state // [ 'crossbow' ]
gold.state // 2100

// now
store.getState()
// will give us
{
	gold: 2100,
	weapons: [ 'crossbow' ],
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

### To Be Continued...

This concludes the tutorial. Have fun using Fluxuate!

Fluxuate is still very young. Expect plenty of new features and api changes before the first major release. Feedback and suggestions are extremely welcome.
