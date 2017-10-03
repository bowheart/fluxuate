import {addAction} from '../../utils/state/confluxes'
import {identityFunction} from '../../utils/identityFunction'


export function Actions() {
	let actionTypes = [...arguments]
	
	return Manager => {
		actionTypes.forEach(actionType =>
			addAction(Manager.prototype, actionType, identityFunction)
		)
		
		return Manager
	}
}
