let byActionType = {}


export function add(actionType, beforeInterceptor) {
	(byActionType[actionType] || (byActionType[actionType] = []))
		.push(beforeInterceptor)
}


export function invoke(action, next) {
	let beforeInterceptors = getByActionType(action.type)
	
	if (!beforeInterceptors.length) {
		return next(action)
	}
	
	let conjointNext = createConjointNext(action, next, beforeInterceptors)
	let isRejected = false
	let reject = newPayload => {
		isRejected = true
		next({...action, payload: newPayload, error: true})
	}
	
	for (let i = 0; i < beforeInterceptors.length; i++) {
		let beforeInterceptor = beforeInterceptors[i]
		let proceed = () => proceed && (proceed = conjointNext())
		
		beforeInterceptor(action, proceed, reject)
		
		if (isRejected) return
	}
}


export function remove(actionType, beforeInterceptor) {
	let beforeInterceptors = byActionType[actionType]
	
	for (let i = 0; i < beforeInterceptors.length; i++) {
		let nextInterceptor = beforeInterceptors[i]
		
		if (nextInterceptor !== beforeInterceptor) continue
		
		return beforeInterceptors.splice(i, 1)
	}
}





function createConjointNext(action, next, beforeInterceptors) {
	let calls = 0
	return () => {
		calls++
		
		if (calls === beforeInterceptors.length) {
			next(action)
		}
	}
}


function getByActionType(actionType) {
	let ownInterceptors = byActionType[actionType] || []
	let localInterceptors = getLocalInterceptors(actionType)
	let globalInterceptors = byActionType['*'] || []
	
	return [...ownInterceptors, ...localInterceptors, ...globalInterceptors]
}


function getLocalInterceptors(actionType) {
	let nodes = actionType.split('/')
	let interceptors = []
	
	nodes.forEach(node => {
		let localInterceptors = byActionType[`${node}/*`] || []
		interceptors = interceptors.concat(localInterceptors)
	})
	
	return interceptors
}
