import {Actions, Action, Before, Manage, Reduce, Select, Use, Value, getConflux} from '../../../src/index'


let idCounter = 0


@Manage('cart')
@Actions('add', 'remove', 'checkout')
@Value([])
class CartManager {
	
	@Before('/*')
	globalInterceptor(action, proceed) {
		console.log('intercepted a global action', action)
		proceed()
	}
	
	
	@Before('*')
	localInterceptor(action, proceed) {
		console.log('intercepted a local action', action)
		proceed()
	}
	
	
	
	@Reduce('/*')
	globalReducer(state, payload) {
		console.log('global reducer hit', payload)
		return state
	}
	
	
	
	@Reduce('*')
	localReducer(state, payload) {
		console.log('local reducer hit', payload)
		return state
	}
	
	
	
	@Action('add')
	actionAdd(cookieId, quantity) {
		return {cookieId, quantity}
	}
	
	@Before('add')
	@Use('/cash')
	hasFundsForAdd(cash, action, proceed) {
		console.log('examining before add to cart...', cash.state, this.select.subtotal(), this.select.itemTotal(action.payload))
		if (cash.state - this.select.subtotal() - this.select.itemTotal(action.payload) < 0) {
			return
		}
		proceed()
	}
	
	@Reduce('add')
	reduceAdd(state, newItem) {
		newItem.id = idCounter++
		return state.concat([newItem])
	}
	
	
	
	@Reduce('remove')
	reduceRemove(state, itemIndex) {
		return state.slice(0, itemIndex).concat(state.slice(itemIndex + 1))
	}
	
	
	
	@Before('checkout')
	@Use('/cash')
	hasSufficientFunds(cash, action, proceed) {
		if (cash.state - this.select.subtotal() < 0) {
			return
		}
		proceed()
	}
	
	@Reduce('checkout')
	reduceCheckout() {
		return []
	}
	
	
	
	
	@Select('subtotal')
	selectSubtotal(memoize) {
		return memoize(this.state)(
			items => items.reduce((total, item) =>
				total + this.select.itemTotal(item)
			, 0)
		)
	}
	
	@Select('itemTotal')
	@Use('/entities/cookies')
	selectItemTotal(cookies, memoize, item) {
		return item.quantity * cookies.select.price(item.cookieId)
	}
}


export default getConflux(CartManager)
