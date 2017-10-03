import {invoke} from './afterInterceptors'
import {getLastActions} from './confluxes'


let store = null


export function dispatch(action) {
	if (!store) throw new ReferenceError('Fluxuate Error: The store has not been created yet! Cannot dispatch action "' + action.type + '".')
	
	return store.dispatch(action)
}


export function getState() {
	if (!store) throw new ReferenceError('Fluxuate Error: The store has not been created yet! Cannot get state.')
	
	return store.getState()
}


export function replaceReducer(newReducer) {
	if (!store) return // they never registered the store; that's fine; do nothing
	
	return store.replaceReducer(newReducer)
}





export function setStore(theStore) {
	store = theStore
	if (typeof theStore.subscribe !== 'function') return
	
	store.subscribe(() => {
		let lastActions = getLastActions()
		if (!lastActions.length) return
		
		lastActions.forEach(invoke)
	})
}
