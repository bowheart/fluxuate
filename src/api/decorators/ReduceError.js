import {addErrorReducer} from '../../utils/state/confluxes'


export function ReduceError() {
	let actionTypes = [...arguments]
	
	return (managerPrototype, methodName, methodDescriptor) => {
		let reducer = managerPrototype[methodName]
		
		actionTypes.forEach(actionType =>
			addErrorReducer(managerPrototype, actionType, reducer)
		)
		
		return methodDescriptor
	}
}
