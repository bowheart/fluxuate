import {Actions, Before, Reduce, Select, Manage, Use, Value, getConflux} from '../../../src/index'


@Manage('cash')
@Value(4000)
@Actions('earn')
class CashManager {
	
	@Reduce('earn')
	reduceEarn(state, payload) {
		return state + payload
	}
	
	
	@Reduce('/cart/checkout')
	@Use('/cart')
	reduceCartCheckout(cart, state, payload) {
		return state - cart.select.subtotal()
	}
	
	
	@Select('afterCheckout')
	@Use('/cart')
	selectAfterCheckout(cart, memoize) {
		return this.state - cart.select.subtotal()
	}
}


export default getConflux(CashManager)
