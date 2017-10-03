import {applyMiddleware, createStore} from 'redux'

import {createFluxuateMiddleware} from './createFluxuateMiddleware'
import {getConflux} from './getConflux'
import {registerStore} from './registerStore'


export function handleStoreCreation(rootReducer, preloadedState, middlewareList = []) {
	
	// Get the root reducer.
	rootReducer || (rootReducer = getConflux())
	
	// Stick the Fluxuate middleware at the beginning of the list.
	middlewareList = [createFluxuateMiddleware(), ...middlewareList]
	
	// Create the store enhancer.
	let enhancer = applyMiddleware.apply(null, middlewareList)
	
	// Create the store.
	let store = createStore(rootReducer, preloadedState, enhancer)
	
	// Register the store with Fluxuate.
	registerStore(store)
	
	return store
}
