let byActionType = {}


export function add(actionType, afterInterceptor) {
	(byActionType[actionType] || (byActionType[actionType] = []))
		.push(afterInterceptor)
}


export function invoke(action) {
	let afterInterceptors = getByActionType(action.type)
	
	afterInterceptors.forEach(afterInterceptor =>
		afterInterceptor(action)
	)
}


export function remove(actionType, beforeInterceptor) {
	let afterInterceptors = byActionType[actionType]
	
	for (let i = 0; i < afterInterceptors.length; i++) {
		let nextInterceptor = afterInterceptors[i]
		
		if (nextInterceptor !== beforeInterceptor) continue
		
		return afterInterceptors.splice(i, 1)
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
