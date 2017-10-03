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

function addAfterInterceptor(managerPrototype, actionType, afterInterceptor) {
	var conflux = getByManager(managerPrototype);
	var interceptors = confluxData.get(conflux).unnamespacedAfterInterceptors;

	if (!interceptors[actionType]) {
		interceptors[actionType] = [];
	}

	interceptors[actionType].push(wrapMethod(conflux, afterInterceptor));
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

function After() {
	var actionTypes = [].concat(Array.prototype.slice.call(arguments));

	return function (managerPrototype, methodName, methodDescriptor) {
		var afterInterceptor = managerPrototype[methodName];

		actionTypes.forEach(function (actionType) {
			return addAfterInterceptor(managerPrototype, actionType, afterInterceptor);
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

var _dec;
var _dec2;
var _dec3;
var _dec4;
var _dec5;
var _dec6;
var _dec7;
var _class;
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

var idCounter = 0;

var TodosManager = (_dec = Manage('todos'), _dec2 = Actions('create', 'toggleCompleted'), _dec3 = Reduce('create'), _dec4 = Before('toggleCompleted'), _dec5 = Reduce('toggleCompleted'), _dec6 = Before('toggleCompleted'), _dec7 = After('toggleCompleted'), _dec(_class = _dec2(_class = (_class2 = function () {
	function TodosManager() {
		classCallCheck(this, TodosManager);
		this.entities = [];
	}

	createClass(TodosManager, [{
		key: 'reduceCreate',
		value: function reduceCreate(state, payload) {
			var newTodo = { id: idCounter++, text: payload, isCompleted: false };

			return _extends({}, state, { entities: state.entities.concat([newTodo]) });
		}
	}, {
		key: 'beforeToggleCompleted',
		value: function beforeToggleCompleted(action) {
			console.log('intercepted toggle completed action beforehand!', action);
		}
	}, {
		key: 'reduceToggleCompleted',
		value: function reduceToggleCompleted(state, payload) {
			console.log('reducing toggleCompleted action', payload);
			var entities = state.entities.map(function (todo) {
				return todo.id === payload ? _extends({}, todo, { isCompleted: !todo.isCompleted }) : todo;
			});
			return _extends({}, state, { entities: entities });
		}
	}, {
		key: 'afterToggleCompleted',
		value: function afterToggleCompleted(action) {
			console.log('intercepted toggle completed action at some point!', action);
		}
	}]);
	return TodosManager;
}(), (_applyDecoratedDescriptor(_class2.prototype, 'reduceCreate', [_dec3], Object.getOwnPropertyDescriptor(_class2.prototype, 'reduceCreate'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'beforeToggleCompleted', [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, 'beforeToggleCompleted'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'reduceToggleCompleted', [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, 'reduceToggleCompleted'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'afterToggleCompleted', [_dec6, _dec7], Object.getOwnPropertyDescriptor(_class2.prototype, 'afterToggleCompleted'), _class2.prototype)), _class2)) || _class) || _class);


var conflux = getConflux();
var fluxuateMiddleware = createFluxuateMiddleware();
var store = redux.createStore(conflux, redux.applyMiddleware(fluxuateMiddleware));
registerStore(store);

store.subscribe(function () {
	console.log('the store was updated. New state:', store.getState());
});

var todosConflux = getConflux('todos');
todosConflux.action.create('a new todo');
todosConflux.action.toggleCompleted(0);

})));
