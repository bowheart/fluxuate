import {dispatch} from '../../utils/state/store'
import {manage} from '../../utils/state/confluxes'


export function Manage(managerNamespace) {
	return Manager => {
		manage(managerNamespace, Manager)
		
		return Manager
	}
}
