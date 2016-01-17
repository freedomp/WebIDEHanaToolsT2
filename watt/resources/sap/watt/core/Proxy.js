define([ "./Interface", "./DebugHooks", "./RunTimeChecks", "sap/watt/lib/lodash/lodash", "./Constants" ],
	function(Interface, DebugHooks, RunTimeChecks, _, Constants) {
	"use strict";
	// ======================
	// EventEmitter
	// ======================

	/**
	 * The Event Emitter class. It is responsible to register and emit events.
	 * @class
	 */
	var EventEmitter = function() {
		this._mListeners = {};
	};

	EventEmitter.prototype._mListeners = null;

	/**
	 * Emits the event and propagates data to the event listeners.
	 *
	 * @param {string} sEventName The event name to emit
	 * @param {any} arguments Further arguments to pass to the event listeners
	 * @return {Promise} Promise which is resolved when all event handlers are finished.
	 */
	EventEmitter.prototype.emit = function(sEventName) {
		var aArgs = Array.prototype.slice.call(arguments, 1);
		var aRemoveListeners = [];
		var aPromises = [];

		aArgs.push({});

		if (this.hasListeners(sEventName)) {
			// we are cloning an array with .concat() to prevent the possible changes in mListener array
			// that could be done from listener calls
			var aListeners = this._mListeners[sEventName].concat();
			for (var i = 0; i < aListeners.length; i++) {
				var mOptions = aListeners[i];
				var fnListener = mOptions.listener;
				var oContext = mOptions.context;
				if (this._emitPreperation(mOptions, aRemoveListeners)) {
					try {
						// Running event listeners is meant to be synchronious, Q.allResolved is needed for promises returned by event listeners
						aPromises.push(Q(fnListener.apply(oContext, aArgs)));
					} catch (e) {
						aPromises.push(Q.reject(e));
					}
				}
			}
		}

		// Cleanup listeners which are not allowed to be called anymore
		if (aRemoveListeners.length > 0) {
			for (var i = 0; i < aRemoveListeners.length; i++) {
				var mOptions = aRemoveListeners[i];
				this.off(sEventName, mOptions.listener, mOptions.context);
			}
		}

		return Q.allResolved(aPromises);
	};

	/**
	 * Prepares the listeners options for emitting the event.
	 *
	 * @param {map} mListenerOptions The options of the listener
	 * @param {[object]} aRemoveListeners The listeners to remove after emitting the event is finished
	 * @return {boolean} whether the event is allowed to be emitted for the given listener
	 * @private
	 */
	EventEmitter.prototype._emitPreperation = function(mListenerOptions, aRemoveListeners) {
		var bEmit = true;
		var iNumberOfAllowedEmits = mListenerOptions.numberOfAllowedEmits;
		if (typeof iNumberOfAllowedEmits !== "undefined") {
			if (iNumberOfAllowedEmits > 0) {
				mListenerOptions.numberOfAllowedEmits--;
				if (mListenerOptions.numberOfAllowedEmits === 0) {
					aRemoveListeners.push({
						listener: mListenerOptions.listener,
						context: mListenerOptions.context
					});
				}
			} else {
				bEmit = false;
			}
		}
		return bEmit;
	};

	/**
	 * Registers an event listener for a certain event name. It is not allowed to register an event listener twice.
	 *
	 * @param {string} sEventName The event name to register the listener for
	 * @param {function} fnListener The event listener function. Called when the event is emitted. Handler can return a promise when deferred actions are performed.
	 * @param {object} oContext The context of the listener function
	 */
	EventEmitter.prototype.on = function(sEventName, fnListener, oContext) {
		this._on(sEventName, fnListener, oContext);
	};

	/**
	 * Registers an event listener for a certain event name. The event listener is only called once when the event is emitted the next time.
	 *
	 * @param {string} sEventName The event name to register the listener for
	 * @param {function} fnListener The event listener function. Called when the event is emitted
	 * @param {object} oContext The context of the listener function
	 */
	EventEmitter.prototype.once = function(sEventName, fnListener, oContext) {
		this._on(sEventName, fnListener, oContext, 1);
	};

	/**
	 * Internal method to register an event listener for a certain event name.
	 *
	 * @param {string} sEventName The event name to register the listener for
	 * @param {function} fnListener The event listener function. Called when the event is emitted
	 * @param {object} oContext The context of the listener function
	 * @param {integer} [iNumberOfAllowedEmits] optional. If undefined endless emitts are allowed.
	 * @private
	 */
	EventEmitter.prototype._on = function(sEventName, fnListener, oContext, iNumberOfAllowedEmits) {
		if (this.hasListener(sEventName, fnListener, oContext)) {
			throw new Error("Listener for event '" + sEventName + "' is already registered");
		}
		var aListeners = this._mListeners[sEventName] = this._mListeners[sEventName] || [];

		aListeners.push({
			listener: fnListener,
			context: oContext,
			numberOfAllowedEmits: iNumberOfAllowedEmits
		});
	};

	/**
	 * Deregisters an event listener for a certain event name.
	 * @param {string} sEventName The event name the listener was registered for
	 * @param {function} fnListener The event listener function.
	 * @param {object} oContext The context of the listener function
	 */
	EventEmitter.prototype.off = function(sEventName, fnListener, oContext) {
		this._visitListeners(sEventName, function(aListeners, i) {
			aListeners.splice(i, 1);
			return false;
		}, fnListener, oContext);
	};

	/**
	 * Checks if any listeners are registered for a given event name.
	 *
	 * @param {string} sEventName The event name the listener was registered for
	 * @return {boolean} whether a listener is registered or not.
	 */
	EventEmitter.prototype.hasListeners = function(sEventName) {
		if (!this._mListeners) {
			throw new Error("EventEmitter constructor not called");
		}
		return this._mListeners[sEventName] && this._mListeners[sEventName].length > 0;
	};

	/**
	 * Checks if a listener is registered for a given event name.
	 *
	 * @param {string} sEventName The event name the listener was registered for
	 * @param {function} fnListener The event listener function.
	 * @param {object} oContext The context of the listener function
	 * @return {boolean} whether the listener is registered or not.
	 */
	EventEmitter.prototype.hasListener = function(sEventName, fnListener, oContext) {
		var bHasListener = false;
		this._visitListeners(sEventName, function() {
			bHasListener = true;
			return false;
		}, fnListener, oContext);
		return bHasListener;
	};

	/**
	 * Visits all listeners of a given event name.
	 *
	 * @param {string} sEventName The event name the listener was registered for
	 * @param {function} fnVisitor The visitor function which is called for each registered listener. Return "false" to break the loop.
	 * @param {function} [fnListener] Optional. The event listener function. When the event listener is given the visitor function is only called when the current visited listener equals the given one.
	 * @param {object} [oContext] Optional. The context of the listener function which need to match the current visited context.
	 * @private
	 */
	EventEmitter.prototype._visitListeners = function(sEventName, fnVisitor, fnListener, oContext) {
		var bHasListeners = this.hasListeners(sEventName);
		if (bHasListeners) {
			var aListeners = this._mListeners[sEventName];
			for (var i = 0; i < aListeners.length; i++) {
				var mOptions = aListeners[i];
				var fnRegisteredListener = mOptions.listener;
				var oRegisteredContext = mOptions.context;
				var bBreak = false;

				if (!fnListener) {
					bBreak = fnVisitor(aListeners, i, fnRegisteredListener, oRegisteredContext) === false;
				} else if (fnListener === fnRegisteredListener && oContext === oRegisteredContext) {
					bBreak = fnVisitor(aListeners, i, fnRegisteredListener, oRegisteredContext) === false;
				}

				if (bBreak) {
					break;
				}
			}
		}
		return bHasListeners;
	};

	// ======================
	// Metadata
	// ======================

	var Metadata = function(sName) {
		this._sName = sName;
	};

	Metadata.prototype.getName = function() {
		return this._sName;
	};
	
	
	var createFactoryModule = function(vImplements, sModule) {
        return  {
	        create : function(sName, mConfig) {
    		    mConfig = jQuery.extend(mConfig || {}, {
    			    "implements" : vImplements,
    			    "module" : sModule
    		    });
		        return this.context.create(sName, mConfig);
	        }
	    };
	};

	// ======================
	// Proxy
	// ======================

	// TODO Once ES6 Proxies are available for all major browsers we should refactor this class to use ES6 proxies

	/**
	 * Proxy Class. Only internal usage: new proxy objects must not be created with the constructor function!
	 *
	 * @param {string} sName
	 * @param {map} mConfig the configuration of the proxy consists of:
	 * module or className: mutually exclusive. The className is converted into a module path.
	 * implements: list of implemented interfaces
	 */
	var Proxy = function Proxy(sName, mConfig) {
		this._sName = sName;
		this._oImpl = null;
		this._oImplSync = null;
		this._mConfig = {
			"module": null,
			"className": null,
			"implements": null,
			"lazy": true
		};
		this._oInterface = null;
		
		if (mConfig.isFactory === true) {
		    var vImplements = mConfig.implements;
		    var sModule = mConfig.module;

            delete mConfig.isFactory;
		    mConfig.implements = "Factory";
		    mConfig.module = createFactoryModule(vImplements, sModule);
		}

		if (typeof mConfig === "string") {
			this._mConfig.className = mConfig;
		} else {
			_.assign(this._mConfig, mConfig);
		}
		this._oEventEmitter = this._mConfig.eventEmitter || null;
		this._mConfiguration = this._mConfig.configuration || null;
		this.context = this._mConfig.context || {}; // The context can be set external
		// TODO: Remove public context
		this._oContext = this.context;
		this._oContext.self = this._mConfig.self || this;

		var that = this;
		this._oContext.create = function(sName, mConfig) {
			mConfig.context = that._oContext;
			mConfig.lazy = mConfig.lazy === false ? false : true;
			// TODO remove the name
			return Proxy.create(sName, mConfig).then(function(oProxy) {
				return oProxy;
			});
		};

		// derive the module from the class name
		if (!this._mConfig.module && this._mConfig.className) {
			console.warn("Service '" + this._sName + "': Using the property 'className' is deprecated. Please use 'module' instead");
			this._mConfig.module = this._mConfig.className.replace(/\./g, "/");
		}

		this._oMetadata = new Metadata(this._sName);

		if (this.$isLazy()) {
			this.$ = function() {
				// Returns the non lazy proxy impl
				var that = this;
				return this._getImpl({}).then(function(oNonLazyProxy) {
					//ensure impl of non lazy proxy is loaded
					return oNonLazyProxy;
				});
			};
		}
	};

	/**
	 * Creates a new instance of a Proxy. This function returns a Promise because the
	 * creation of the Proxy happens asynchronously.
	 *
	 * @param sName {string} name of the Proxy
	 * @param mConfig {map} configuration object
	 * @return {object} Promise object which gets notified once the Proxy is created
	 */
	Proxy.create = function(sName, mConfig) {
		var oProxy = new Proxy(sName, mConfig);
		return oProxy.initialize();
	};

	Proxy.LIFECYCLE_METHODS = {
		"init": true,
		"configure": true
	};
	
	Proxy.LIFECYCLE_METHODS_TIMEOUT = 60000;

	Proxy.isLifecycleMethod = function(sMethod) {
		return this.LIFECYCLE_METHODS[sMethod];
	};

	Proxy.prototype.getProxyMetadata = function() {
		return this._oMetadata;
	};

	Proxy.prototype.instanceOf = function(sInterface) {
		return this._oInterface.hasInterface(sInterface);
	};

	Proxy.prototype.attachEvent = function(sEventName, fnListener, oContext) {
		this._getEventEmitter().on(sEventName, fnListener, oContext);
	};

	Proxy.prototype.attachEventOnce = function(sEventName, fnListener, oContext) {
		this._getEventEmitter().once(sEventName, fnListener, oContext);
	};

	Proxy.prototype.detachEvent = function(sEventName, fnListener, oContext) {
		this._getEventEmitter().off(sEventName, fnListener, oContext);
	};

	Proxy.prototype.initialize = function() {
		// Initialize can be only called once
		delete this.initialize;
		var vImplements = this._mConfig["implements"];
		var that = this;
		var aProms = [Interface.create(vImplements)];
		if (!this.$isLazy()) {
			aProms.push(this._getImpl({}));
		}
		return Q.all(aProms).spread(function(oInterface) {
			that._oInterface = oInterface;
			that._decorateProxyWithInterfaceMethods();
			that._mConfiguration = that._mConfiguration || oInterface.createConfigurationObject();
			that._injectEventsToContext();

			return that;
		}, function(oError) {
			that._error("Original error message: " + oError.message + "\nError stack: " + oError.stack + "\n -----------");
		});
	};

	/**
	 * Internal method to check if the proxy is lazy or not.
	 */
	Proxy.prototype.$isLazy = function() {
		return this._mConfig.lazy;
	};

	/**
	 * Internal method to retrieve the proxy interface.
	 */
	Proxy.prototype.$getInterface = function() {
		return this._oInterface;
	};

	Proxy.prototype.$configure = function(sConfigurationProperty, vValue) {
		if (this._oImpl && this._oImpl.isFulfilled()) {
			if (this.$isLazy()) {
				return this._invokeImplMethod("$configure", [sConfigurationProperty, vValue], true, {});
			} else {
				var mConfig = this._addToConfig(this._oInterface.createConfigurationObject(), sConfigurationProperty, vValue);
				return this._invokeImplMethod("configure", [mConfig], false, {});
			}
		} else {
			this._addToConfig(this._mConfiguration, sConfigurationProperty, vValue);
			return Q();
		}
	};

	Proxy.prototype._getEventEmitter = function() {
		if (!this._oEventEmitter) {
			this._oEventEmitter = new EventEmitter();
		}
		return this._oEventEmitter;
	};

	Proxy.prototype._addToConfig = function(mConfig, sConfigurationProperty, vValue) {
		if (this._oInterface.isConfigurationPropertyMultiple(sConfigurationProperty)) {
			if (!Array.isArray(vValue)) {
				this._error("Value for multiple configuration property '" + sConfigurationProperty + "' must be an array");
			}
			for (var i = 0; i < vValue.length; i++) {
				mConfig[sConfigurationProperty].push(vValue[i]);
			}
		} else {
			if (typeof this._mConfiguration[sConfigurationProperty] !== "undefined") {
				this._error("Non multiple property '" + sConfigurationProperty + "' is already set and can not be overriden by configuration");
			}

			mConfig[sConfigurationProperty] = vValue;
			this._mConfiguration[sConfigurationProperty] = vValue;
		}
		return mConfig;
	};

	/**
	 * Internal method to fire events.
	 */
	Proxy.prototype._fireEvent = function(sEventName, mEvent) {
		var oEvent = _.assign({
			params: {}
			// For implicit events:
			//,	args : []
			//, returnValue : undefined
			//, methodName : undefined
		}, mEvent, {
			source: this._oContext.self,
			name: sEventName
		});
		return this._getEventEmitter().emit(sEventName, oEvent);
	};

	/**
	 * Internal method to invoke a proxy method.
	 * @param {string} sMethod the method to invoke.
	 * @param {any} arguments any number of arguments which should be passed to the method call
	 */
	Proxy.prototype.$invoke = function(sMethod) {
		if (this.$isLazy()) {
			var aArgs = arguments;
			return this._getImpl({}).then(function(oImpl) {
				return oImpl.$invoke.apply(oImpl, aArgs);
			});
		}

		var that = this;

		if (Proxy.isLifecycleMethod(sMethod)) {
			this._error("Method is a lifecycle method. Do not call directly.", sMethod);
			return;
		}

		var aArgs = Array.prototype.slice.call(arguments, Constants.WATT_PREFIXED_ARGS_NUM());

		return this._invokeImplMethod(sMethod, aArgs, true);
	};

	Proxy.prototype._charToUpperCase = function(sString) {
		return sString && sString.length > 1 && (sString.slice(0, 1).toUpperCase() + sString.slice(1));
	};

	Proxy.prototype._invokeImplMethod = function(sMethod, aArgs, bThrowMethodNotImplementedError) {
		var that = this;
		return this._getImpl({}).then(function invokeMethodImplReturned(oImpl) {
			return that._invokeMethod(oImpl, sMethod, aArgs, bThrowMethodNotImplementedError);
		});
	};

	Proxy.prototype._invokeMethod = function(oImpl, sMethod, aArgs, bThrowMethodNotImplementedError) {
		bThrowMethodNotImplementedError = bThrowMethodNotImplementedError === false ? false : true;
		var that = this;
		var vValue = null;
		if (oImpl[sMethod]) {
			vValue = oImpl[sMethod].apply(oImpl, aArgs);

			// The returned value can either be a promise or standard type (e.g. for a sync call) or an array of promisses
			if (!Q.isPromise(vValue)) {
				if (vValue && vValue.constructor === Array && vValue.length > 0 && Q.isPromise(vValue[0]) ) {
					console.error("Warning: unhandeled promisses array");
					vValue = Q.all(vValue);
				} else {
					vValue = Q(vValue);
				}
			}
		} else if (bThrowMethodNotImplementedError) {
			//check for default implementation
			var oDefImpl = this._oInterface.getMethodDefaultReturnValue(sMethod);
			//Check if default implementation was provided
            if (oDefImpl) {
			     vValue = oDefImpl.default;
				//In case method return object -> clone it
				if (oDefImpl.type === "object") {
					vValue = jQuery.extend(true, {},vValue );
				}
				//Return default implementation
				oImpl[sMethod] = function() {
					return Q(vValue);
				};
			} else
			if (sap.watt.getEnv("devMode")) {
				that._error("Method: " + sMethod + " not implemented");
			} else {
				console.error("Method: " + sMethod + " not implemented");
				return Q();
			}
		}
		return vValue;
	};

	Proxy.prototype._callLifeCycleMethod = function(oImpl, sMethod, aArgs) {
		var that = this;
		return this._fireEvent("$before" + this._charToUpperCase(sMethod)).then(function() {
			return that._invokeMethod(oImpl, sMethod, aArgs, false);
		}).timeout(Proxy.LIFECYCLE_METHODS_TIMEOUT);
	};

	Proxy.prototype._getImplSync = function() {
		return this._oImplSync;
	};

	Proxy.prototype._getImpl = function() {
		// Lazy require of proxy implementation
		if (!this._oImpl) {
			var that = this;
			this._oImpl = this._createImplInstance().then(function(oImpl) {
				that._oImplSync = oImpl;
				return oImpl;
			});
		}
		return this._oImpl;
	};

	Proxy.prototype._createImplInstance = function() {
		var that = this;
		if (this._mConfig.factory) {
			return this._oContext.service[this._mConfig.factory].create(this._sName, {
				self: this._mConfig.self,
				eventEmitter: this._getEventEmitter(),
				configuration: this._mConfiguration
			});
		} else if (this.$isLazy()) {
			var mConfig = _.clone(this._mConfig);
			mConfig.lazy = false;
			mConfig.context = this._oContext;
			mConfig.self = this;
			mConfig.configuration = _.assign(this._mConfiguration, this._mConfig);
			mConfig.eventEmitter = this._getEventEmitter();
			return Proxy.create(this._sName, mConfig);
		} else {
			var vModule = this._mConfig.module;

			var createImplInstanceRequired = function(vModule) {
				var oModule = vModule;
				if (typeof vModule === "function") {
					oModule = new oModule();
				} else {
					if (oModule.__bProxyImplInUse) {
						that._error("Error loading " + vModule + ": Module instance is already in use. Please define module"
								+ " as a class by returning a function instead of an object");
					}
					oModule.__bProxyImplInUse = true;
				}
				oModule.context = that.context;
			    delete that.context;

				return that._callLifeCycleMethod(oModule, "init", null).then(function() {
					return that._callLifeCycleMethod(oModule, "configure", [ that._mConfiguration ]);
				}).then(function() {
					return oModule;
				});
			};
			
			if (typeof vModule === "string") {
			    return Q.sap.require(vModule).then(createImplInstanceRequired)["catch"](function(oError){
						that._error(oError.message + "\nError stack: " + oError.stack + "\n -----------");
					});
			} else {
			    return createImplInstanceRequired(vModule);
			}
			
		}
	};

	Proxy.prototype._error = function(sMessage, sMethod) {
		Proxy._error(sMessage, this._sName, sMethod);
	};

	Proxy.prototype._decorateProxyWithInterfaceMethods = function() {
		// Create the proxy methods
		var oInterface = this._oInterface;
		var mMethods = oInterface.getMethods();
		var aMethodsNames = Object.keys(mMethods);
		var length = aMethodsNames.length;
		for (var i = 0; i < length; i++) {
			var sMethod = aMethodsNames[i];
			if (!this[sMethod] && !Proxy.isLifecycleMethod(sMethod)) {
				var mMethod = mMethods[sMethod];
				var bAsync = mMethod.async === false ? false : true;
				var bLazy = this.$isLazy();
				if (bLazy || bAsync) {
					this[sMethod] = this._createAsyncProxyMethod(sMethod, mMethod);
				} else {
					this[sMethod] = this._createSyncProxyMethod(sMethod, mMethod);
				}
			} else {
				this._error("Interface method is not allowed as it is implemented by the proxy", sMethod);
			}
		}
	};

	Proxy.prototype._createSyncProxyMethod = function(sMethod, mMethod) {
		var that = this;
		var oImpl = that._getImplSync();
		var fMethod = this.decorateProxyMethod(oImpl[sMethod], sMethod, mMethod);

		return function() {
			return fMethod.apply(that, arguments);
		};
	};

	Proxy.prototype._createAsyncProxyMethod = function(sMethod, mMethod) {
		var that = this;
		var fMethod = this.decorateProxyMethod(that.$invoke, sMethod, mMethod);
		return function() {
			var aArgs = [sMethod, {}];
			aArgs = aArgs.concat(Array.prototype.slice.call(arguments));
			return fMethod.apply(that, aArgs);
		};
	};

	Proxy.prototype.decorateProxyMethod = function(_fnFunc, sMethod, mMethod) {

		var fnFunc = _fnFunc;
		if (mMethod.deprecated) {
			var sDeprecationText = "Service '" + this._sName + "': Method '" + sMethod + "' is deprecated";
			sDeprecationText += (mMethod.deprecated.since ? (" since " + mMethod.deprecated.since) : "");
			sDeprecationText += (mMethod.deprecated.until ? (" until " + mMethod.deprecated.until) : "");
			sDeprecationText += ". " + (mMethod.deprecated.description ? ("Description: " + mMethod.deprecated.description) : "");
			fnFunc = function() {
				console.warn(sDeprecationText);
				console.warn(DebugHooks.createStack(2));
				return _fnFunc.apply(this, arguments);
			};
		}

        if (sap.watt.getEnv("enableRuntimeChecks")) {
            var sServiceOrModule = _.isString(this._sName) ? this._sName : this._sName.module;
            fnFunc = RunTimeChecks.decorateFnWithTypeChecking(_fnFunc, sMethod, sServiceOrModule, mMethod.params, mMethod.returns);
        }

		return fnFunc;
	};

	Proxy.prototype._injectEventsToContext = function(aPlugins) {
		var oInterface = this._oInterface;
		var oEventEmitter = {};
		var mEvents = oInterface.getEvents();
		oEventEmitter.fire = this._createFireEventFunction(mEvents);
		var aEventsNames = Object.keys(mEvents);
		var length = aEventsNames.length;
		for (var i = 0; i < length; i++) {
			var sEvent = aEventsNames[i];
			oEventEmitter["fire" + this._charToUpperCase(sEvent)] = this._createFireSpecificEventFunction(sEvent);
		}
		this._oContext["event"] = oEventEmitter;
	};

	Proxy.prototype._createFireEventFunction = function(mEvents) {
		var that = this;
		return function(sEventName, mParams) {
			if (!mEvents[sEventName]) {
				that._error("The event '" + sEventName + "' is not declared in the interface");
			}
			return that._fireEvent(sEventName, {
				params: mParams
			});
		};
	};

	Proxy.prototype._createFireSpecificEventFunction = function(sEventName) {
		var that = this;
		return function(mParams) {
			return that._fireEvent(sEventName, {
				params: mParams
			});
		};
	};

	Proxy._error = function(sMessage, sName, sMethod) {
		// TODO: Should we only throw errors when IDE is in debug mode?
		var aMessage = [];
		if (sName) {
			aMessage.push("Name: " + sName);
		}
		if (sMethod) {
			aMessage.push("Method: " + sMethod);
		}
		if (sMessage) {
			aMessage.push("Message: " + sMessage);
		}
		throw new Error("Proxy: " + aMessage.join(" | "));
	};

	return Proxy;

});