import { Actions, Action, Before, Manage, Reduce, Select, Value, getConflux } from '../../../src/index'
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
	reduceLocalAction(state, payload) {
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
