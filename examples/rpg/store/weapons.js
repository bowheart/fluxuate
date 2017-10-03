import { Actions, Before, Manage, Reduce, Value, getConflux } from '../../../src/index'
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
