import {getByNamespace, getByManager} from '../utils/state/confluxes'


export function getConflux(classOrNamespace) {
	switch (typeof classOrNamespace) {
		case 'undefined':
			return getByManager()
			
		case 'string':
			return getByNamespace(classOrNamespace)
			
		case 'function':
			return getByManager(classOrNamespace.prototype)
	}
}
