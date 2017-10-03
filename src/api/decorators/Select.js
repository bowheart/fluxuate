import {addSelector} from '../../utils/state/confluxes'


export function Select(selectorName) {
	return (managerPrototype, methodName, methodDescriptor) => {
		let selector = managerPrototype[methodName]
		addSelector(managerPrototype, selectorName, selector)
		
		return methodDescriptor
	}
}
