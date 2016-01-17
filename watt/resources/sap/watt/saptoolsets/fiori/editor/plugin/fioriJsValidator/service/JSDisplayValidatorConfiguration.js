define(["../util/configReader", "sap/watt/lib/lodash/lodash", "../util/rulesSecurity"], function (configReader, _, securityUtil) {

	"use strict";

	return {
		FILE_TYPE: "file",
		CUSTOM_RULES_DEFAULTS: {
			"enabled": 0,
			"severity": "w",
			"category": "Best Practice"
		},
		init:function() {
			return configReader._loadDefaultConfig();
		},

		getDefaultConfiguration: function (sPath) {
			var that = this;
			try {
				return configReader.getFioriConfiguration().then(function (_defConfig) {
					var defConfig = _.cloneDeep(_defConfig) || {};
					that._adaptMetadataConfiguration(defConfig);
					if (sPath) {
						return that._setCustomConfiguration(sPath).then(function (customRules) {
							if (customRules) {
								customRules = _.cloneDeep(customRules); // make a copy of the object
								return that._mergeRules(customRules, defConfig);
							}
							return defConfig;
						});
					}
					return defConfig;
				});
			} catch (e) {
				that.context.service.log.error("javascript eslint - failed to get default rules", e.message).done();
				return {};
			}
		},

		getUpdatedConfiguration: function (customConfigurationFile, customRulesDir) {
		},

		getDiffConfigurationToStore: function (defaultConfigWithCustom, prevProjectConfig, customConfiguration) {
			var that = this;

			// Workaround to prevent from all default rules to be written in project.json
			var defaultConfigWithCustomToCompare = _.cloneDeep(defaultConfigWithCustom);
			that._adaptMetadataConfiguration(defaultConfigWithCustomToCompare);

			var reducedProjFromDef = that._reduceConfigurations(prevProjectConfig, defaultConfigWithCustomToCompare);
			var reducedModifiedFromProject = that._reduceConfigurations(customConfiguration, reducedProjFromDef);
			var diffModifiedFromProject = _.merge(reducedProjFromDef, reducedModifiedFromProject);

			that._adaptMetadataConfiguration(customConfiguration);
			var diffModifiedFromDefault = that._diffConfigurations(customConfiguration, defaultConfigWithCustomToCompare);
			return _.merge(diffModifiedFromProject, diffModifiedFromDefault);
		},

		convertConfigurationToDisplayFormat: function (oConfig) {
			var aResult = {};
			if (!oConfig) {
				return aResult;
			}
			var oRules = oConfig.rules || {};
			var additionalRuleMetadata = oConfig.additionalRuleMetadata;
			$.each(oRules, function (ruleId, ruleValue) {
				var oRule = {};
				var oRuleMetadata = additionalRuleMetadata[ruleId];
				oRule.ruleId = ruleId;
				switch (oRuleMetadata.severity.toLowerCase()[0]) {
					case 'e':
						oRule.severity = "error";
						break;
					case 'w':
						oRule.severity = "warning";
						break;
					case 'i':
						oRule.severity = "info";
						break;
				}
				if (typeof ruleValue === "number") {
					if (ruleValue === 0) {
						oRule.enable = false;
					} else {
						oRule.enable = true;
					}
				} else if (ruleValue instanceof Array) {
					if (ruleValue[0] === 0) {
						oRule.enable = false;
					} else {
						oRule.enable = true;
					}
					oRule.additionalProperties = ruleValue.slice(1);
				}
				oRule.category = oRuleMetadata.category;
				oRule.helpUrl = oRuleMetadata.help;
				aResult[ruleId] = oRule;
			});
			var returnVal = {};
			returnVal.rules = aResult;
			returnVal.header = {};
			if (oConfig.globals) {
				returnVal.header.globals = oConfig.globals;
			}
			if (oConfig.env) {
				returnVal.header.env = oConfig.env;
			}
			return returnVal;
		},

		convertConfigurationToConcreteFormat: function (aRules) {
			var that = this;
			var oRules = {};
			var oRulesMetadata = {};
			var aConfig = aRules || {};
			$.each(aConfig.rules || {}, function (index, oRule) {
				oRules[oRule.ruleId] = {};
				if (!oRule.additionalProperties) {
					if (oRule.enable === false) {
						oRules[oRule.ruleId] = that._convertRuleValFromSeverity();
					} else {
						oRules[oRule.ruleId] = that._convertRuleValFromSeverity(oRule.severity);
					}
				} else {
					oRules[oRule.ruleId] = [];
					if (oRule.enable === false) {
						oRules[oRule.ruleId][0] = that._convertRuleValFromSeverity();
					} else {
						oRules[oRule.ruleId][0] = that._convertRuleValFromSeverity(oRule.severity);
					}
					oRules[oRule.ruleId] = oRules[oRule.ruleId].concat(oRule.additionalProperties);
				}
				oRulesMetadata[oRule.ruleId] = {};
				oRulesMetadata[oRule.ruleId].severity = oRule.severity ? oRule.severity.toLowerCase()[0] : "w";
				oRulesMetadata[oRule.ruleId].category = oRule.category;
				oRulesMetadata[oRule.ruleId].help = oRule.helpUrl;
			});
			var header = aConfig.header || {};
			return that._buildConfigurationTemplate(oRules, header.globals, header.env, oRulesMetadata);
		},

		mergeConfigurations: function (defaultConfigWithCustom, customConfiguration) {
			return _.merge(defaultConfigWithCustom || {}, customConfiguration || {});
		},

		_convertRuleValFromSeverity: function (severity) {
			if (!severity) {
				return 0;
			}
			var concreteSeverity = severity.toLowerCase()[0];
			if (concreteSeverity === "w" || concreteSeverity === "i") {
				return 1;
			} else if (concreteSeverity === "e") {
				return 2;
			}
			return 0;
		},

		_diffObjects: function (obj1, obj2) {
			if (!obj1 && obj2) {
				return {};
			}
			if (!obj2) {
				return obj1;
			}
			//omit all equal objects from obj1
			var result = _.omit(obj1, function (value, key) {
				return _.isEqual(obj2[key], value);
			});
			return _.isEmpty(result) ? undefined : result;
		},

		_diffConfigurations: function (fullConfig1, fullConfig2) {
			//omit all equal objects from config1
			var config1 = fullConfig1 || {};
			var config2 = fullConfig2 || {};
			var rules = this._diffObjects(config1.rules, config2.rules);
			var env = this._diffObjects(config1.env, config2.env);
			var globals = this._diffObjects(config1.globals, config2.globals);
			var additionalRuleMetadata = this._diffObjects(fullConfig1.additionalRuleMetadata, fullConfig2.additionalRuleMetadata);
			return this._buildConfigurationTemplate(rules, globals, env, additionalRuleMetadata);
		},

		_reduceConfigurations: function (fullConfig1, fullConfig2) {
			var cloned1 = _.cloneDeep(fullConfig1 || {});
			var config1 = cloned1 || {};
			var config2 = fullConfig2 || {};
			var rules = _.omit(config1.rules, function (value, key) {
				return !_.has(config2.rules, key);
			});
			var additionalRuleMetadata = _.omit(cloned1.additionalRuleMetadata, function (value, key) {
				return !_.has(fullConfig2.additionalRuleMetadata, key);
			});
			return this._buildConfigurationTemplate(rules, undefined, undefined, additionalRuleMetadata);
		},

		_mergeExists: function (def, src) {
			//omit all entries not exists in def
			var srcReduced = _.omit(src, function (value, key) {
				return !_.has(def, key);
			});
			var clonedDef = _.cloneDeep(def);
			return _.merge(clonedDef, srcReduced);
		},

		_adaptMetadataConfiguration: function (defConfig) {
			if (defConfig) {
				_.each(defConfig.additionalRuleMetadata, function (metadata) {
					metadata.severity = metadata.severity || "w"; // Default value
					delete metadata.priority;
				});
			}
		},

		_buildConfigurationTemplate: function (rules, globals, env, additionalRuleMetadata) {
			var result = {};
			if (rules) {
				result.rules = rules;
			}
			if (additionalRuleMetadata) {
				result.additionalRuleMetadata = additionalRuleMetadata;
			}
			if (globals) {
				result.globals = globals;
			}
			if (env) {
				result.env = env;
			}
			return _.isEmpty(result) && !result.additionalRuleMetadata ? undefined : result;
		},

		_setCustomConfiguration: function (path) {
			var sFileExtension = "js",
				aRulesDocumentsToScanPromises = [],
				that = this;

			if (!path) {
				return Q();
			}
			return this.context.service.filesystem.documentProvider.getDocument(path).then(function (oRulesFolder) {
				if (oRulesFolder) {
					//the folder was found
					return oRulesFolder.getCurrentMetadata(true).then(function (aRules) {
						//get all the rules from the folder
						jQuery.each(aRules, function (index, oRule) {
							if (!oRule.folder) {
								if (_.endsWith(oRule.name, sFileExtension)) {
									aRulesDocumentsToScanPromises.push(that.context.service.filesystem.documentProvider.getDocument(oRule.path));
								} else {
									that.context.service.log.warn(that.context.service.fioriJsValidator.getProxyMetadata().getName(),
										" user defined RulesDirectory: found files other then " + sFileExtension + " in: " + path, ["user"]).done();
								}
							}
						});
						return Q.all(aRulesDocumentsToScanPromises).then(function (aRulesDocumentsToScan) {
							if (aRulesDocumentsToScan.length > 0) {
								return that._securityScan(aRulesDocumentsToScan).then(function (aRulesIDs) {
									return that._createCustomRulesStruct(aRulesIDs);
								});
							} else {
								return null;
							}
						});
					});
				} else {
					//custom rules folder wasn't found
					that.context.service.log.warn(that.context.service.fioriJsValidator.getProxyMetadata().getName(), " user defined RulesDirectory " + path +
					" defined under project settings was not found", ["user"]).done();
					return null;
				}
			});
		},

		_createCustomRulesStruct: function (aRules) {
			var that = this;
			var oTemplate = that._getRulesConfigurationTemplate();
			var rulesMetadata = oTemplate.additionalRuleMetadata;
			var rulesState = oTemplate.rules;
			jQuery.each(aRules, function (index, ruleId) {
				if (!(ruleId === "length")) {
					rulesState[ruleId] = {};
					rulesState[ruleId] = that.CUSTOM_RULES_DEFAULTS.enabled;
					rulesMetadata[ruleId] = {};
					rulesMetadata[ruleId].severity = that.CUSTOM_RULES_DEFAULTS.severity;
					rulesMetadata[ruleId].category = that.CUSTOM_RULES_DEFAULTS.category;
				}
			});
			return oTemplate;
		},

		_getRulesConfigurationTemplate: function () {
			return {
				additionalRuleMetadata: {},
				rules: {}
			};
		},

		_mergeRules: function (oSource, oDestination) {
			if (!oSource) {
				this.context.service.log.warn("javascript eslint - an element to be merged not supplied: ", JSON.stringify(oSource)).done();
				return oDestination;
			}
			if (!oDestination) {
				this.context.service.log.warning("javascript eslint - an element to be merged not supplied: ", JSON.stringify(oDestination)).done();
				return oSource;
			}
			return _.merge(oSource, oDestination);
		},

		_securityScan: function (aRulesDocuments) {
			var aRulesIDs = [];
			var aContentPromises = [];
			_.each(aRulesDocuments, function (oRule) {
				aContentPromises.push(oRule.getContent().then(function (sContent) {
					return {
						content: sContent,
						document: oRule
					};
				}));
			});
			return Q.all(aContentPromises).then(function (aResults) {
				_.each(aResults, function (rulesInfo) {
					var content = rulesInfo.content;
					var oRule = rulesInfo.document;
					if (securityUtil.scan(content)) {
						aRulesIDs.push(oRule.getTitle().replace(/\.js/, ""));
					}
				});
				return aRulesIDs;
			});
		}
	};
});