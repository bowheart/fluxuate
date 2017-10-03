import { Manage, Select, getConflux } from '../../../../src/index'


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
