import {addAction} from '../../utils/state/confluxes'


export function Action() {
	let actionTypes = [...arguments]
	
	return (managerPrototype, methodName, methodDescriptor) => {
		let actionCreator = managerPrototype[methodName]
		
		actionTypes.forEach(actionType =>
			addAction(managerPrototype, actionType, actionCreator)
		)
		
		return methodDescriptor
	}
}
