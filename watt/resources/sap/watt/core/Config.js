define(["sap/watt/lib/lodash/lodash"], function (_) {
	"use strict";

	function mergeConfig(mTarget, mSource) {
		if (mSource.plugins) {
			mTarget.plugins = mTarget.plugins.concat(mSource.plugins);
		}

		if (mSource.pluginExtensions) {
			_.forEach(mSource.pluginExtensions, function (pluginExtension, sPlugin) {
				var vExtension = Array.isArray(pluginExtension) ? pluginExtension : [pluginExtension];
				mTarget.pluginExtensions[sPlugin] = (mTarget.pluginExtensions[sPlugin] || []).concat(vExtension);
			});
		}

		return mTarget;
	}

	function getURI(sURI, sBaseURI) {
		return new URI(sURI).absoluteTo(sBaseURI).query("").toString();
	}

	// 	var requiredResourcesPath = (function() {
	// 	    var resourcesBasePath = new URI(sap.watt.getEnv("base_path")).absoluteTo(document.baseURI); 

	// 	    return resourcesBasePath.query("").href();
	// 	}());

	// returns plugin object and "required" parameter initialized to true or false 
	function createPluginConfigurationObject(mConfig, oPlugin, sURI) {
		var oPluginConfig;
		// in case oPlugin is a json object with path, version and other parameters
		if (_.isPlainObject(oPlugin)) {
			oPluginConfig = oPlugin;
			oPluginConfig.sURI = getURI(oPlugin.path, sURI);
		} else {
			oPluginConfig = {};
			oPluginConfig.sURI = getURI(oPlugin, sURI);
		}
		// set plugin required parameter

		if (typeof mConfig.required === "boolean") { // plugin's config.json has a required parameter
			oPluginConfig.required = mConfig.required;
		} else if (typeof oPlugin.required === "boolean") { // plugin has a required parameter
			oPluginConfig.required = oPlugin.required;
			//     } else if (oPluginConfig.sURI.indexOf(requiredResourcesPath) === 0) {
			//  oPluginConfig.required = true;
		} else {
			oPluginConfig.required = false;
		}

		return oPluginConfig;
	}

	function rewriteURIsInConfig(mConfig, sURI) {
		mConfig.plugins = mConfig.plugins && mConfig.plugins.map(function (sPlugin) {
				return createPluginConfigurationObject(mConfig, sPlugin, sURI);
			});
		_.forEach(mConfig.pluginExtensions || {}, function (sExtension, sPlugin) {
			if (typeof sExtension != "string") {
				throw new Error("Failed to load config file: " + sURI + "! Reason: Plugin extension definition for plugin '" + sPlugin +
					"' needs to be of type string");
			}
			mConfig.pluginExtensions[sPlugin] = createPluginConfigurationObject(mConfig, sExtension, sURI);
		});
		return mConfig;
	}

	/**
	 * loads the configuration from a configuration file
	 * @param {string} sURI the URI of the configuration file
	 * @private
	 */
	function loadConfig(sURI) {
		var aIncludesPromises = [];
		var mConfig = {
			plugins: [],
			pluginExtensions: {}
		};

		// Trigger config loading and proceed with included configs
		return Q(jQuery.ajax({
			url: sURI,
			dataType: "json"
		}).then(null, function (jqXHR, sTextStatus, oError) {
			// jQuery promise => Always rejects but we can return the reason here
			return new Error("Failed to load config file: " + sURI + "! Reason: " + oError);
		})).then(null, function (oError) {
			// Q promise => Now we can handle the error
			console.error(oError.message);
			// Do not reject, but resolve with an empty config
			return {};
		}).then(function (mLoadedConfig) {
			mLoadedConfig = rewriteURIsInConfig(mLoadedConfig, sURI);

			var aIncludes = mLoadedConfig.includes || [];
			if (aIncludes.length > 0) {
				//replace curly braces placeholder in include url with env parameter
				var rxp = /{([^}]+)}/g;
				aIncludes.forEach(function (sIncludeConfigFile) {
					var aCurrentMatch;
					var sParsedIncludeConfig = sIncludeConfigFile;
					while ((aCurrentMatch = rxp.exec(sIncludeConfigFile)) !== null) {
						sParsedIncludeConfig = sParsedIncludeConfig.replace(aCurrentMatch[0], sap.watt.getEnv(aCurrentMatch[1]));
					}
					aIncludesPromises.push(loadConfig(getURI(sParsedIncludeConfig, sURI)));
				});
				return Q.all(aIncludesPromises).spread(function () {
					var aIncludes = Array.prototype.slice.call(arguments);
					aIncludes.forEach(function (mIncludedConfig) {
						mConfig = mergeConfig(mConfig, mIncludedConfig);
					});
					return Q.all([mergeConfig(mConfig, mLoadedConfig)]);
				});
			} else {
				return Q.all([mergeConfig(mConfig, mLoadedConfig)]);
			}
		}).then(function (aArgs) {
			var mConfig = aArgs[0];
			return mConfig;
		});
	}

	function getConfigURIFromDocument() {
		// lookup the script with the config file attribute
		var aScripts = document.querySelectorAll("script[data-sap-ide-config]");
		var oScript;
		if (aScripts.length >= 1) {
			oScript = aScripts[0];
		}

		// either use the config file attribute or by default the config.json
		var sConfigFileURI = oScript && oScript.getAttribute("data-sap-ide-config") || "config.json";
		return sConfigFileURI;
	}

	/**
	 * Configuration service
	 */
	var Config = {

		_mConfig: null,

		getConfig: function () {
			return this._mConfig;
		},

		load: function (sConfigFileURI) {
			sConfigFileURI = sConfigFileURI || getConfigURIFromDocument();

			sConfigFileURI = getURI(sConfigFileURI);

			if (sap.watt.getEnv("devMode")) {
				sConfigFileURI = sConfigFileURI.replace(/\.json$/, "-dev.json");
			}

			// load the config
			var that = this;
			return loadConfig(sConfigFileURI).then(function (mConfig) {
				that._mConfig = mConfig;
				return mConfig;
			}, function (oError) {
				throw new Error("Load of config files failed! \n Reason: " + oError);
			});
		}

	};

	return Config;

});