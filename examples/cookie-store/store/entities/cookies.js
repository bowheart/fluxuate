import {Manage, Select, Value, getConflux} from '../../../../src/index'


@Manage('entities/cookies')
@Value({
	'0': {
		id: 0,
		name: 'chocolate chip',
		price: 150
	},
	'1': {
		id: 1,
		name: 'snickerdoodle',
		price: 125
	}
})
class CookiesManager {
	
	@Select('byId')
	selectById(memoize, id) {
		return this.state[id]
	}
	
	@Select('name')
	selectName(memoize, id) {
		let entity = this.select.byId(id)
		return entity && entity.name
	}
	
	@Select('price')
	selectPrice(memoize, id) {
		let entity = this.select.byId(id)
		return entity && entity.price
	}
}


export default getConflux(CookiesManager)
