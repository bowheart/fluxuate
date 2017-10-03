import {setValue} from '../../utils/state/confluxes'


export function Value(value) {
	if (typeof value === 'undefined') {
		throw new TypeError('Fluxuate Error - Value() - The value cannot be undefined!')
	}
	
	return Manager => {
		setValue(Manager.prototype, value)
		
		return Manager
	}
}
