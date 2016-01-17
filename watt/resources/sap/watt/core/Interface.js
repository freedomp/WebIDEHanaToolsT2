define([ "./ConfigPreload", "sap/watt/lib/lodash/lodash" ], function(oPreload, _) {
	"use strict";
	var Interface = function(vInterfaces) {
		this._vInterfaces = vInterfaces;
		this._mInterfaces = {};

		this._mConfigurationProperties = {};
		this._mEvents = {};
		this._mMethods = {};
	};

	Interface.mInterfaces = {};

	Interface.create = function(vInterfaces) {
		var oInterface = new Interface(vInterfaces);
		return oInterface.initialize();
	};

	Interface.register = function(sName, vInterface) {
		if (typeof vInterface === "string") {
			vInterface = require.toUrl(vInterface);
		}
		if (Interface.mInterfaces[sName]) {
			return new Error("Interface " + sName + " has been provided twice!");
		}
		Interface.mInterfaces[sName] = vInterface;
	};

	Interface.SUPPORTED_TYPES = {
		"string": true,
		"number": true,
		"boolean": true,
		"object": true,
		"[string]": true,
		"[number]": true,
		"[boolean]": true,
		"[object]": true
	};

	/**
	 * Loads an interface file
	 *
	 * @param {string} sInterface the interface namespace
	 * @return {Promise} the promise which will be resolved by the loaded interface object
	 */
	Interface.load = function(sInterface) {
		var mInterfaces = Interface.mInterfaces;
		var vInterface = mInterfaces[sInterface];
		if (!vInterface) {
			var sModule = sInterface.replace(/\./g, "/");
			vInterface = require.toUrl(sModule) + ".json";
			console.warn("Deprecation Warning: The interface '" + sInterface +
				"' is not provided. Please provide the interface in a plugin.json file");
		}
		if (_.isString(vInterface)) {
			// interface not yet loaded -> load it
			return oPreload.getPreload("interfaces", sInterface).then(null, function() {
				return Q(jQuery.ajax({
					url: vInterface,
					dataType: "json"
				}).then(function(mInterface) {
					return mInterface;
				}, function() {
					return new Error("Cannot parse interface '" + sInterface + "' from path '" + vInterface + "'");
				}));

			}).then(function(mInterface) {
				return mInterfaces[sInterface] = mInterface;
			});
		} else {
			return Q(vInterface);
		}
	};

	Interface.prototype.initialize = function() {
		var that = this;
		delete this.initialize;
		return this._loadInterfaces(this._vInterfaces).then(function() {
			return that;
		});
	};

	Interface.prototype.createConfigurationObject = function() {
		var mConfig = this.getConfigurationProperties();
		var mConfigObject = {};
		for (var sKey in mConfig) {
			var mConfigProperty = mConfig[sKey];
			var vValue = undefined;
			if (mConfigProperty.multiple) {
				vValue = [];
			}
			mConfigObject[sKey] = vValue;
		}
		return mConfigObject;
	};

	Interface.prototype.isConfigurationPropertyMultiple = function(sProperty) {
		return this.getConfigurationProperties()[sProperty].multiple;
	};

	Interface.prototype.isSimpleType = function(vType) {
		//true for: simple type and array of simple type
		return typeof vType === "string" && Interface.SUPPORTED_TYPES[vType];
	};

	Interface.prototype.isComplexType = function(vType) {
		//true for: complex type and array of complex type
		return Array.isArray(vType) || _.isPlainObject(vType);
	};

	Interface.prototype.isProxyType = function(vType) {
		return !this.isSimpleType(vType) && !this.isComplexType(vType);
	};

	Interface.prototype.hasConfigurationProperties = function() {
		return isNotEmpty(this.getConfigurationProperties());
	};

	Interface.prototype.getConfigurationProperties = function() {
		return this._mConfigurationProperties;
	};

	Interface.prototype.hasMethods = function() {
		return isNotEmpty(this.getMethods());
	};

	Interface.prototype.getMethods = function() {
		return this._mMethods;
	};

	Interface.prototype.hasEvents = function() {
		return isNotEmpty(this.getEvents());
	};

	Interface.prototype.getEvents = function() {
		return this._mEvents;
	};

	Interface.prototype.hasInterfaces = function() {
		return isNotEmpty(this._mInterfaces);
	};

	Interface.prototype.hasInterface = function(sInterface) {
		return !!this._mInterfaces[sInterface];
	};

	Interface.prototype.getMethodDefaultReturnValue = function(sMethod) {
		if (typeof this._mMethods[sMethod].returns === 'undefined' ) {
			return false;
		} else {
			return {
				type: this._mMethods[sMethod].returns.type,
				default: this._mMethods[sMethod].returns.default
			};
		}
	};

	Interface.prototype._loadInterfaces = function(vInterfaces, mInterfaceChain) {
		var that = this;

		mInterfaceChain = mInterfaceChain || {};
		var aInterfaces = [];
		// convert vInterfaces to array
		if (typeof vInterfaces === "string") {
			aInterfaces.push(vInterfaces);
		} else if (Array.isArray(vInterfaces)) {
			aInterfaces = vInterfaces;
		}

		var aPromises = aInterfaces.map(function(sInterface) {
			//Recursion detection
			if (mInterfaceChain[sInterface]) {
				return new Error("Interface " + sInterface + " inherits from itself");
			}
			var _mInterfaceChain = _.clone(mInterfaceChain);
			_mInterfaceChain[sInterface] = true;

			var oPromise = Interface.load(sInterface).then(function afterInterfaceLoaded(mInterface) {
				if (mInterface.extends) {
					// The interface extends other interfaces, load them
					return that._loadInterfaces(mInterface.extends, _mInterfaceChain).then(function afterInterfaceExtensionsLoaded() {
						return mInterface;
					});
				} else {
					return mInterface;
				}
			});
			// remember the promise so that the interfaces are loaded in parallel
			return oPromise;
		});

		return Q.all(aPromises).then(function(aLoadedInterfaces) {
			aInterfaces.forEach(function(sInterface, iIndex) {
				if (!that._mInterfaces[sInterface]) {
					// ... remember the interface
					var mInterface = aLoadedInterfaces[iIndex];
					that._mInterfaces[sInterface] = mInterface;
					// ... and merge the interface
					that._mergeInterface(mInterface);
				}
			});
		});
	};

	Interface.prototype._mergeInterface = function(mInterface) {
		this._mergeInterfaceSection("_mConfigurationProperties", "configurationProperties", mInterface);
		this._mergeInterfaceSection("_mEvents", "events", mInterface);
		this._mergeInterfaceSection("_mMethods", "methods", mInterface);
	};

	Interface.prototype._mergeInterfaceSection = function(sMember, sSection, mInterface) {
		var mSection = mInterface[sSection];
		if (mSection) {
			for (var sKey in mSection) {
				if (!this[sMember][sKey]) {
					this[sMember][sKey] = mSection[sKey];
				} else {
					return new Error("Error during merging interface '" + mInterface.name + "': The key '" + sKey + "' in section '"
							+ sSection + "' is already defined by another interface");
				}
			}
		}
	};
	function isNotEmpty(obj) {
		return !_.isEmpty(obj);
	}
	return Interface;
});