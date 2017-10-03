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

var _class$1;
var _temp;

var storeKey = 'store';

var Provider = (_temp = _class$1 = function (_React$Component) {
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
}(React.Component), _class$1.childContextTypes = defineProperty({}, storeKey, PropTypes.object.isRequired), _temp);

function Use(getState) {
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

var store = null;

function dispatch(action) {
	if (!store) throw new ReferenceError('Fluxuate Error: The store has not been created yet! Cannot dispatch action "' + action.type + '".');

	return store.dispatch(action);
}

function getState() {
	if (!store) throw new ReferenceError('Fluxuate Error: The store has not been created yet! Cannot get state.');

	return store.getState();
}

function replaceReducer(newReducer) {
	if (!store) return; // they never registered the store; that's fine; do nothing

	return store.replaceReducer(newReducer);
}

function setStore(theStore) {
	store = theStore;
	if (typeof theStore.subscribe !== 'function') return;

	store.subscribe(function () {
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

var _dec$2;
var _dec2$1;
var _dec3$1;
var _class$3;
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

var WeaponsDbManager = (_dec$2 = Manage('entities/weapons'), _dec2$1 = Select('byName'), _dec3$1 = Select('cost'), _dec$2(_class$3 = (_class2$1 = function () {
	function WeaponsDbManager() {
		classCallCheck(this, WeaponsDbManager);
		this.dagger = { cost: 500 };
		this.crossbow = { cost: 2600 };
	}

	createClass(WeaponsDbManager, [{
		key: 'selectByName',
		value: function selectByName(memoize, weaponName) {
			return this.state[weaponName] || {};
		}
	}, {
		key: 'selectCost',
		value: function selectCost(memoize, weaponName) {
			return this.select.byName(weaponName).cost || 0;
		}
	}]);
	return WeaponsDbManager;
}(), (_applyDecoratedDescriptor$1(_class2$1.prototype, 'selectByName', [_dec2$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'selectByName'), _class2$1.prototype), _applyDecoratedDescriptor$1(_class2$1.prototype, 'selectCost', [_dec3$1], Object.getOwnPropertyDescriptor(_class2$1.prototype, 'selectCost'), _class2$1.prototype)), _class2$1)) || _class$3);


var weaponsDb = getConflux(WeaponsDbManager);

var _dec$1;
var _dec2;
var _dec3;
var _dec4;
var _dec5;
var _dec6;
var _dec7;
var _dec8;
var _dec9;
var _class$2;
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

var GoldManager = (_dec$1 = Manage('gold'), _dec2 = Value(8000), _dec3 = Actions('earn', 'spend'), _dec4 = Reduce('earn'), _dec5 = Before('spend'), _dec6 = Reduce('spend'), _dec7 = Reduce('/weapons/buy'), _dec8 = Reduce('/weapons/sell'), _dec9 = Select('hasSufficientGold'), _dec$1(_class$2 = _dec2(_class$2 = _dec3(_class$2 = (_class2 = function () {
	function GoldManager() {
		classCallCheck(this, GoldManager);
	}

	createClass(GoldManager, [{
		key: 'reduceEarn',
		value: function reduceEarn(state, amount) {
			return state + amount;
		}
	}, {
		key: 'hasSufficientGold',
		value: function hasSufficientGold(_ref, proceed, reject) {
			var amount = _ref.payload;

			this.select.hasSufficientGold(amount) ? proceed() : reject('You don\'t have enough gold to do that!');
		}
	}, {
		key: 'reduceLocalAction',
		value: function reduceLocalAction(state, payload) {
			return state - payload;
		}
	}, {
		key: 'reduceWeaponsBuy',
		value: function reduceWeaponsBuy(state, weaponName) {
			return state - weaponsDb.select.cost(weaponName);
		}
	}, {
		key: 'reduceWeaponsSell',
		value: function reduceWeaponsSell(state, weaponName) {
			return state + weaponsDb.select.cost(weaponName);
		}
	}, {
		key: 'selectHasSufficientGold',
		value: function selectHasSufficientGold(memoize, costOfItem) {
			return this.state - costOfItem >= 0;
		}
	}]);
	return GoldManager;
}(), (_applyDecoratedDescriptor(_class2.prototype, 'reduceEarn', [_dec4], Object.getOwnPropertyDescriptor(_class2.prototype, 'reduceEarn'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'hasSufficientGold', [_dec5], Object.getOwnPropertyDescriptor(_class2.prototype, 'hasSufficientGold'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'reduceLocalAction', [_dec6], Object.getOwnPropertyDescriptor(_class2.prototype, 'reduceLocalAction'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'reduceWeaponsBuy', [_dec7], Object.getOwnPropertyDescriptor(_class2.prototype, 'reduceWeaponsBuy'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'reduceWeaponsSell', [_dec8], Object.getOwnPropertyDescriptor(_class2.prototype, 'reduceWeaponsSell'), _class2.prototype), _applyDecoratedDescriptor(_class2.prototype, 'selectHasSufficientGold', [_dec9], Object.getOwnPropertyDescriptor(_class2.prototype, 'selectHasSufficientGold'), _class2.prototype)), _class2)) || _class$2) || _class$2) || _class$2);


var gold = getConflux(GoldManager);

var store$1 = handleStoreCreation();

// const store = handleStoreCreation(null, {
// 	gold: 8000,
// 	potions: {
// 		health: 11,
// 		energy: 2
// 	},
// 	weapons: [ 'dagger', 'crossbow' ],
// 	entities: {
// 		potions: {
// 			health: {
// 				restores: { health: +10 }
// 			},
// 			energy: {
// 				restores: { energy: +20 }
// 			},
// 			strength: {
// 				buffs: {
// 					stats: [ 'damage' ],
// 					effect: +50,
// 					duration: 200
// 				}
// 			}
// 		},
// 		weapons: {
// 			dagger: {
// 				damage: 5,
// 				speed: 22
// 			},
// 			crossbow: {
// 				damage: 16,
// 				speed: 6
// 			},
// 			scimitar: {
// 				damage: 12,
// 				speed: 14
// 			}
// 		}
// 	}
// })


// export default store

var _dec$3;
var _dec2$2;
var _dec3$2;
var _dec4$1;
var _dec5$1;
var _dec6$1;
var _class$4;
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

var WeaponsManager = (_dec$3 = Manage('weapons'), _dec2$2 = Value(['dagger']), _dec3$2 = Actions('buy', 'sell'), _dec4$1 = Before('buy'), _dec5$1 = Reduce('buy'), _dec6$1 = Reduce('sell'), _dec$3(_class$4 = _dec2$2(_class$4 = _dec3$2(_class$4 = (_class2$2 = function () {
	function WeaponsManager() {
		classCallCheck(this, WeaponsManager);
	}

	createClass(WeaponsManager, [{
		key: 'hasSufficientGold',
		value: function hasSufficientGold(_ref, proceed, reject) {
			var weaponName = _ref.payload;

			return gold.select.hasSufficientGold(weaponsDb.select.cost(weaponName)) ? proceed() : reject('You don\'t have enough gold to buy that weapon!');
		}
	}, {
		key: 'reduceBuy',
		value: function reduceBuy(state, weaponName) {
			return [].concat(toConsumableArray(state), [weaponName]);
		}
	}, {
		key: 'reduceSell',
		value: function reduceSell(state, weaponName) {
			var index = state.indexOf(weaponName);

			if (index === -1) return state;

			return [].concat(toConsumableArray(state.slice(0, index)), toConsumableArray(state.slice(index + 1)));
		}
	}]);
	return WeaponsManager;
}(), (_applyDecoratedDescriptor$2(_class2$2.prototype, 'hasSufficientGold', [_dec4$1], Object.getOwnPropertyDescriptor(_class2$2.prototype, 'hasSufficientGold'), _class2$2.prototype), _applyDecoratedDescriptor$2(_class2$2.prototype, 'reduceBuy', [_dec5$1], Object.getOwnPropertyDescriptor(_class2$2.prototype, 'reduceBuy'), _class2$2.prototype), _applyDecoratedDescriptor$2(_class2$2.prototype, 'reduceSell', [_dec6$1], Object.getOwnPropertyDescriptor(_class2$2.prototype, 'reduceSell'), _class2$2.prototype)), _class2$2)) || _class$4) || _class$4) || _class$4);


var weapons = getConflux(WeaponsManager);

var _dec;
var _class;

var App = (_dec = Use(function () {
	return {};
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
			return React.createElement(
				'div',
				null,
				React.createElement(
					'button',
					{ onClick: this.nextAction },
					'Next Action'
				)
			);
		}
	}]);
	return App;
}(React.Component)) || _class);


ReactDOM.render(React.createElement(
	Provider,
	{ store: store$1 },
	React.createElement(App, null)
), document.getElementById('root'));

var actions = [function () {
	return console.log(store$1.getState());
}, function () {
	return gold.action.earn(200);
}, function () {
	return gold.action.spend(4000);
}, function () {
	return console.log(gold.select.hasSufficientGold(5000));
}, function () {
	return gold.action.spend(5000);
}, // will fail
function () {
	return console.log(gold.state);
}, function () {
	return weapons.action.buy('crossbow');
}, function () {
	return console.log(gold.state);
}, function () {
	return weapons.action.sell('dagger');
}, function () {
	return console.log(gold.state, weapons.state, store$1.getState());
}];

})));
