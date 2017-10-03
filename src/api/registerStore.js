import {setStore} from '../utils/state/store'


export function registerStore(store) {
	if (!['getState', 'dispatch', 'subscribe', 'replaceReducer'].every(method => typeof store[method] === 'function')) {
		throw new TypeError('Fluxuate Error - registerStore() - Invalid redux store received.')
	}
	
	setStore(store)
}
