define(["./Service", "./ServiceRegistry", "./Proxy", "./Interface", "./ConfigPreload", "./I18nBundle", "./Validations", "./ErrorMessages", "sap/watt/lib/lodash/lodash"], function
	(Service, ServiceRegistry, Proxy, Interface, oPreload, oI18nBundle, Validations, ErrorMessages, _) {
	"use strict";
	/**
	 * helper to merge the configuration (also merges Arrays which is not supported by jQuery.extend)
	 * @private
	 */
	function merge(o1, o2) {

		// TODO: right now this is a flat copy
		_.forEach(o2, function(oValue, sKey) {
			if (!o1[sKey]) {
				o1[sKey] = oValue;
			} else {
				if (Array.isArray(oValue)) {
					o1[sKey] = jQuery.merge(o1[sKey], oValue);
				} else {
					if (_.isPlainObject(oValue)) {
						o1[sKey] = merge(o1[sKey], oValue);
					} else {
						o1[sKey] = oValue;
					}
				}
			}
		});
		return o1;
	}

	function deprecationModuleCheck(sPluginName, sPluginModule) {
		// TODO Remove this check
		var bNameOk = true;
		var bModuleOk = true;
		var sPlugin = ".Plugin";
		if (sPluginName.indexOf(".Plugin") === sPluginName.length - sPlugin.length) {
			console.warn("Deprecation Warning: Wrong pattern for plugin 'name' " + sPluginName
					+ ". Please use a valid namespace, e.g. sap.watt.common.myplugin. "
					+ "To use a Plugin.js please define a 'module', e.g. 'module':'sap.watt.common.myplugin/Plugin.js");
			bNameOk = false;
		}
		if (sPluginModule && sPluginModule.indexOf("./") === 0) {
			console.warn("Deprecation Warning: Wrong pattern for plugin 'module' " + sPluginName
					+ ". To use a Plugin.js please define a 'module', e.g. "
					+ "'module':'sap.watt.common.myplugin/Plugin.js. If no module is needed, delete it.");
			bModuleOk = false;
		}
		return !bModuleOk && !bNameOk;
	}

	// ======================
	// ServiceRegistry
	// ======================

	var oServiceRegistry = new ServiceRegistry();
	Service.$setServiceRegistry(oServiceRegistry);

	// ======================
	// AssertsUtils singleton
	// ======================

	var oAssertUtils = {};

	/**
	 * @param mNameToPluginMetaData {Object.<string, Object>} plugin name to its JsonMetaData
	 * @returns {Object.<string, Array<string>>} a map of the actual issues found where the key is the plugin's name
	 * @private
	 */
	function assertConfiguredServicesAreRequiredOrProvided(mNameToPluginMetaData) {

		var mNameToConfiguredIssues = _.mapValues(mNameToPluginMetaData, function (oCurrMetaData) {
			return Validations.checkConfiguredServicesWhichAreNotRequiredOrProvided(oCurrMetaData);
		});

		var mNameToActualConfiguredIssues = _.omit(mNameToConfiguredIssues, function (aIssues) {
			return _.isEmpty(aIssues);
		});

		return mNameToActualConfiguredIssues;
	}

	oAssertUtils.assertConfiguredServicesAreRequiredOrProvided = assertConfiguredServicesAreRequiredOrProvided;

	/**
	 * @param mNameToPluginMetaData {Object.<string, Object>} plugin name to its JsonMetaData
	 * @param oServiceRegistry {ServiceRegistry}
	 * @returns {Object.<string, Array<string>>} a map of the actual issues found where the key is the plugin's name
	 * @private
	 */
	function assertAllRequiredAreInRegistry(mNameToPluginMetaData, oServiceRegistry) {
		var aProvidedServiceNames = oServiceRegistry.getAllServiceNames();
		var mNameToRequiredIssues = _.mapValues(mNameToPluginMetaData, function (oCurrMetaData) {
			return Validations.checkMissingRequiredServices(oCurrMetaData, aProvidedServiceNames);
		});

		var mNameToActualRequiredIssues = _.omit(mNameToRequiredIssues, function (aIssues) {
			return _.isEmpty(aIssues);
		});

		return mNameToActualRequiredIssues;
	}

	oAssertUtils.assertAllRequiredAreInRegistry = assertAllRequiredAreInRegistry;

	/**
	 * @param aPlugin {Plugin} the plugin to perform the assertions on
	 * @param oServiceRegistry {ServiceRegistry} the Service Registry to perform the assertions on
	 */
	function assertServicesDefinitionConsistency(aPlugin, oServiceRegistry) {
		var mNameToPluginMetaData = {};
		mNameToPluginMetaData[aPlugin.getMetadata().name] = aPlugin.getMetadata();

		var mProvidedIssues = assertConfiguredServicesAreRequiredOrProvided(mNameToPluginMetaData);
		var mRequiredIssues = assertAllRequiredAreInRegistry(mNameToPluginMetaData, oServiceRegistry);

		var aIssuesMessages = [];
		var sMsgHeader;
		if (!_.isEmpty(mProvidedIssues)) {
			aIssuesMessages.push(ErrorMessages.getErrorMessage_configured_but_not_required_or_provided(mProvidedIssues));
		}
		if (!_.isEmpty(mRequiredIssues)) {
			aIssuesMessages.push(ErrorMessages.getErrorMessage_missing_required_service(mRequiredIssues));
		}

		if (!_.isEmpty(aIssuesMessages)) {
			throw new Error("Problems detected while checking service definition consistency:\n" +
			aIssuesMessages.join("--------------------\n"));
		}
	}

	oAssertUtils.assertServicesDefinitionConsistency = assertServicesDefinitionConsistency;
	Object.freeze(oAssertUtils);

	// ======================
	// Plugin
	// ======================

	/**
	 * The class <code>Plugin</code> represents each Plugin in the PluginRegistry.
	 *
	 * @private
	 */
	var Plugin = function Plugin(oMetadata, oProxy) {
		this._oMetadata = oMetadata;
		this._baseURI = oMetadata.baseURI;
		this._oProxy = oProxy;
		this._oContext = oProxy ? oProxy.context : {};
		this._registerInterfaces();
	};

	/**
	 * Creates a new instance of a plugin which has been specified by its name.
	 *
	 * @param {string|object} vMetadata the url to the plugin metadata json file or plugin metadata object
	 * @return {object} the Promise object which receives the plugin instance
	 *
	 * @public
	 */

	Plugin.create = function(vMetadata, mExtensions) {

		var fnCreateInternal = function fnCreateInternal(mPluginMetadata) {
			if (mPluginMetadata.baseURI) {
				Plugin.registerRequirePath(mPluginMetadata.name, mPluginMetadata.baseURI);
			}

			var aExtensions = mExtensions && mExtensions[mPluginMetadata.name];
			var aPromises = [];
			(aExtensions || []).forEach(function(oExtensionURI) {
				var extensionURI = oExtensionURI.sURI.replace(/\/$/, "");
				aPromises.push(Plugin.loadMetadata(extensionURI, "plugin.ext.json"));
			});

			return Q.all(aPromises).then(function(aExtensions) {
				aExtensions.forEach(function(mExtension) {
					Plugin.registerRequirePath(mExtension.name, mExtension.baseURI);
					mPluginMetadata = Plugin.mergeMetadata(mPluginMetadata, mExtension);
				});

				var oPromise = Q();

				if (deprecationModuleCheck(mPluginMetadata.name, mPluginMetadata.module)) {
					oPromise = Proxy.create(mPluginMetadata.name, mPluginMetadata.name);
				} else if (mPluginMetadata.module) {
					oPromise = Proxy.create(mPluginMetadata.name, {
						module : mPluginMetadata.module
					});
				}

				return oPromise.then(function(oProxy) {
					// create the new plugin instance
					return new Plugin(mPluginMetadata, oProxy);
				});
			});
		};

		if (_.isString(vMetadata)) {
			// remove trailing slash from plugin path
			var sBaseURI = vMetadata.replace(/\/$/, "");
			return Plugin.loadMetadata(sBaseURI, "plugin.json").then(function(mMetadata) {
				return fnCreateInternal(mMetadata, sBaseURI);
			});
		} else {
			return fnCreateInternal(Plugin._ensureSections(vMetadata));
		}
	};

	Plugin._ensureSections = function(mMetadata, sBaseURI) {
		if (!mMetadata.name) {
			throw new Error("Failed to load metadata for Plugin " + sBaseURI + "! Reason: No plugin name given");
		}

		return jQuery.extend(true, {
			"baseURI" : sBaseURI,

			"requires" : {
				"services" : []
			},
			"provides" : {
				"services" : {},
				"interfaces" : {}
			},
			"configures" : {
				"services" : {}
			},
			"subscribes" : {}
		}, mMetadata);
	};

	Plugin.registerRequirePath = function(sPluginName, sURI) {
		var mConfig = {
			paths : {}
		};
		mConfig.paths[sPluginName] = sURI;
		require.config(mConfig);

		//TODO Should be delegated to UI5 loader
		jQuery.sap.registerModulePath(sPluginName, sURI);
	};

	Plugin.mergeMetadata = function(mTarget, mSource) {
		// Do not extend name / description / etc., only the following properties
		mTarget.requires.services = mTarget.requires.services.concat(mSource.requires.services);
		merge(mTarget.provides.services, mSource.provides.services);
		merge(mTarget.configures.services, mSource.configures.services);
		merge(mTarget.subscribes, mSource.subscribes);

		return mTarget;
	};

	Plugin.loadMetadata = function(sBaseURI, sFileName) {

		var sURI = sBaseURI + "/" + sFileName;

		var sPluginKey = oPreload.toInternalPath(sURI.replace(sFileName, "."));

		return oPreload.getPreload("plugins", sPluginKey).then(null, function() {
			//metadata from backend
			return Q(jQuery.ajax({
				url : sURI,
				dataType : "json"
			}).then(null, function(jqXHR, sTextStatus, oError) {
				// jQuery Promise
				return new Error("Failed to load metadata for Plugin " + sURI + "! Reason: " + sTextStatus + " " + jqXHR.statusText);
			}));
		}).then(function(mMetadata) {
			return Plugin._ensureSections(mMetadata, sBaseURI);
		});
	};

	Plugin.prototype.initServices = function(useAllSettled) {
		delete this.initServices;
		var aServicePromises = [];
		var mServices = this._getServiceMetadataFor("provides");
		
		_.forEach(mServices, function(mConfig, sServiceName) {
		    var oServicePromise = oServiceRegistry.register(sServiceName, mConfig);
		    aServicePromises.push(oServicePromise);
		});

        if (useAllSettled) {
           return Q.allSettled(aServicePromises); 
        }
        
		return Q.all(aServicePromises);
	};

	Plugin.prototype.initialize = function() {
		var that = this;
		return Q.fcall(function() {
			delete that.initialize;
			that._initI18n();
			that._initServiceContexts();
			that._initSubscribes();
			that._initServiceConfigurations();
		}).then(
				null,
				function(oError) {
					throw new Error("Error initializing plugin " + that._oMetadata.name + "\nOriginal error message: " + oError.message
							+ "\nError stack: " + oError.stack + "\n -----------");
				});
	};

	Plugin.prototype.getMetadata = function() {
		return this._oMetadata;
	};

	Plugin.prototype._registerInterfaces = function() {
		var mInterfaces = this._getInterfaceMetadata();
		_.forEach(mInterfaces, function(vInterface, sInterfaceName) {
			if (typeof vInterface === "string") {
				vInterface += ".json";
			}
			Interface.register(sInterfaceName, vInterface);
		});
	};

	Plugin.prototype._initServiceContexts = function() {
		// get required and provides services
		var aRequiredServices = this._getServiceMetadataFor("requires");
		var mProvidedServices = this._getServiceMetadataFor("provides");

		// create the "service" object
		var oServiceObjectForContext = this._createServiceObjectForContext(mProvidedServices, aRequiredServices);

		// inject the "service" member to the "context" of the Plugin Implementation Proxy for the Plugin
		//("context" is created in Proxy constructor already)
		this._oContext["service"] = oServiceObjectForContext;

		var that = this;
		// inject the "service" member to the "context" of each Service Implementation Proxy for each Service provided by the Plugin
		for (var sServiceName in mProvidedServices) {
			var oService = oServiceRegistry.get(sServiceName);
			oService.context["service"] = oServiceObjectForContext;
			oService.context["i18n"] = that._oContext["i18n"];
		}
	};

	Plugin.prototype._initI18n = function() {
		var mI18n = this.getMetadata().i18n;

		// create the "i18n" object
		var oI18nObjectForContext = this._createI18nObjectForContext(mI18n);
		// inject the "i18n" member to the "context" of the Plugin Implementation Proxy for the Plugin
		//("context" is created in Proxy constructor already)
		this._oContext["i18n"] = oI18nObjectForContext;
	};

	Plugin.prototype._initSubscribes = function() {
		var that = this;
		var mSubscribes = this.getMetadata()["subscribes"];
		_.forEach(mSubscribes || {}, function(vFunction, sEvent) {

			// split of the event and function (extract channel and view)
			var aEvent = sEvent.split(":"); // [channel:]event
			if (aEvent.length !== 2) {
				throw new Error("Event subscribtion needs to be of the following format: <service>:<eventName>, but is '" + sEvent + "'");
			}

			var oSourceProxy = oServiceRegistry.get(aEvent[0]);
			var sEventName = aEvent[1];

			if (typeof vFunction === "string") {
				vFunction = [ vFunction ];
			}

			vFunction.forEach(function(sFunction) {
				var sHandlerMethod, oTargetProxy;
				var aFunction = sFunction.split(":");
				if (aFunction.length === 1) { // target is the plugin
					sHandlerMethod = aFunction[0];
					oTargetProxy = that._oProxy;
					if (!oTargetProxy) {
						throw new Error(
								"Target service of event subscription is not available. Please define a plugin 'module' in the plugin.json of plugin: "
										+ that.getMetadata().name);
					}
				} else { // target is a service
					var sTargetService = aFunction[0];
					sHandlerMethod = aFunction[1];
					oTargetProxy = oServiceRegistry.get(sTargetService);

					// ensure event handling service belongs to subscribing plugin
					if (!that._oMetadata.provides || !that._oMetadata.provides.services
							|| !that._oMetadata.provides.services[sTargetService]) {
						throw new Error("An event handling service needs to be provided by the plugin that defines the subscription - "
								+ "Plugin: " + that._oMetadata.name + " - Service: " + sTargetService);
					}
				}

				if (sHandlerMethod) {
					var fnHandler = function(oData, mDebugHelp) {
						return oTargetProxy.$invoke(sHandlerMethod, mDebugHelp || {}, oData);
					};
					oSourceProxy.attachEvent(sEventName, fnHandler);
				}
			});
		});
	};

	Plugin.prototype._initServiceConfigurations = function() {
		var mServiceConfiguration = this._getServiceMetadataFor("configures");
		var that = this;
		// loop over all service configuration of oPlugin / there might be several services configured by oPlugin
		_.forEach(mServiceConfiguration || {}, function(vConfigurationValue, sServiceName) {
			// determine service name and configuration property
			var aConfigurationInfo = sServiceName.split(":");
			var sConfigurationProperty = null;
			if (aConfigurationInfo.length === 2) {
				sServiceName = aConfigurationInfo[0];
				sConfigurationProperty = aConfigurationInfo[1];
			} else {
				throw new Error("Service Configuration: Syntax error in configuration for service '" + sServiceName + "' in Plugin '"
						+ this.getMetadata().name + "'. No configuration property given.'");
			}
			// TODO default configuration property

			var oService = oServiceRegistry.get(sServiceName);
			// Todo: Should we move enrichServiceConfiguration to the proxy?
			oService.attachEventOnce("$beforeInit", function() {
				// enrich service configuration value and configure service
				return that._enrichServiceConfigurationValueAndConfigureService(sConfigurationProperty, vConfigurationValue, oService);
			});
		});
	};

	Plugin.prototype._configureAnonymousService = function(oService, mServiceConfiguration) {
		var that = this;
		var aPromises = [];
		_.forEach(mServiceConfiguration || {},
				function(vConfigurationValue, sConfigurationProperty) {
					// enrich service configuration value and configure service
					aPromises.push(that._enrichServiceConfigurationValueAndConfigureService(sConfigurationProperty, vConfigurationValue,
							oService));
				});
		return Q.all(aPromises);
	};

	Plugin.prototype._enrichServiceConfigurationValueAndConfigureService = function(sConfigurationProperty, vConfigurationValue, oService) {

		// enrich service configuration and configure service(proxy)
		return this._enrichServiceConfigurationValue(sConfigurationProperty, vConfigurationValue, oService).then(
				function configureService(vEnrichedConfigurationValue) {
					return oService.$configure(sConfigurationProperty, vEnrichedConfigurationValue);
				});
	};

	Plugin.prototype._enrichServiceConfigurationValue = function(sProperty, vValue, oService) {
		// TODO Do we have to move this to the proxy itself?
		var that = this;

		var oServiceInterface = oService.$getInterface();

		var sServiceName = oService.getProxyMetadata().getName() || "anonymous";

		if (!oServiceInterface.hasConfigurationProperties()) {
			throw new Error("Service configuration: No configuration defined for '" + sServiceName
					+ "'. Please define the configuration in the interface");
		}

		var mServiceConfiguration = oServiceInterface.getConfigurationProperties();
		var mConfiguration = mServiceConfiguration[sProperty];
		if (!mConfiguration) {
			throw new Error("Service Configuration: Configuration property '" + sProperty + "' not defined in configuration for service '"
					+ sServiceName + "' in Plugin '" + this.getMetadata().name + "'.'");
		}
		var vType = mConfiguration.type;

		var aServicePromises = [];
		if (oServiceInterface.isConfigurationPropertyMultiple(sProperty)) {
			if (Array.isArray(vValue)) {
				aServicePromises = vValue.map(function(vConfigItem, iIndex) {
					return that._enrichServiceConfigurationValueByType(vType, vConfigItem, oServiceInterface).then(
							function(vResult) {
								vValue[iIndex] = vResult;
							});
				});
			} else {
				throw new Error("Service configuration: Multiple configuration property '" + sProperty + "' of service '" + sServiceName
						+ "' needs to be an array");
			}
		} else {
			aServicePromises.push(this._enrichServiceConfigurationValueByType(vType, vValue, oServiceInterface).then(function(vResult) {
				vValue = vResult;
			}));
		}

		return Q.all(aServicePromises).then(function() {
			return vValue;
		});
	};

	Plugin.prototype._enrichServiceConfigurationValueByType = function(vType, vValue, oServiceInterface) {
		var that = this;
		var aServicePromises = [];

		if (vValue === null || vValue === undefined) { // right now we do not have optional parameters, so return when null or undefined
			return Q(vValue);
		}

		if (oServiceInterface.isComplexType(vType)) {
			if (Array.isArray(vType)) { // array of complex type
				var mType = vType[0];
				aServicePromises = vValue.map(function(vItem, iIndex) {
					return that._enrichServiceConfigurationValueByType(mType, vItem, oServiceInterface).then(
							function(vResult) {
								vValue[iIndex] = vResult;
							});
				});
			} else {
				_.forEach(vType, function(vTypeOrDescriptor, vIndexOrProperty) { // complex type
					var sType = vTypeOrDescriptor;
					if (_.isPlainObject(vTypeOrDescriptor)) { // is type descriptor
						sType = vTypeOrDescriptor.type;
					}
					aServicePromises.push(that._enrichServiceConfigurationValueByType(sType, vValue[vIndexOrProperty], oServiceInterface)
							.then(function(vResult) {
								vValue[vIndexOrProperty] = vResult;
							}));
				});
			}
		} else if (oServiceInterface.isProxyType(vType)) {
			aServicePromises.push(this._getServiceByConfigurationValue(vValue, vType).then(function(oService) {
				vValue = oService;
			}));
		} else {
			// simple type - get the text from the resource bundle
			vValue = this._getTextFromResourceBundle(vValue);
		}
		return Q.all(aServicePromises).then(function() {
			return vValue;
		});
	};

	Plugin.prototype._getServiceByConfigurationValue = function(vValue, vType) {
		var that = this;
		if (typeof vValue === "string" && vValue.indexOf("@") === 0) {
			// Get the service from the service registry and remember it
			var sServiceName = vValue.substring(1);
			var oService = oServiceRegistry.get(sServiceName);
			if (oService.instanceOf("Factory") && vType !== "Factory") {
				return oService.create().then(function(oCreatedService) {
					return oCreatedService;
				});
			} else {
				return Q(oService);
			}
		} else {
			// Create anonymous/inline service ...
			// distinguish between vValue = ServiceModule and vValue = Service Descriptor
			// Service Descriptor - Config object of Service Proxy(see JSDoc of Proxy) + "configuration":
			var mServiceConfig;
			var mProxyConfig = {};
			if (_.isString(vValue)) {
				mProxyConfig.implements = vType;
				if (vValue.indexOf("/") != -1) {
					mProxyConfig.module = vValue;
				} else {
					mProxyConfig.className = vValue;
				}
			} else {
				mProxyConfig = vValue;
				mServiceConfig = vValue.configuration;
				delete mProxyConfig.configuration;

				// if mProxyConfig.implements is not defined in the configuration usage, take it from configuration definition in the interface
				if (!mProxyConfig.implements || mProxyConfig.implements === "") {
					mProxyConfig.implements = vType; //TODO: consider extensions
				}
			}

			if (mProxyConfig.factory) {
				var sServiceName = mProxyConfig.factory.substring(1);
				var oService = oServiceRegistry.get(sServiceName);
				return oService.create().then(function(oCreatedService) {
					return that._configureAnonymousService(oCreatedService, mServiceConfig).then(function() {
						return oCreatedService;
					});
				});
			} else {
				return Proxy.create(vValue, mProxyConfig).then(function(oCreatedService) {
					// ... set configuration ...
					return that._configureAnonymousService(oCreatedService, mServiceConfig).then(function() {
						// ... and remember it
						oCreatedService.context.service = that._oContext.service;
						oCreatedService.context.i18n = that._oContext.i18n;
						return oCreatedService;
					});
				});
			}
		}
	};

	Plugin.prototype._createServiceObjectForContext = function(mProvidedServices, aRequiredServices) {
		//creates the object to be injected to the "context" as "service"
		// Create a copy of the array, so that we do not work on the reference and polute it
		var aAllService = aRequiredServices.slice(0);
		for (sServiceName in mProvidedServices) {
			aAllService.push(sServiceName);
		}

		var oServiceObjectForContext = {};
		var sServiceName = ""; //might have a namespace
		var oService = null;

		for ( var i = 0; i < aAllService.length; i++) {
			sServiceName = aAllService[i];
			oService = oServiceRegistry.get(sServiceName);
			this._setObjectValue(oServiceObjectForContext, sServiceName, oService);
		}

		return oServiceObjectForContext;

	};

	Plugin.prototype._setObjectValue = function(oObject, sKeyWithNamespace, oValue) {
		var sKey = sKeyWithNamespace;
		if (sKey.indexOf(".") != -1) {
			// handling of namespaces, create respective objects, in case they do not exist
			var aNameParts = sKey.split(".");
			for ( var i = 0; i < aNameParts.length - 1; i++) {
				oObject[aNameParts[i]] = oObject[aNameParts[i]] || {};
				oObject = oObject[aNameParts[i]];
			}
			// as the loop is now at the last entry of the array, use this entry as the current key
			sKey = aNameParts[i];
		}
		oObject[sKey] = oValue;
	};

	Plugin.prototype._getServiceMetadataFor = function(sSection) {
		return this.getMetadata()[sSection].services;
	};

	Plugin.prototype._getInterfaceMetadata = function() {
		return this.getMetadata().provides.interfaces;
	};

	Plugin.prototype._createI18nObjectForContext = function(mI18n) {
		return mI18n ? new oI18nBundle(mI18n) : null;
	};

	Plugin.prototype._getTextFromResourceBundle = function(vValue) {
		if (typeof vValue === "string" && vValue.indexOf(">") > 1) {
			var aComp = vValue.match(/{(.+)>(.+)}/);
			if (aComp.length === 3) {
				var sBundle = aComp[1];
				var sKey = aComp[2];
				vValue = this._oContext.i18n.getText(sBundle, sKey);
			}
		}
		return vValue;
	};

	// ======================
	// PluginRegistry
	// ======================

	/**
	 * The class <code>PluginRegistry</code> is the registry for all plugins.
	 *
	 * @public
	 */
	var PluginRegistry = function () {
		this._mRegistry = {};
		this._assertUtils = oAssertUtils;
	};

	PluginRegistry.prototype.$getServiceRegistry = function() {
		return oServiceRegistry;
	};

	/**
	 * @param aAllPluginsToRegister {Array.<string|Object>} plugin names or descriptors
	 * @param mPluginExtensions
	 * @return {Array.<Plugin>} required plugins which have been successfully registered
	 */
	PluginRegistry.prototype.register = function(aAllPluginsToRegister, mPluginExtensions) {
		return this._registerMain(aAllPluginsToRegister, mPluginExtensions).then(function(oRegiResults){
			return oRegiResults.required.successes;
		}) ;
	};

	 /**
	 * @param aAllPluginsToRegister {Array.<string|Object>} plugin names or descriptors
	 * @param mPluginExtensions
	 * @return {{required: {successes : Array.<Plugin>,
	 *                      failures: Array.<Object>},
	 *
	 *           notRequired: {successes : Array.<Plugin>,
	 *                         failures: Array.<Object>}}}
	 */
	 PluginRegistry.prototype.registerWithFullDetails = function(aAllPluginsToRegister, mPluginExtensions) {
		return this._registerMain(aAllPluginsToRegister, mPluginExtensions);
	 };


	/**
	 * @param aAllPluginsToRegister {Array.<string|Object>} plugin names or descriptors
	 * @param mPluginExtensions
	 * @return {{required: {successes : Array.<Plugin>,
	 *                      failures: Array.<Object>},
	 *
	 *           notRequired: {successes : Array.<Plugin>,
	 *                         failures: Array.<Object>}}}
	 */
	PluginRegistry.prototype._registerMain = function(aAllPluginsToRegister, mPluginExtensions) {
		var aNotRequiredPluginsConfigs = _.where(aAllPluginsToRegister, {"required": false});
		var aRequiredPluginConfigs = _.difference(aAllPluginsToRegister, aNotRequiredPluginsConfigs);

		var that = this;
		return that._createPlugins(aRequiredPluginConfigs, mPluginExtensions).then(function(aRequiredPlugins) {
			if (!_.isEmpty(aRequiredPlugins.failures)) {
				var errMsg = _createIssuesDetailedMsgInfoFromState(aRequiredPlugins.failures);
				throw new Error("failure during creation of required plugins ->\n" + errMsg);
			}

			return that._createPlugins(aNotRequiredPluginsConfigs, mPluginExtensions).then(function(aNotRequiredPlugins) {
				if (!_.isEmpty(aNotRequiredPlugins.failures)) {
					console.log("failure during creation of required plugins");
					console.log(_createIssuesDetailedMsgInfoFromState(aNotRequiredPlugins.failures));
				}
				// remove failed not required plugins from plugin registry
				that._removeFailedPluginsFromPluginRegistry(aNotRequiredPlugins.failures);
				
				return {
					required: {
						successes: aRequiredPlugins.successes,
						failures: aRequiredPlugins.failures
					},
					notRequired: {
						successes: aNotRequiredPlugins.successes,
						failures: aNotRequiredPlugins.failures
					}
				};
			});
		});
	};
	
	PluginRegistry.prototype._removeFailedPluginsFromPluginRegistry = function(failedPlugins) {
		var that = this;
		
		_.forEach(failedPlugins, function(failedPlugin) {
			delete that._mRegistry[failedPlugin.baseURI];
		});
	};

	PluginRegistry.prototype._createPlugins = function(aPluginConfigs, mPluginExtensions) {
		if (_.isEmpty(aPluginConfigs)) {
			return Q({successes: [], failures: []});
		}

		var that = this;
		return that._registerPlugins(aPluginConfigs, mPluginExtensions).then(function(oRegiResults) {
			return that._initServices(oRegiResults.successes).then(function(oInitResults) {
				return that._verifyPluginsServices(oInitResults.successes).then(function(oVerifyResults) {
					return that._initPlugins(oVerifyResults.successes).then(function(oInitPluginsResult) {
						var aAllFailures = oInitPluginsResult.failures.concat(
							oRegiResults.failures, oInitResults.failures, oVerifyResults.failures);
						return {successes: oInitPluginsResult.successes, failures: aAllFailures};
					});
				});
			});
		});
	};
    
    function _addFailedPluginDetails(aPlugins, aSettledPluginPromises) {
    	for (var i = 0; i < aSettledPluginPromises.length; i++) {
		    var oSettledPromise = aSettledPluginPromises[i];
		    if (oSettledPromise.state === "rejected") {
		        var oPlugin = aPlugins[i];
		        if (oPlugin.sURI) {
		            oSettledPromise.baseURI = oPlugin.sURI;
		        } else {
		            oSettledPromise.name = oPlugin.getMetadata().name;
		            oSettledPromise.description = oPlugin.getMetadata().description;
		            oSettledPromise.baseURI = oPlugin.getMetadata().baseURI;
		        }
		    }
		}
	}

	PluginRegistry.prototype._registerPlugins = function(aPluginConfigs, mPluginExtensions) {
		if (_.isEmpty(aPluginConfigs)) {
			return Q({successes: [], failures: []});
		}
		
		var aRegisterPromises = _.map(aPluginConfigs, function(vCurrPlugin) {
			var sPluginUri;
			if (_.isPlainObject(vCurrPlugin) && vCurrPlugin.sURI) {
				sPluginUri = vCurrPlugin.sURI;
			} else {
				sPluginUri = vCurrPlugin;
			}
			return this._register(sPluginUri, mPluginExtensions);
		}, this);
        
		return Q.allSettled(aRegisterPromises).then(function(aSettledPluginPromises) {
		    _addFailedPluginDetails(aPluginConfigs, aSettledPluginPromises);

			var mGroupedByState = _.groupBy(aSettledPluginPromises, function(oCurrSettledPromise) {
				return oCurrSettledPromise.state;
			});
			var aFulfilledStates = mGroupedByState.fulfilled ? mGroupedByState.fulfilled : [];
			var aRejectedStates = mGroupedByState.rejected ? mGroupedByState.rejected : [];
			var aSuccessful = _.collect(aFulfilledStates, "value");
			
			return {successes: aSuccessful, failures: aRejectedStates};
		});
	};

	PluginRegistry.prototype._verifyPluginsServices = function(aPlugins) {
		if (_.isEmpty(aPlugins)) {
			return Q({successes: [], failures: []});
		}

		var that = this;
		var aPluginPromises = _.map(aPlugins, function(aCurrPlugin) {
			return Q.fcall(function() {
				assertServicesDefinitionConsistency(aCurrPlugin, that.$getServiceRegistry());
			});
		}, this);

		return Q.allSettled(aPluginPromises).then(function(aSettledPluginPromises) {
			return _buildCreationStepResult(aPlugins, aSettledPluginPromises);
		});
	};

	PluginRegistry.prototype._initServices = function(aPlugins) {
		if (_.isEmpty(aPlugins)) {
			return Q({successes: [], failures: []});
		}

		var aInitPromises = _.map(aPlugins, function(oCurrPlugin) {
			return Q(oCurrPlugin).invoke("initServices").then(function() {
				console.log("READY: " + oCurrPlugin.getMetadata().name);
			});
		}, this);

		return Q.allSettled(aInitPromises).then(function(aSettledPluginPromises) {
			return _buildCreationStepResult(aPlugins, aSettledPluginPromises);
		});
	};

	PluginRegistry.prototype._initPlugins = function(aPlugins) {
		if (_.isEmpty(aPlugins)) {
			return Q({successes: [], failures: []});
		}

		var aInitPromises = _.map(aPlugins, function(oCurrPlugin) {
			return oCurrPlugin.initialize();
		});

		return Q.allSettled(aInitPromises).then(function(aSettledPluginPromises) {
			return _buildCreationStepResult(aPlugins, aSettledPluginPromises);
		});
	};

	PluginRegistry.prototype._register = function(sPluginUri, mPluginExtensions) {
        if (this._mRegistry[sPluginUri]) {
            var deferred = Q.defer();
            deferred.reject(new Error("Plugin " + sPluginUri + " is already registered"));
            return deferred.promise;
        }

		var that = this;

		console.log("CREATE: " + sPluginUri);
		return Plugin.create(sPluginUri, mPluginExtensions).then(function(oPlugin) {
			// register the plugin
			that._mRegistry[sPluginUri] = oPlugin;
			return oPlugin;
		});
	};

	PluginRegistry.prototype.get = function(sPlugin) {
		var oPlugin = this._mRegistry[sPlugin];
		if (!oPlugin) {
			jQuery.sap.log.error("Plugin not registered", sPlugin);
		}
		return oPlugin && oPlugin.getMetadata();
	};
	
	function _buildCreationStepResult(aPlugins, aSettledPluginPromises) {
	     _addFailedPluginDetails(aPlugins, aSettledPluginPromises);
	     
		var aSuccessfulPlugins = _.filter(aPlugins, function(aCurrPlugin, nCurrIdx) {
			return aSettledPluginPromises[nCurrIdx].state === "fulfilled";
		});
		var aRejectedStates = _.filter(aSettledPluginPromises, function(oCurrSettledPromise) {
			return oCurrSettledPromise.state === "rejected";
		});

		return {successes: aSuccessfulPlugins, failures: aRejectedStates};
	}

	function _createIssuesDetailedMsgInfoFromState(aFailures) {
		var sErrMsg = _.reduce(aFailures, function(sFullErrorMsg, currFailureInfo) {
			return sFullErrorMsg + "\n" + currFailureInfo.reason.stack;
		}, "");
		return sErrMsg;
	}

	return new PluginRegistry();
});
