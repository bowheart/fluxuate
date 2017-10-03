(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('redux')) :
	typeof define === 'function' && define.amd ? define(['redux'], factory) :
	(factory(global.Redux));
}(this, (function (redux) { 'use strict';

var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
  return typeof obj;
} : function (obj) {
  return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
};











var classCallCheck = function (instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
};

var createClass = function () {
  function defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  return function (Constructor, protoProps, staticProps) {
    if (protoProps) defineProperties(Constructor.prototype, protoProps);
    if (staticProps) defineProperties(Constructor, staticProps);
    return Constructor;
  };
}();





var defineProperty = function (obj, key, value) {
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }

  return obj;
};

var _extends = Object.assign || function (target) {
  for (var i = 1; i < arguments.length; i++) {
    var source = arguments[i];

    for (var key in source) {
      if (Object.prototype.hasOwnProperty.call(source, key)) {
        target[key] = source[key];
      }
    }
  }

  return target;
};



var inherits = function (subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
  }

  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      enumerable: false,
      writable: true,
      configurable: true
    }
  });
  if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
};











var possibleConstructorReturn = function (self, call) {
  if (!self) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }

  return call && (typeof call === "object" || typeof call === "function") ? call : self;
};



















var toConsumableArray = function (arr) {
  if (Array.isArray(arr)) {
    for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

    return arr2;
  } else {
    return Array.from(arr);
  }
};

var byActionType = {};

function add(actionType, beforeInterceptor) {
	(byActionType[actionType] || (byActionType[actionType] = [])).push(beforeInterceptor);
}

function invoke(action, next) {
	var beforeInterceptors = getByActionType(action.type);

	if (!beforeInterceptors.length) {
		return next(action);
	}

	var conjointNext = createConjointNext(action, next, beforeInterceptors);
	var isRejected = false;
	var reject = function reject(newPayload) {
		isRejected = true;
		next(_extends({}, action, { payload: newPayload, error: true }));
	};

	var _loop = function _loop(i) {
		var beforeInterceptor = beforeInterceptors[i];
		var proceed = function (_proceed) {
			function proceed() {
				return _proceed.apply(this, arguments);
			}

			proceed.toString = function () {
				return _proceed.toString();
			};

			return proceed;
		}(function () {
			return proceed && (proceed = conjointNext());
		});

		beforeInterceptor(action, proceed, reject);

		if (isRejected) return {
				v: void 0
			};
	};

	for (var i = 0; i < beforeInterceptors.length; i++) {
		var _ret = _loop(i);

		if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	}
}

function remove(actionType, beforeInterceptor) {
	var beforeInterceptors = byActionType[actionType];

	for (var i = 0; i < beforeInterceptors.length; i++) {
		var nextInterceptor = beforeInterceptors[i];

		if (nextInterceptor !== beforeInterceptor) continue;

		return beforeInterceptors.splice(i, 1);
	}
}

function createConjointNext(action, next, beforeInterceptors) {
	var calls = 0;
	return function () {
		calls++;

		if (calls === beforeInterceptors.length) {
			next(action);
		}
	};
}

function getByActionType(actionType) {
	var ownInterceptors = byActionType[actionType] || [];
	var localInterceptors = getLocalInterceptors(actionType);
	var globalInterceptors = byActionType['*'] || [];

	return [].concat(toConsumableArray(ownInterceptors), toConsumableArray(localInterceptors), toConsumableArray(globalInterceptors));
}

function getLocalInterceptors(actionType) {
	var nodes = actionType.split('/');
	var interceptors = [];

	nodes.forEach(function (node) {
		var localInterceptors = byActionType[node + '/*'] || [];
		interceptors = interceptors.concat(localInterceptors);
	});

	return interceptors;
}

var byActionType$1 = {};

function add$1(actionType, afterInterceptor) {
	(byActionType$1[actionType] || (byActionType$1[actionType] = [])).push(afterInterceptor);
}

function invoke$1(action) {
	var afterInterceptors = getByActionType$1(action.type);

	afterInterceptors.forEach(function (afterInterceptor) {
		return afterInterceptor(action);
	});
}

function remove$1(actionType, beforeInterceptor) {
	var afterInterceptors = byActionType$1[actionType];

	for (var i = 0; i < afterInterceptors.length; i++) {
		var nextInterceptor = afterInterceptors[i];

		if (nextInterceptor !== beforeInterceptor) continue;

		return afterInterceptors.splice(i, 1);
	}
}

function getByActionType$1(actionType) {
	var ownInterceptors = byActionType$1[actionType] || [];
	var localInterceptors = getLocalInterceptors$1(actionType);
	var globalInterceptors = byActionType$1['*'] || [];

	return [].concat(toConsumableArray(ownInterceptors), toConsumableArray(localInterceptors), toConsumableArray(globalInterceptors));
}

function getLocalInterceptors$1(actionType) {
	var nodes = actionType.split('/');
	var interceptors = [];

	nodes.forEach(function (node) {
		var localInterceptors = byActionType$1[node + '/*'] || [];
		interceptors = interceptors.concat(localInterceptors);
	});

	return interceptors;
}

function identityFunction(arg) {
	return arg;
}

var confluxData = new Map();
var lastActions = [];
var managerToConfluxMap = new Map();
var namespaceToConfluxMap = new Map();
var rootConflux = createConflux(true);

setValue(null, {});

function addAction(managerPrototype, actionType, actionCreator) {
	var conflux = getByManager(managerPrototype);
	var actionCreators = confluxData.get(conflux).unnamespacedActionCreators;

	if (actionCreator === identityFunction && actionCreators[actionType]) {
		return; // the user created a custom payload creator for this action; don't override it
	}

	actionCreators[actionType] = wrapMethod(conflux, actionCreator);
}



function addBeforeInterceptor(managerPrototype, actionType, beforeInterceptor) {
	var conflux = getByManager(managerPrototype);
	var interceptors = confluxData.get(conflux).unnamespacedBeforeInterceptors;

	if (!interceptors[actionType]) {
		interceptors[actionType] = [];
	}

	interceptors[actionType].push(wrapMethod(conflux, beforeInterceptor));
}



function addReducer(managerPrototype, actionType, reducer) {
	var conflux = getByManager(managerPrototype);
	var reducers = confluxData.get(conflux).unnamespacedReducers;

	if (!reducers[actionType]) {
		reducers[actionType] = [];
	}

	reducers[actionType].push(wrapMethod(conflux, reducer));
}

function addSelector(managerPrototype, selectorName, selector) {
	var conflux = getByManager(managerPrototype);
	confluxData.get(conflux).selectors[selectorName] = wrapSelector(wrapMethod(conflux, selector));
}

function getByNamespace(confluxNamespace) {
	return namespaceToConfluxMap.has(confluxNamespace) ? namespaceToConfluxMap.get(confluxNamespace) : null; // automatic creation not possible from this angle
}

function getByManager(managerPrototype) {
	if (!managerPrototype) return rootConflux;

	if (managerToConfluxMap.has(managerPrototype)) {
		return managerToConfluxMap.get(managerPrototype);
	}

	var newConflux = createConflux();
	managerToConfluxMap.set(managerPrototype, newConflux);
	return newConflux;
}

function getLastActions() {
	var currentActions = lastActions;
	lastActions = [];

	return currentActions;
}

function manage(confluxNamespace, Manager) {
	var conflux = getByManager(Manager.prototype);
	var data = confluxData.get(conflux);

	if (typeof data.value === 'undefined') {
		data.value = getConfluxValue(Manager);
	}

	namespaceConflux(conflux, confluxNamespace);
}

function setValue(managerPrototype, value) {
	var conflux = getByManager(managerPrototype);

	confluxData.get(conflux).value = value;
}

function createConflux() {
	var isRoot = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : false;

	var conflux = function conflux() {
		var state = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : confluxData.get(conflux).value;
		var action = arguments[1];

		var relativeActionType = action.type.replace(conflux.namespace + '/', '');

		var _confluxData$get = confluxData.get(conflux),
		    reducers = _confluxData$get.reducers,
		    children = _confluxData$get.children;

		var actionReducers = getActionReducers(conflux, action);

		// Reduce the own, local, and global reducers.
		state = actionReducers.reduce(function (state, reducer) {
			return reducer(state, action.payload);
		}, state);

		// Iterate over all this conflux's children (recursively hitting their own/local/global reducers, their children, and so forth).
		Object.keys(children).forEach(function (childStateNode) {
			var childConflux = children[childStateNode];
			var childState = state && state[childStateNode];
			var newChildState = childConflux(childState, action);

			if (newChildState === childState) return;

			state = _extends({}, state, defineProperty({}, childStateNode, newChildState));
		});

		if (isRoot) lastActions.push(action);

		return state;
	};

	confluxData.set(conflux, _extends({
		actionCreators: {},
		afterInterceptors: {},
		beforeInterceptors: {},
		children: {},
		errorReducers: {},
		reducers: {},
		selectors: {}
	}, isRoot ? {} : {
		unnamespacedActionCreators: {},
		unnamespacedAfterInterceptors: {},
		unnamespacedBeforeInterceptors: {},
		unnamespacedErrorReducers: {},
		unnamespacedReducers: {}
	}));

	Object.defineProperties(conflux, {
		action: {
			get: function get$$1() {
				return confluxData.get(conflux).actionCreators;
			}
		},

		select: {
			get: function get$$1() {
				return confluxData.get(conflux).selectors;
			}
		},

		state: {
			get: function get$$1() {
				return getConfluxState(conflux);
			}
		}
	});

	return conflux;
}

function destroyConflux(confluxNamespace) {
	var conflux = namespaceToConfluxMap.get(confluxNamespace);
	var data = confluxData.get(conflux);

	// Remove its top-level stored data.
	confluxData.delete(conflux);
	managerToConfluxMap.forEach(function (nextConflux, managerPrototype) {
		if (nextConflux === conflux) {
			managerToConfluxMap.delete(managerPrototype);
		}
	});
	namespaceToConfluxMap.delete(confluxNamespace);

	// Remove its before and after interceptors.
	Object.keys(data.beforeInterceptors).forEach(function (actionType) {
		data.beforeInterceptors[actionType].forEach(function (beforeInterceptor) {
			remove(actionType, beforeInterceptor);
		});
	});

	Object.keys(data.afterInterceptors).forEach(function (actionType) {
		data.afterInterceptors[actionType].forEach(function (afterInterceptor) {
			remove$1(actionType, afterInterceptor);
		});
	});

	// Remove it from its parent reducer's `children`.
	var nodes = confluxNamespace.split('/');
	var lastNode = nodes.pop();
	var currentConflux = rootConflux;

	nodes.forEach(function (node) {
		return currentConflux = confluxData.get(currentConflux).children[node];
	});
	delete confluxData.get(currentConflux).children[lastNode];

	return data.children;
}

function dispatchAction() {
	var _arguments = Array.prototype.slice.call(arguments),
	    actionType = _arguments[0],
	    payloadCreator = _arguments[1],
	    args = _arguments.slice(2);

	var payload = payloadCreator.apply(null, args);
	var action = { type: actionType, payload: payload };
	if (payload instanceof Error) action.error = true;

	return dispatch(action);
}

function getConfluxState(conflux) {
	var nodes = conflux.namespace.split('/');
	var state = getState();

	nodes.forEach(function (node) {
		state = state && state[node];
	});
	return state;
}

function getActionReducers(conflux, action) {
	var data = confluxData.get(conflux);
	var reducers = action.error ? data.errorReducers : data.reducers;

	var ownReducers = reducers[action.type] || [];
	var localReducers = ownReducers.length && reducers[conflux.namespace + '/*'] || [];
	var globalReducers = reducers['*'] || [];

	return [].concat(toConsumableArray(ownReducers), toConsumableArray(localReducers), toConsumableArray(globalReducers));
}

function getConfluxValue(Manager) {
	var manager = new Manager();
	var value = {};

	Object.keys(manager).forEach(function (key) {
		var val = manager[key];
		if (typeof val === 'function') return;

		value[key] = val;
	});

	return value;
}

function memoizeArgs(oldArgs, newArgs) {
	if (!oldArgs) return newArgs;

	return oldArgs.every(function (oldArg, index) {
		return newArgs[index] === oldArg;
	}) ? oldArgs : newArgs;
}

function namespaceActionCreators(conflux) {
	var _confluxData$get2 = confluxData.get(conflux),
	    actionCreators = _confluxData$get2.actionCreators,
	    unnamespacedActionCreators = _confluxData$get2.unnamespacedActionCreators;

	Object.keys(unnamespacedActionCreators).forEach(function (relativeActionType) {
		var actionCreator = unnamespacedActionCreators[relativeActionType];
		var actionType = prependNamespace(conflux, relativeActionType);

		actionCreators[relativeActionType] = dispatchAction.bind(null, actionType, actionCreator);
	});

	delete confluxData.get(conflux).unnamespacedActionCreators;
}

function namespaceAfterInterceptors(conflux) {
	var _confluxData$get3 = confluxData.get(conflux),
	    afterInterceptors = _confluxData$get3.afterInterceptors,
	    unnamespacedAfterInterceptors = _confluxData$get3.unnamespacedAfterInterceptors;

	Object.keys(unnamespacedAfterInterceptors).forEach(function (relativeActionType) {
		var actionInterceptors = unnamespacedAfterInterceptors[relativeActionType];
		var actionType = prependNamespace(conflux, relativeActionType);
		afterInterceptors[actionType] || (afterInterceptors[actionType] = []);

		actionInterceptors.forEach(function (actionInterceptor) {
			afterInterceptors[actionType].push(actionInterceptor);
			add$1(actionType, actionInterceptor);
		});
	});

	delete confluxData.get(conflux).unnamespacedAfterInterceptors;
}

function namespaceBeforeInterceptors(conflux) {
	var _confluxData$get4 = confluxData.get(conflux),
	    beforeInterceptors = _confluxData$get4.beforeInterceptors,
	    unnamespacedBeforeInterceptors = _confluxData$get4.unnamespacedBeforeInterceptors;

	Object.keys(unnamespacedBeforeInterceptors).forEach(function (relativeActionType) {
		var actionInterceptors = unnamespacedBeforeInterceptors[relativeActionType];
		var actionType = prependNamespace(conflux, relativeActionType);
		beforeInterceptors[actionType] || (beforeInterceptors[actionType] = []);

		actionInterceptors.forEach(function (actionInterceptor) {
			beforeInterceptors[actionType].push(actionInterceptor);
			add(actionType, actionInterceptor);
		});
	});

	delete confluxData.get(conflux).unnamespacedBeforeInterceptors;
}

function namespaceConflux(conflux, confluxNamespace) {
	if (namespaceToConfluxMap.has(confluxNamespace)) {
		var oldChildren = destroyConflux(confluxNamespace);
		confluxData.get(conflux).children = oldChildren;
	}

	namespaceToConfluxMap.set(confluxNamespace, conflux);
	Object.defineProperty(conflux, 'namespace', { value: confluxNamespace });

	// Dynamically create the conflux hierarchy.
	var nodes = confluxNamespace.split('/').filter(function (node) {
		return node;
	});
	var lastNode = nodes.pop(); // we've already created the last conflux in the tree path.
	var currentConflux = rootConflux;

	nodes.forEach(function (node) {
		var confluxChildren = confluxData.get(currentConflux).children;
		if (!confluxChildren[node]) {
			confluxChildren[node] = createConflux();
		}
		currentConflux = confluxChildren[node];
	});

	// Now stick the new conflux on the end.
	var confluxChildren = confluxData.get(currentConflux).children;
	confluxChildren[lastNode] = conflux;

	// Namespace all the relative entities for easy O(1) lookups.
	namespaceActionCreators(conflux);
	namespaceAfterInterceptors(conflux);
	namespaceBeforeInterceptors(conflux);
	namespaceErrorReducers(conflux);
	namespaceReducers(conflux);

	replaceReducer(rootConflux);
}

function namespaceErrorReducers(conflux) {
	var _confluxData$get5 = confluxData.get(conflux),
	    errorReducers = _confluxData$get5.errorReducers,
	    unnamespacedErrorReducers = _confluxData$get5.unnamespacedErrorReducers;

	Object.keys(unnamespacedErrorReducers).forEach(function (relativeActionType) {
		var actionReducers = unnamespacedErrorReducers[relativeActionType];
		var actionType = prependNamespace(conflux, relativeActionType);
		errorReducers[actionType] || (errorReducers[actionType] = []);

		actionReducers.forEach(function (reducer) {
			errorReducers[actionType].push(reducer);
		});
	});

	delete confluxData.get(conflux).unnamespacedErrorReducers;
}

function namespaceReducers(conflux) {
	var _confluxData$get6 = confluxData.get(conflux),
	    reducers = _confluxData$get6.reducers,
	    unnamespacedReducers = _confluxData$get6.unnamespacedReducers;

	Object.keys(unnamespacedReducers).forEach(function (relativeActionType) {
		var actionReducers = unnamespacedReducers[relativeActionType];
		var actionType = prependNamespace(conflux, relativeActionType);
		reducers[actionType] || (reducers[actionType] = []);

		actionReducers.forEach(function (reducer) {
			reducers[actionType].push(reducer);
		});
	});

	delete confluxData.get(conflux).unnamespacedReducers;
}

function prependNamespace(conflux, relativePath) {
	return relativePath[0] === '/' ? relativePath.slice(1) // it's actually absolute
	: conflux.namespace + '/' + relativePath;
}

function wrapMethod(conflux, method) {
	return function () {
		var isUsing = method.isUsing || [];
		var args = isUsing.map(function (confluxNamespace) {
			confluxNamespace = prependNamespace(conflux, confluxNamespace);
			var usedConflux = getByNamespace(confluxNamespace);
			if (usedConflux) return usedConflux;

			throw new ReferenceError('Fluxuate Error - Use() - No conflux found with namespace "' + confluxNamespace + '". Did you forget to import it?');
		}).concat([].concat(Array.prototype.slice.call(arguments)));

		return method.apply(conflux, args);
	};
}

function wrapSelector(injectedSelector) {
	var memoizedArgs = void 0,
	    memoizedVal = void 0;

	var memoize = function memoize() {
		var newArgs = memoizeArgs(memoizedArgs, [].concat(Array.prototype.slice.call(arguments)));

		if (newArgs === memoizedArgs) return function () {
			return memoizedVal;
		};

		memoizedArgs = newArgs;

		return function (calculator) {
			if (typeof calculator !== 'function') {
				throw new TypeError('Fluxuate Error - memoized selector calculator must be a function (e.g. `memoize(arg)(calculatorFunctionHere)`)');
			}

			return memoizedVal = calculator.apply(null, memoizedArgs);
		};
	};

	return function () {
		var selection = injectedSelector.apply(null, [memoize].concat(Array.prototype.slice.call(arguments)));

		return typeof selection === 'function' ? wrapSelector(injectedSelector) // it's a selector factory
		: selection;
	};
}

var store$1 = null;

function dispatch(action) {
	if (!store$1) throw new ReferenceError('Fluxuate Error: The store has not been created yet! Cannot dispatch action "' + action.type + '".');

	return store$1.dispatch(action);
}

function getState() {
	if (!store$1) throw new ReferenceError('Fluxuate Error: The store has not been created yet! Cannot get state.');

	return store$1.getState();
}

function replaceReducer(newReducer) {
	if (!store$1) return; // they never registered the store; that's fine; do nothing

	return store$1.replaceReducer(newReducer);
}

function setStore(theStore) {
	store$1 = theStore;
	if (typeof theStore.subscribe !== 'function') return;

	store$1.subscribe(function () {
		var lastActions = getLastActions();
		if (!lastActions.length) return;

		lastActions.forEach(invoke$1);
	});
}

function createFluxuateMiddleware() {
	return function (store) {
		setStore(store);

		return function (next) {
			return function (action) {
				invoke(action, next);
			};
		};
	};
}

function Actions() {
	var actionTypes = [].concat(Array.prototype.slice.call(arguments));

	return function (Manager) {
		actionTypes.forEach(function (actionType) {
			return addAction(Manager.prototype, actionType, identityFunction);
		});

		return Manager;
	};
}

function Action() {
	var actionTypes = [].concat(Array.prototype.slice.call(arguments));

	return function (managerPrototype, methodName, methodDescriptor) {
		var actionCreator = managerPrototype[methodName];

		actionTypes.forEach(function (actionType) {
			return addAction(managerPrototype, actionType, actionCreator);
		});

		return methodDescriptor;
	};
}

function Before() {
	var actionTypes = [].concat(Array.prototype.slice.call(arguments));

	return function (managerPrototype, methodName, methodDescriptor) {
		var beforeInterceptor = managerPrototype[methodName];

		actionTypes.forEach(function (actionType) {
			return addBeforeInterceptor(managerPrototype, actionType, beforeInterceptor);
		});

		return methodDescriptor;
	};
}

function Manage(managerNamespace) {
	return function (Manager) {
		manage(managerNamespace, Manager);

		return Manager;
	};
}

function Reduce() {
	var actionTypes = [].concat(Array.prototype.slice.call(arguments));

	return function (managerPrototype, methodName, methodDescriptor) {
		var reducer = managerPrototype[methodName];

		actionTypes.forEach(function (actionType) {
			return addReducer(managerPrototype, actionType, reducer);
		});

		return methodDescriptor;
	};
}

function Select(selectorName) {
	return function (managerPrototype, methodName, methodDescriptor) {
		var selector = managerPrototype[methodName];
		addSelector(managerPrototype, selectorName, selector);

		return methodDescriptor;
	};
}

function Use(confluxNamespace) {
	var paramType = typeof confluxNamespace === 'undefined' ? 'undefined' : _typeof(confluxNamespace);

	if (paramType === 'string') {

		return function (managerPrototype, methodName, methodDescriptor) {
			var method = managerPrototype[methodName];

			if (!method.isUsing) {
				method.isUsing = [];
			}

			method.isUsing.unshift(confluxNamespace);
			return methodDescriptor;
		};
	} else if (paramType === 'function') {

		return function (Manager) {
			// TODO: Use react-fluxuate plugin to create a HOC for the manager and connect it to the store
		};
	}

	throw new TypeError('Fluxuate Error - Use() - Invalid parameter type "' + paramType + '"');
}

function Value(value) {
	if (typeof value === 'undefined') {
		throw new TypeError('Fluxuate Error - Value() - The value cannot be undefined!');
	}

	return function (Manager) {
		setValue(Manager.prototype, value);

		return Manager;
	};
}

function getConflux(classOrNamespace) {
	switch (typeof classOrNamespace === 'undefined' ? 'undefined' : _typeof(classOrNamespace)) {
		case 'undefined':
			return getByManager();

		case 'string':
			return getByNamespace(classOrNamespace);

		case 'function':
			return getByManager(classOrNamespace.prototype);
	}
}

function registerStore(store) {
	if (!['getState', 'dispatch', 'subscribe', 'replaceReducer'].every(function (method) {
		return typeof store[method] === 'function';
	})) {
		throw new TypeError('Fluxuate Error - registerStore() - Invalid redux store received.');
	}

	setStore(store);
}

function handleStoreCreation(rootReducer, preloadedState) {
	var middlewareList = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : [];


	// Get the root reducer.
	rootReducer || (rootReducer = getConflux());

	// Stick the Fluxuate middleware at the beginning of the list.
	middlewareList = [createFluxuateMiddleware()].concat(toConsumableArray(middlewareList));

	// Create the store enhancer.
	var enhancer = redux.applyMiddleware.apply(null, middlewareList);

	// Create the store.
	var store = redux.createStore(rootReducer, preloadedState, enhancer);

	// Register the store with Fluxuate.
	registerStore(store);

	return store;
}

var _dec$1;
var _dec2;
var _dec3;
var _dec4;
var _dec5;
var _dec6;
var _dec7;
var _dec8;
var _class$1;
var _class2;

function _applyDecoratedDescriptor(target, property, decorators, descriptor, context) {
	var desc = {};
	Object['ke' + 'ys'](descriptor).forEach(function (key) {
		desc[key] = descriptor[key];
	});
	desc.enumerable = !!desc.enumerable;
	desc.configurable = !!desc.configurable;

	if ('value' in desc || desc.initializer) {
		desc.writable = true;
	}

	desc = decorators.slice().reverse().reduce(function (desc, decorator) {
		return decorator(target, property, desc) || desc;
	}, desc);

	if (context && desc.initializer !== void 0) {
		desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
		desc.initializer = undefined;
	}

	if (desc.initializer === void 0) {
		Object['define' + 'Property'](target, property, desc);
		desc = null;
	}

	return desc;
}

var CashManager = (_dec$1 = Manage('cash'), _dec2 = Value(4000), _dec3 = Actions('earn'), _dec4 = Reduce('earn'), _dec5 = Reduce('/cart/checkout'), _dec6 = Use('/cart'), _dec7 = Select('afterCheckout'), _dec8 = Use('/cart'), _dec$1(_class$1 = _dec2(_class$1 = _dec3(_class$1 = (_class2 = function () {
	function CashManager() {
		classCallCheck(this, CashManager);
	}

	createClass(CashManager, [{
		key: 'reduceEarn',
		value: function reduceEarn(state, payload) {
			return state + payload;
		}
	}, {
		key: 'reduceCartCheckout',
		value: function reduceCartCheckout(cart, state, payload) {
			return state - cart.select.subtotal();
		}
	}, {
		key: 'selectAfterCheckout',
		value: function selectAfterCheckout(cart, memoize) {
			return this.state - cart.select.subtotal();
		}
	}]);
	return CashManager;
}(), (_applyDecoratedDescriptor(_class2.prototype, 'reduceEarn', [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, 'reduceEarn'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'reduceCartCheckout', [_dec5, _dec6], Object.getOwnPropertyDescriptor(_class2.prototype, 'reduceCartCheckout'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'selectAfterCheckout', [_dec7, _dec8], Object.getOwnPropertyDescriptor(_class2.prototype, 'selectAfterCheckout'), _class2.prototype)), _class2)) || _class$1) || _class$1) || _class$1);


var cash = getConflux(CashManager);

var store = handleStoreCreation();

var _dec$2;
var _dec2$1;
var _dec3$1;
var _dec4$1;
var _dec5$1;
var _dec6$1;
var _dec7$1;
var _dec8$1;
var _dec9;
var _dec10;
var _dec11;
var _dec12;
var _dec13;
var _dec14;
var _dec15;
var _dec16;
var _dec17;
var _dec18;
var _class$2;
var _class2$1;

function _applyDecoratedDescriptor$1(target, property, decorators, descriptor, context) {
	var desc = {};
	Object['ke' + 'ys'](descriptor).forEach(function (key) {
		desc[key] = descriptor[key];
	});
	desc.enumerable = !!desc.enumerable;
	desc.configurable = !!desc.configurable;

	if ('value' in desc || desc.initializer) {
		desc.writable = true;
	}

	desc = decorators.slice().reverse().reduce(function (desc, decorator) {
		return decorator(target, property, desc) || desc;
	}, desc);

	if (context && desc.initializer !== void 0) {
		desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
		desc.initializer = undefined;
	}

	if (desc.initializer === void 0) {
		Object['define' + 'Property'](target, property, desc);
		desc = null;
	}

	return desc;
}

var idCounter = 0;

var CartManager = (_dec$2 = Manage('cart'), _dec2$1 = Actions('add', 'remove', 'checkout'), _dec3$1 = Value([]), _dec4$1 = Before('/*'), _dec5$1 = Before('*'), _dec6$1 = Reduce('/*'), _dec7$1 = Reduce('*'), _dec8$1 = Action('add'), _dec9 = Before('add'), _dec10 = Use('/cash'), _dec11 = Reduce('add'), _dec12 = Reduce('remove'), _dec13 = Before('checkout'), _dec14 = Use('/cash'), _dec15 = Reduce('checkout'), _dec16 = Select('subtotal'), _dec17 = Select('itemTotal'), _dec18 = Use('/entities/cookies'), _dec$2(_class$2 = _dec2$1(_class$2 = _dec3$1(_class$2 = (_class2$1 = function () {
	function CartManager() {
		classCallCheck(this, CartManager);
	}

	createClass(CartManager, [{
		key: 'globalInterceptor',
		value: function globalInterceptor(action, proceed) {
			console.log('intercepted a global action', action);
			proceed();
		}
	}, {
		key: 'localInterceptor',
		value: function localInterceptor(action, proceed) {
			console.log('intercepted a local action', action);
			proceed();
		}
	}, {
		key: 'globalReducer',
		value: function globalReducer(state, payload) {
			console.log('global reducer hit', payload);
			return state;
		}
	}, {
		key: 'localReducer',
		value: function localReducer(state, payload) {
			console.log('local reducer hit', payload);
			return state;
		}
	}, {
		key: 'actionAdd',
		value: function actionAdd(cookieId, quantity) {
			return { cookieId: cookieId, quantity: quantity };
		}
	}, {
		key: 'hasFundsForAdd',
		value: function hasFundsForAdd(cash, action, proceed) {
			console.log('examining before add to cart...', cash.state, this.select.subtotal(), this.select.itemTotal(action.payload));
			if (cash.state - this.select.subtotal() - this.select.itemTotal(action.payload) < 0) {
				return;
			}
			proceed();
		}
	}, {
		key: 'reduceAdd',
		value: function reduceAdd(state, newItem) {
			newItem.id = idCounter++;
			return state.concat([newItem]);
		}
	}, {
		key: 'reduceRemove',
		value: function reduceRemove(state, itemIndex) {
			return state.slice(0, itemIndex).concat(state.slice(itemIndex + 1));
		}
	}, {
		key: 'hasSufficientFunds',
		value: function hasSufficientFunds(cash, action, proceed) {
			if (cash.state - this.select.subtotal() < 0) {
				return;
			}
			proceed();
		}
	}, {
		key: 'reduceCheckout',
		value: function reduceCheckout() {
			return [];
		}
	}, {
		key: 'selectSubtotal',
		value: function selectSubtotal(memoize) {
			var _this = this;

			return memoize(this.state)(function (items) {
				return items.reduce(function (total, item) {
					return total + _this.select.itemTotal(item);
				}, 0);
			});
		}
	}, {
		key: 'selectItemTotal',
		value: function selectItemTotal(cookies, memoize, item) {
			return item.quantity * cookies.select.price(item.cookieId);
		}
	}]);
	return CartManager;
}(), (_applyDecoratedDescriptor$1(_class2$1.prototype, 'globalInterceptor', [_dec4$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'globalInterceptor'), _class2$1.prototype), _applyDecoratedDescriptor$1(_class2$1.prototype, 'localInterceptor', [_dec5$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'localInterceptor'), _class2$1.prototype), _applyDecoratedDescriptor$1(_class2$1.prototype, 'globalReducer', [_dec6$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'globalReducer'), _class2$1.prototype), _applyDecoratedDescriptor$1(_class2$1.prototype, 'localReducer', [_dec7$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'localReducer'), _class2$1.prototype), _applyDecoratedDescriptor$1(_class2$1.prototype, 'actionAdd', [_dec8$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'actionAdd'), _class2$1.prototype), _applyDecoratedDescriptor$1(_class2$1.prototype, 'hasFundsForAdd', [_dec9, _dec10], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'hasFundsForAdd'), _class2$1.prototype), _applyDecoratedDescriptor$1(_class2$1.prototype, 'reduceAdd', [_dec11], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'reduceAdd'), _class2$1.prototype), _applyDecoratedDescriptor$1(_class2$1.prototype, 'reduceRemove', [_dec12], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'reduceRemove'), _class2$1.prototype), _applyDecoratedDescriptor$1(_class2$1.prototype, 'hasSufficientFunds', [_dec13, _dec14], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'hasSufficientFunds'), _class2$1.prototype), _applyDecoratedDescriptor$1(_class2$1.prototype, 'reduceCheckout', [_dec15], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'reduceCheckout'), _class2$1.prototype), _applyDecoratedDescriptor$1(_class2$1.prototype, 'selectSubtotal', [_dec16], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'selectSubtotal'), _class2$1.prototype), _applyDecoratedDescriptor$1(_class2$1.prototype, 'selectItemTotal', [_dec17, _dec18], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'selectItemTotal'), _class2$1.prototype)), _class2$1)) || _class$2) || _class$2) || _class$2);


var cart = getConflux(CartManager);

var _dec$3;
var _dec2$2;
var _dec3$2;
var _dec4$2;
var _dec5$2;
var _class$3;
var _class2$2;

function _applyDecoratedDescriptor$2(target, property, decorators, descriptor, context) {
	var desc = {};
	Object['ke' + 'ys'](descriptor).forEach(function (key) {
		desc[key] = descriptor[key];
	});
	desc.enumerable = !!desc.enumerable;
	desc.configurable = !!desc.configurable;

	if ('value' in desc || desc.initializer) {
		desc.writable = true;
	}

	desc = decorators.slice().reverse().reduce(function (desc, decorator) {
		return decorator(target, property, desc) || desc;
	}, desc);

	if (context && desc.initializer !== void 0) {
		desc.value = desc.initializer ? desc.initializer.call(context) : void 0;
		desc.initializer = undefined;
	}

	if (desc.initializer === void 0) {
		Object['define' + 'Property'](target, property, desc);
		desc = null;
	}

	return desc;
}

var CookiesManager = (_dec$3 = Manage('entities/cookies'), _dec2$2 = Value({
	'0': {
		id: 0,
		name: 'chocolate chip',
		price: 150
	},
	'1': {
		id: 1,
		name: 'snickerdoodle',
		price: 125
	}
}), _dec3$2 = Select('byId'), _dec4$2 = Select('name'), _dec5$2 = Select('price'), _dec$3(_class$3 = _dec2$2(_class$3 = (_class2$2 = function () {
	function CookiesManager() {
		classCallCheck(this, CookiesManager);
	}

	createClass(CookiesManager, [{
		key: 'selectById',
		value: function selectById(memoize, id) {
			return this.state[id];
		}
	}, {
		key: 'selectName',
		value: function selectName(memoize, id) {
			var entity = this.select.byId(id);
			return entity && entity.name;
		}
	}, {
		key: 'selectPrice',
		value: function selectPrice(memoize, id) {
			var entity = this.select.byId(id);
			return entity && entity.price;
		}
	}]);
	return CookiesManager;
}(), (_applyDecoratedDescriptor$2(_class2$2.prototype, 'selectById', [_dec3$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, 'selectById'), _class2$2.prototype), _applyDecoratedDescriptor$2(_class2$2.prototype, 'selectName', [_dec4$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, 'selectName'), _class2$2.prototype), _applyDecoratedDescriptor$2(_class2$2.prototype, 'selectPrice', [_dec5$2], Object.getOwnPropertyDescriptor(_class2$2.prototype, 'selectPrice'), _class2$2.prototype)), _class2$2)) || _class$3) || _class$3);


var cookies = getConflux(CookiesManager);

var _class$4;
var _temp;

var storeKey = 'store';

var Provider = (_temp = _class$4 = function (_React$Component) {
	inherits(Provider, _React$Component);
	createClass(Provider, [{
		key: 'getChildContext',
		value: function getChildContext() {
			return defineProperty({}, storeKey, this[storeKey]);
		}
	}]);

	function Provider(props, context) {
		classCallCheck(this, Provider);

		var _this = possibleConstructorReturn(this, (Provider.__proto__ || Object.getPrototypeOf(Provider)).call(this, props, context));

		_this[storeKey] = props.store;
		return _this;
	}

	createClass(Provider, [{
		key: 'render',
		value: function render() {
			return React.Children.only(this.props.children);
		}
	}]);
	return Provider;
}(React.Component), _class$4.childContextTypes = defineProperty({}, storeKey, PropTypes.object.isRequired), _temp);

function Use$1(getState) {
	return function (WrappedComponent) {
		var _class, _temp;

		return _temp = _class = function (_React$Component) {
			inherits(_class, _React$Component);

			function _class(props, context) {
				classCallCheck(this, _class);

				var _this = possibleConstructorReturn(this, (_class.__proto__ || Object.getPrototypeOf(_class)).call(this, props));

				_this.store = props.store || context.store;
				_this.state = getState();
				return _this;
			}

			createClass(_class, [{
				key: "componentDidMount",
				value: function componentDidMount() {
					var _this2 = this;

					this.unsubscribe = this.store.subscribe(function () {
						_this2.setState(getState());
					});
				}
			}, {
				key: "componentWillUnmount",
				value: function componentWillUnmount() {
					this.unsubscribe();
				}
			}, {
				key: "render",
				value: function render() {
					return React.createElement(WrappedComponent, _extends({}, this.props, this.state));
				}
			}]);
			return _class;
		}(React.Component), _class.contextTypes = {
			store: PropTypes.object.isRequired
		}, _temp;
	};
}

var _dec;
var _class;

var App = (_dec = Use$1(function () {
	return {
		cart: cart.state,
		cash: cash.state,
		addToCart: cart.action.add,
		cashAfterCheckout: cash.select.afterCheckout,
		getCookieName: cookies.select.name,
		getSubtotal: cart.select.subtotal
	};
}), _dec(_class = function (_React$Component) {
	inherits(App, _React$Component);

	function App() {
		var _ref;

		var _temp, _this, _ret;

		classCallCheck(this, App);

		for (var _len = arguments.length, args = Array(_len), _key = 0; _key < _len; _key++) {
			args[_key] = arguments[_key];
		}

		return _ret = (_temp = (_this = possibleConstructorReturn(this, (_ref = App.__proto__ || Object.getPrototypeOf(App)).call.apply(_ref, [this].concat(args))), _this), _this.nextAction = function () {
			actions.shift()();
		}, _temp), possibleConstructorReturn(_this, _ret);
	}

	createClass(App, [{
		key: 'render',
		value: function render() {
			var _this2 = this;

			return React.createElement(
				'div',
				null,
				React.createElement(
					'button',
					{ onClick: this.nextAction },
					'Next Action'
				),
				React.createElement(
					'ul',
					null,
					this.props.cart.map(function (item) {
						return React.createElement(
							'li',
							{ key: item.id },
							React.createElement(
								'div',
								null,
								_this2.props.getCookieName(item.cookieId)
							),
							React.createElement(
								'div',
								null,
								'Quantity: ',
								item.quantity
							)
						);
					})
				),
				React.createElement(
					'div',
					null,
					'Current Cash: ',
					this.props.cash
				),
				React.createElement(
					'div',
					null,
					'Subtotal: ',
					this.props.getSubtotal()
				),
				React.createElement(
					'div',
					null,
					'Difference: ',
					this.props.cashAfterCheckout()
				)
			);
		}
	}]);
	return App;
}(React.Component)) || _class);


ReactDOM.render(React.createElement(
	Provider,
	{ store: store },
	React.createElement(App, null)
), document.getElementById('root'));

var actions = [function () {
	return cart.action.add(0, 12);
}, function () {
	return cart.action.add(1, 16);
}, function () {
	return cash.action.earn(5000);
}, function () {
	return cart.action.add(0, 200);
}, function () {
	return cart.action.checkout();
}, function () {
	return cart.action.add(1, 1);
}, function () {
	return cart.action.add(1, 10);
}];

})));
