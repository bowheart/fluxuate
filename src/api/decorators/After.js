import {addAfterInterceptor} from '../../utils/state/confluxes'


export function After() {
	let actionTypes = [...arguments]
	
	return (managerPrototype, methodName, methodDescriptor) => {
		let afterInterceptor = managerPrototype[methodName]
		
		actionTypes.forEach(actionType =>
			addAfterInterceptor(managerPrototype, actionType, afterInterceptor)
		)
		
		return methodDescriptor
	}
}
