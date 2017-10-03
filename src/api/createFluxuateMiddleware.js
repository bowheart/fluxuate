import {invoke} from '../utils/state/beforeInterceptors'
import {setStore} from '../utils/state/store'


export function createFluxuateMiddleware() {
	return store => {
		setStore(store)
		
		return next => action => {
			invoke(action, next)
		}
	}
}
