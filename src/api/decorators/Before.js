import {addBeforeInterceptor} from '../../utils/state/confluxes'


export function Before() {
	let actionTypes = [...arguments]
	
	return (managerPrototype, methodName, methodDescriptor) => {
		let beforeInterceptor = managerPrototype[methodName]
		
		actionTypes.forEach(actionType =>
			addBeforeInterceptor(managerPrototype, actionType, beforeInterceptor)
		)
		
		return methodDescriptor
	}
}
