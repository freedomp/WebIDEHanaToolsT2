define(["../util/configReader", "../util/JSValidatorHelper", "sap/watt/lib/lodash/lodash"], function(configReader, JSValidatorHelper, _) {

	"use strict";

	return {
		init:function() {
			return configReader._loadDefaultConfig();
		},

		validate: function(aDocuments, filterLevel) {},

		getDefaultConfiguration: function(sPath) {
			return this.context.service.fioriJsDisplayValidatorConfiguration.getDefaultConfiguration(sPath);
		},

		getIssuesSynchronously: function(sSource, oConfig, sFullPath, oCustomRules) {
			return JSValidatorHelper.getIssues(sSource, oConfig, sFullPath, oCustomRules);
		},

		getPathToImplementationModule: function() {
			return "sap/watt/saptoolsets/fiori/editor/plugin/fioriJsValidator/util/JSValidatorHelper";
		},

		getConfiguration: function(aFilters, defaultConfigWithCustom, customConfiguration) {
			var mergedConfiguration = _.merge(defaultConfigWithCustom || {}, customConfiguration || {});
			return this._getFilteredConfiguration(mergedConfiguration, aFilters);
		},

		getCustomRulesContent: function(sPath) {
			var that = this;
			return that._getFioriRules().then(function(aFioriRules) {
				return that._getCustomRules(sPath).then(function(aCustomRules) {
					_.forEach(aCustomRules, function(value, key) {
						if (!aFioriRules[key]) {
							aFioriRules[key] = value;
						}
					});
					return aFioriRules;
				});
			});
		},

		_getFilteredConfiguration: function(oConfig, aFilters) {
			if (!aFilters) {
				return oConfig;
			}
			var rules = oConfig.rules || {};
			var additionalRuleMetadata = oConfig.additionalRuleMetadata;
			var levelEnabled = {
				"i": (aFilters.indexOf("info") >= 0),
				"w": (aFilters.indexOf("warning") >= 0),
				"e": (aFilters.indexOf("error") >= 0)
			};
			_.forEach(rules, function(ruleValue, ruleId) {
				if (rules.hasOwnProperty(ruleId)) {
					var severity;
					if (!additionalRuleMetadata[ruleId]) {
						severity = "warning";
					} else {
						severity = additionalRuleMetadata[ruleId].severity;
					}
					if (!levelEnabled[severity]) {
						if (typeof ruleValue === "number") {
							rules[ruleId] = 0;
						} else if (ruleValue instanceof Array) {
							ruleValue[0] = 0;
						}
					}
				}
			});
			return oConfig;
		},

		_getFioriRules: function() {
			return configReader.getFioriRules();
		},

		_getCustomRules: function(sPath) {
			var oResults = {};
			var aRulesIDs = [];
			var aRulesPromises = [];
			var oService = this.context.service;
			if (!sPath) {
				return Q();
			}
			return oService.filesystem.documentProvider.getDocument(sPath).then(function(oRulesFolder) {
				if (oRulesFolder) {
					//the folder was found
					return oRulesFolder.getCurrentMetadata(true).then(function(aRules) {
						//get all the rules from the folder
						jQuery.each(aRules, function(index, oRule) {
							if (!oRule.folder && (oRule.name.indexOf(".js") !== -1)) {
								aRulesIDs.push(oRule.name.replace(/\.js/, ""));
								aRulesPromises.push(oService.filesystem.documentProvider.getDocument(oRule.path).then(function(oDocument) {
									return oDocument.getContent();
								}));
							}
						});
						return Q.all(aRulesPromises).then(function(aRulesContents) {
							jQuery.each(aRulesContents, function(index, sRuleContent) {
								sRuleContent = sRuleContent.replace(/(\s*(module\.exports)\s*=)/, '\n return ');
								oResults[aRulesIDs[index]] = sRuleContent;
							});
							return oResults;
						});
					});
				} else {
					//custom rules folder wasn't found
					return Q();
				}
			});
		}
	};
});