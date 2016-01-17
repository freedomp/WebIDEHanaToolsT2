define([ "./PluginRegistry", "./Interface", "./ConfigPreload" ], function(PluginRegistry, Interface, oPreload) {
	"use strict";
	var oCoreDeferred = Q.defer();
	var oCore = null;
	//Usage of this promise is delayed, so finalize it
	oCoreDeferred.promise.done();

	/**
	 * Core of the IDE Framework - starts the services
	 */
	var Core = {
		_bStarted : false,
		_oContext : null,

		start : function(mConfig) {
			var that = this;
			this._oContext = that.context;

			// register the configured plugins
			if (this._bStarted) {
				throw new Error("Core can only be started once");
			}
			this._bStarted = true;
			return PluginRegistry.registerWithFullDetails(mConfig.plugins, mConfig.pluginExtensions).then(function(oRegiResults) {
				return that.context.event.fireStarted().then(function(){
					return oRegiResults;
				});
			});
		},

		getService : function() {
			return oCoreDeferred.promise;
		}
	};

	// TODO: Describe this interface an the service in a plugin.json and Register in PluginRegistry
	Interface.register("sap.watt.core.Core", {
		"methods" : {
			"start" : {},
			"getService" : {}
		},
		"events" : {
			"started" : {},
			"allPluginsStarted" : {}
		}
	});

	Interface.register("sap.watt.core.Config", {
		"methods" : {
			"load" : {}
		}
	});

	Interface.register("Factory", {
		"description" : "The service factory service",

		"methods" : {
			"create" : {}
		}
	});

	// we register the basic services
	Core.startup = PluginRegistry.$getServiceRegistry().register("core", {
		"module" : "sap/watt/core/Core",
		"implements" : "sap.watt.core.Core"
	}).then(function(oCoreService) {
		oCore = oCoreService;
		oCoreDeferred.resolve(oCore);
		return PluginRegistry.$getServiceRegistry().register("config", {
			"module" : "sap/watt/core/Config",
			"implements" : "sap.watt.core.Config"
		});
	}).then(function(oConfig) {

		// load the configuration and pre-loading
		var oPluginJSONPreloading = oPreload.loadPreload(location.origin + "/" +  sap.watt.getEnv("base_path") + "sap/watt/config-preload.json");
		//TODO Preload language bundles once languages are supported
		var oI18nPreloadingNoLanguage = oPreload.loadJSPreload("sap/watt/i18n/config-preload");
		var oJSPreloading = oPreload.loadJSPreload("sap/watt/config-preload");

		return Q.all([ oConfig.load(), oPluginJSONPreloading, oI18nPreloadingNoLanguage, oJSPreloading]);

	}).then(function(aArgs) {

		// initialize the core
		var mConfig = aArgs[0];
		return oCore.start(mConfig);

	});

	Core.startup.then(function (oPluginRegiResults) {
		Core._oContext.event.fireAllPluginsStarted({"params": oPluginRegiResults.notRequired.failures}).then(
			function () {
				if (sap.watt.getEnv("iframeMode")) {
					var myIFrameID = window.frameElement.id;
					var parent = window.parent;
					var deferredStartupPromise = parent.WEB_IDE_DEFERRED[myIFrameID];
					deferredStartupPromise.resolve(PluginRegistry);
				}
			}).done();
	}).done();

	return Core;
});