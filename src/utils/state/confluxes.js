import {add as registerAfterInterceptor, remove as killAfterInterceptor} from './afterInterceptors'
import {add as registerBeforeInterceptor, remove as killBeforeInterceptor} from './beforeInterceptors'
import {dispatch, getState, replaceReducer} from './store'
import {identityFunction} from '../identityFunction'


let confluxData = new Map()
let lastActions = []
let managerToConfluxMap = new Map()
let namespaceToConfluxMap = new Map()
let rootConflux = createConflux(true)


setValue(null, {})


export function addAction(managerPrototype, actionType, actionCreator) {
	let conflux = getByManager(managerPrototype)
	let actionCreators = confluxData.get(conflux).unnamespacedActionCreators
	
	if (actionCreator === identityFunction && actionCreators[actionType]) {
		return // the user created a custom payload creator for this action; don't override it
	}
	
	actionCreators[actionType] = wrapMethod(conflux, actionCreator)
}


export function addAfterInterceptor(managerPrototype, actionType, afterInterceptor) {
	let conflux = getByManager(managerPrototype)
	let interceptors = confluxData.get(conflux).unnamespacedAfterInterceptors
	
	if (!interceptors[actionType]) {
		interceptors[actionType] = []
	}
	
	interceptors[actionType].push(wrapMethod(conflux, afterInterceptor))
}


export function addBeforeInterceptor(managerPrototype, actionType, beforeInterceptor) {
	let conflux = getByManager(managerPrototype)
	let interceptors = confluxData.get(conflux).unnamespacedBeforeInterceptors
	
	if (!interceptors[actionType]) {
		interceptors[actionType] = []
	}
	
	interceptors[actionType].push(wrapMethod(conflux, beforeInterceptor))
}


export function addErrorReducer(managerPrototype, actionType, reducer) {
	let conflux = getByManager(managerPrototype)
	let reducers = confluxData.get(conflux).unnamespacedErrorReducers
	
	if (!reducers[actionType]) {
		reducers[actionType] = []
	}
	
	reducers[actionType].push(wrapMethod(conflux, reducer))
}


export function addReducer(managerPrototype, actionType, reducer) {
	let conflux = getByManager(managerPrototype)
	let reducers = confluxData.get(conflux).unnamespacedReducers
	
	if (!reducers[actionType]) {
		reducers[actionType] = []
	}
	
	reducers[actionType].push(wrapMethod(conflux, reducer))
}


export function addSelector(managerPrototype, selectorName, selector) {
	let conflux = getByManager(managerPrototype)
	confluxData.get(conflux).selectors[selectorName] = wrapSelector(wrapMethod(conflux, selector))
}


export function getByNamespace(confluxNamespace) {
	return namespaceToConfluxMap.has(confluxNamespace)
		? namespaceToConfluxMap.get(confluxNamespace)
		: null // automatic creation not possible from this angle
}


export function getByManager(managerPrototype) {
	if (!managerPrototype) return rootConflux
	
	if (managerToConfluxMap.has(managerPrototype)) {
		return managerToConfluxMap.get(managerPrototype)
	}
	
	let newConflux = createConflux()
	managerToConfluxMap.set(managerPrototype, newConflux)
	return newConflux
}


export function getLastActions() {
	let currentActions = lastActions
	lastActions = []
	
	return currentActions
}


export function manage(confluxNamespace, Manager) {
	let conflux = getByManager(Manager.prototype)
	let data = confluxData.get(conflux)
	
	if (typeof data.value === 'undefined') {
		data.value = getConfluxValue(Manager)
	}
	
	namespaceConflux(conflux, confluxNamespace)
}


export function setValue(managerPrototype, value) {
	let conflux = getByManager(managerPrototype)
	
	confluxData.get(conflux).value = value
}





function createConflux(isRoot = false) {
	let conflux = (state = confluxData.get(conflux).value, action) => {
		let relativeActionType = action.type.replace(`${conflux.namespace}/`, '')
		let {reducers, children} = confluxData.get(conflux)
		let actionReducers = getActionReducers(conflux, action)
		
		// Reduce the own, local, and global reducers.
		state = actionReducers.reduce((state, reducer) =>
			reducer(state, action.payload)
		, state)
		
		// Iterate over all this conflux's children (recursively hitting their own/local/global reducers, their children, and so forth).
		Object.keys(children).forEach(childStateNode => {
			let childConflux = children[childStateNode]
			let childState = state && state[childStateNode]
			let newChildState = childConflux(childState, action)
			
			if (newChildState === childState) return
			
			state = {...state, [childStateNode]: newChildState}
		})
		
		if (isRoot) lastActions.push(action)
		
		return state
	}
	
	confluxData.set(conflux, {
		actionCreators: {},
		afterInterceptors: {},
		beforeInterceptors: {},
		children: {},
		errorReducers: {},
		reducers: {},
		selectors: {},
		...(isRoot ? {} : {
			unnamespacedActionCreators: {},
			unnamespacedAfterInterceptors: {},
			unnamespacedBeforeInterceptors: {},
			unnamespacedErrorReducers: {},
			unnamespacedReducers: {}
		})
	})
	
	Object.defineProperties(conflux, {
		action: {
			get() { return confluxData.get(conflux).actionCreators }
		},
		
		select: {
			get() { return confluxData.get(conflux).selectors }
		},
		
		state: {
			get() { return getConfluxState(conflux) }
		}
	})
	
	return conflux
}


function destroyConflux(confluxNamespace) {
	let conflux = namespaceToConfluxMap.get(confluxNamespace)
	let data = confluxData.get(conflux)
	
	// Remove its top-level stored data.
	confluxData.delete(conflux)
	managerToConfluxMap.forEach((nextConflux, managerPrototype) => {
		if (nextConflux === conflux) {
			managerToConfluxMap.delete(managerPrototype)
		}
	})
	namespaceToConfluxMap.delete(confluxNamespace)
	
	// Remove its before and after interceptors.
	Object.keys(data.beforeInterceptors).forEach(actionType => {
		data.beforeInterceptors[actionType].forEach(beforeInterceptor => {
			killBeforeInterceptor(actionType, beforeInterceptor)
		})
	})
	
	Object.keys(data.afterInterceptors).forEach(actionType => {
		data.afterInterceptors[actionType].forEach(afterInterceptor => {
			killAfterInterceptor(actionType, afterInterceptor)
		})
	})
	
	// Remove it from its parent reducer's `children`.
	let nodes = confluxNamespace.split('/')
	let lastNode = nodes.pop()
	let currentConflux = rootConflux
	
	nodes.forEach(node =>
		currentConflux = confluxData.get(currentConflux).children[node]
	)
	delete confluxData.get(currentConflux).children[lastNode]
	
	return data.children
}


function dispatchAction() {
	let [actionType, payloadCreator, ...args] = arguments
	let payload = payloadCreator.apply(null, args)
	let action = {type: actionType, payload}
	if (payload instanceof Error) action.error = true
	
	return dispatch(action)
}


function getConfluxState(conflux) {
	let nodes = conflux.namespace.split('/')
	let state = getState()
	
	nodes.forEach(node => {
		state = state && state[node]
	})
	return state
}


function getActionReducers(conflux, action) {
	let data = confluxData.get(conflux)
	let reducers = action.error
		? data.errorReducers
		: data.reducers
	
	let ownReducers = reducers[action.type] || []
	let localReducers = ownReducers.length && reducers[`${conflux.namespace}/*`] || []
	let globalReducers = reducers['*'] || []
	
	return [...ownReducers, ...localReducers, ...globalReducers]
}


function getConfluxValue(Manager) {
	let manager = new Manager()
	let value = {}
	
	Object.keys(manager).forEach(key => {
		let val = manager[key]
		if (typeof val === 'function') return
		
		value[key] = val
	})
	
	return value
}


function memoizeArgs(oldArgs, newArgs) {
	if (!oldArgs) return newArgs
	
	return oldArgs.every((oldArg, index) => newArgs[index] === oldArg)
		? oldArgs
		: newArgs
}


function namespaceActionCreators(conflux) {
	let {actionCreators, unnamespacedActionCreators} = confluxData.get(conflux)
	
	Object.keys(unnamespacedActionCreators).forEach(relativeActionType => {
		let actionCreator = unnamespacedActionCreators[relativeActionType]
		let actionType = prependNamespace(conflux, relativeActionType)
		
		actionCreators[relativeActionType] = dispatchAction.bind(null, actionType, actionCreator)
	})
	
	delete confluxData.get(conflux).unnamespacedActionCreators
}


function namespaceAfterInterceptors(conflux) {
	let {afterInterceptors, unnamespacedAfterInterceptors} = confluxData.get(conflux)
	
	Object.keys(unnamespacedAfterInterceptors).forEach(relativeActionType => {
		let actionInterceptors = unnamespacedAfterInterceptors[relativeActionType]
		let actionType = prependNamespace(conflux, relativeActionType)
		afterInterceptors[actionType] || (afterInterceptors[actionType] = [])
		
		actionInterceptors.forEach(actionInterceptor => {
			afterInterceptors[actionType].push(actionInterceptor)
			registerAfterInterceptor(actionType, actionInterceptor)
		})
	})
	
	delete confluxData.get(conflux).unnamespacedAfterInterceptors
}


function namespaceBeforeInterceptors(conflux) {
	let {beforeInterceptors, unnamespacedBeforeInterceptors} = confluxData.get(conflux)
	
	Object.keys(unnamespacedBeforeInterceptors).forEach(relativeActionType => {
		let actionInterceptors = unnamespacedBeforeInterceptors[relativeActionType]
		let actionType = prependNamespace(conflux, relativeActionType)
		beforeInterceptors[actionType] || (beforeInterceptors[actionType] = [])
		
		actionInterceptors.forEach(actionInterceptor => {
			beforeInterceptors[actionType].push(actionInterceptor)
			registerBeforeInterceptor(actionType, actionInterceptor)
		})
	})
	
	delete confluxData.get(conflux).unnamespacedBeforeInterceptors
}


function namespaceConflux(conflux, confluxNamespace) {
	if (namespaceToConfluxMap.has(confluxNamespace)) {
		let oldChildren = destroyConflux(confluxNamespace)
		confluxData.get(conflux).children = oldChildren
	}
	
	namespaceToConfluxMap.set(confluxNamespace, conflux)
	Object.defineProperty(conflux, 'namespace', {value: confluxNamespace})
	
	// Dynamically create the conflux hierarchy.
	let nodes = confluxNamespace.split('/').filter(node => node)
	let lastNode = nodes.pop() // we've already created the last conflux in the tree path.
	let currentConflux = rootConflux
	
	nodes.forEach(node => {
		let confluxChildren = confluxData.get(currentConflux).children
		if (!confluxChildren[node]) {
			confluxChildren[node] = createConflux()
		}
		currentConflux = confluxChildren[node]
	})
	
	// Now stick the new conflux on the end.
	let confluxChildren = confluxData.get(currentConflux).children
	confluxChildren[lastNode] = conflux
	
	// Namespace all the relative entities for easy O(1) lookups.
	namespaceActionCreators(conflux)
	namespaceAfterInterceptors(conflux)
	namespaceBeforeInterceptors(conflux)
	namespaceErrorReducers(conflux)
	namespaceReducers(conflux)
	
	replaceReducer(rootConflux)
}


function namespaceErrorReducers(conflux) {
	let {errorReducers, unnamespacedErrorReducers} = confluxData.get(conflux)
	
	Object.keys(unnamespacedErrorReducers).forEach(relativeActionType => {
		let actionReducers = unnamespacedErrorReducers[relativeActionType]
		let actionType = prependNamespace(conflux, relativeActionType)
		errorReducers[actionType] || (errorReducers[actionType] = [])
		
		actionReducers.forEach(reducer => {
			errorReducers[actionType].push(reducer)
		})
	})
	
	delete confluxData.get(conflux).unnamespacedErrorReducers
}


function namespaceReducers(conflux) {
	let {reducers, unnamespacedReducers} = confluxData.get(conflux)
	
	Object.keys(unnamespacedReducers).forEach(relativeActionType => {
		let actionReducers = unnamespacedReducers[relativeActionType]
		let actionType = prependNamespace(conflux, relativeActionType)
		reducers[actionType] || (reducers[actionType] = [])
		
		actionReducers.forEach(reducer => {
			reducers[actionType].push(reducer)
		})
	})
	
	delete confluxData.get(conflux).unnamespacedReducers
}


function prependNamespace(conflux, relativePath) {
	return relativePath[0] === '/'
		? relativePath.slice(1) // it's actually absolute
		: `${conflux.namespace}/${relativePath}`
}


function wrapMethod(conflux, method) {
	return function() {
		let isUsing = method.isUsing || []
		let args = isUsing
			.map(confluxNamespace => {
				confluxNamespace = prependNamespace(conflux, confluxNamespace)
				let usedConflux = getByNamespace(confluxNamespace)
				if (usedConflux) return usedConflux
				
				throw new ReferenceError('Fluxuate Error - Use() - No conflux found with namespace "' + confluxNamespace + '". Did you forget to import it?')
			})
			.concat([...arguments])
		
		return method.apply(conflux, args)
	}
}


function wrapSelector(injectedSelector) {
	let memoizedArgs, memoizedVal
	
	let memoize = function() {
		let newArgs = memoizeArgs(memoizedArgs, [...arguments])
		
		if (newArgs === memoizedArgs) return () => memoizedVal
		
		memoizedArgs = newArgs
		
		return calculator => {
			if (typeof calculator !== 'function') {
				throw new TypeError('Fluxuate Error - memoized selector calculator must be a function (e.g. `memoize(arg)(calculatorFunctionHere)`)')
			}
			
			return memoizedVal = calculator.apply(null, memoizedArgs)
		}
	}
	
	return function() {
		let selection = injectedSelector.apply(null, [memoize, ...arguments])
		
		return typeof selection === 'function'
			? wrapSelector(injectedSelector) // it's a selector factory
			: selection
	}
}
