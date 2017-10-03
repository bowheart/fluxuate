import {getByNamespace} from '../../utils/state/confluxes'


export function Use(confluxNamespace) {
	let paramType = typeof confluxNamespace
	
	if (paramType === 'string') {
		
		return (managerPrototype, methodName, methodDescriptor) => {
			let method = managerPrototype[methodName]
			
			if (!method.isUsing) {
				method.isUsing = []
			}
			
			method.isUsing.unshift(confluxNamespace)
			return methodDescriptor
		}
		
	} else if (paramType === 'function') {
		
		return Manager => {
			// TODO: Use react-fluxuate plugin to create a HOC for the manager and connect it to the store
		}
		
	}
	
	throw new TypeError(`Fluxuate Error - Use() - Invalid parameter type "${paramType}"`)
}
