import {addReducer} from '../../utils/state/confluxes'


export function Reduce() {
	let actionTypes = [...arguments]
	
	return (managerPrototype, methodName, methodDescriptor) => {
		let reducer = managerPrototype[methodName]
		
		actionTypes.forEach(actionType =>
			addReducer(managerPrototype, actionType, reducer)
		)
		
		return methodDescriptor
	}
}
