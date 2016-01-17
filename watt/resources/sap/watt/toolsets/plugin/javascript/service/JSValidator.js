define(["../util/JSValidatorHelper", "sap/watt/lib/lodash/lodash"], function(jsValidatorHelper, _) {

	"use strict";

	return {
		oCustomRulesPath: {
			"path": null,
			"content": null
		},

		init: function() {},

		validate: function(aDocuments, filterLevel) {
			var that = this;
			var baseService = this.context.service.basevalidator;
			return baseService.getProjectValidationConfiguration(that.context.self.getProxyMetadata().getName()) //get configuration by this service id
				.then(function(projConfiguration) {
					var _projConfiguration = projConfiguration || {};
					var customRulesPath = _projConfiguration.customRulesPath;
					return Q.all([that.getDefaultConfiguration(customRulesPath), that.getCustomRulesContent(customRulesPath)]) //TODO: cache custom rules?
						.spread(function(defConfig, customRulesContent) {
							var mergedProjectConfiguration = that.getConfiguration(filterLevel, defConfig, _projConfiguration.configuration);
							return that._validateAllDocs(aDocuments, mergedProjectConfiguration, customRulesContent);
						});
				});
		},

		_validateAllDocs: function(aDocuments, mergedProjectConfiguration, customRulesContent) {
			var that = this;
			if (!aDocuments) {
				return;
			}
			var promises = that._collectAllDocsValidation(aDocuments, mergedProjectConfiguration, customRulesContent);
			return Q.all(promises).then(function(validationResults) {
				var results = [];
				_.each(validationResults, function(validationResult) {
					if (validationResult) {
						results.push(validationResult);
					}
				});
				return results;
			});
		},
		_collectAllDocsValidation: function(aDocuments, mergedProjectConfiguration, customRulesContent) {
			var that = this;
			if (!aDocuments) {
				return;
			}
			var promises = [];
			_.each(aDocuments, function(document) {
				var type = document.getEntity().getType();
				if (type !== "file") {
					that.context.service.log.info(that.context.service.self.getProxyMetadata().getName(),
						"directory is not supported for validation", ["user"]).done();
					return;
				} else {
					promises.push(document.getContent().then(function(docContent) {
						var docFullPath = document.getEntity().getFullPath();
						var result = that.getIssuesSynchronously(docContent, mergedProjectConfiguration, docFullPath, customRulesContent);
						return {
							document: document,
							result: result
						};
					}));
				}
			});
			return promises;
		},
		getDefaultConfiguration: function(sPath) {
			return this.context.service.jsDisplayValidatorConfiguration.getDefaultConfiguration(sPath);
		},

		getIssuesSynchronously: function(sSource, oConfig, sFullPath, oCustomRules) {
			return jsValidatorHelper.getIssues(sSource, oConfig, sFullPath, oCustomRules);
		},

		getPathToImplementationModule: function() {
			return "sap/watt/toolsets/plugin/javascript/util/JSValidatorHelper";
		},

		getConfiguration: function(aFilters, defaultConfigWithCustom, customConfiguration) {
			var mergedConfiguration = _.merge(defaultConfigWithCustom || {}, customConfiguration || {});
			return this._getFilteredConfiguration(mergedConfiguration, aFilters);
		},
		_getFilteredConfiguration: function(oConfig, aFilters) {
			if (!aFilters) {
				return oConfig;
			}
			var config = oConfig.eslintConfig || {};
			var rules = config.rules || {};
			var rulesExt = oConfig.rulesExt;
			var levelEnabled = {
				"info": (aFilters.indexOf("info") >= 0),
				"warning": (aFilters.indexOf("warning") >= 0),
				"error": (aFilters.indexOf("error") >= 0)
			};
			_.forEach(rules, function(ruleValue, ruleId) {
				if (rules.hasOwnProperty(ruleId)) {
					var severity;
					if (!rulesExt[ruleId]) {
						severity = "warning";
						this.context.service.log.info(this.context.service.jsValidator.getProxyMetadata().getName(), "rule " + ruleId + "missing severity information. severity set to warning." , ["user"]).done();
					} else {
						severity = rulesExt[ruleId].severity;
					}
					if (!levelEnabled[severity]) {
						if (typeof ruleValue === "number") {
							rules[ruleId] = 0;
						} else if (Array.isArray(ruleValue)) {
							ruleValue[0] = 0;
						}
					}
				}
			});
			return oConfig;
		},

		getCustomRulesContent: function(sPath) {
			var aRulesIDs = [],
				aRulesPromisses = [],
				that = this;
			that.oUserDefinedRulesContent = {};

			if (!sPath) {
				//if no path to custom rules was delivered, 
				//continuing the method will cause unhandled-Error at filesystem.documentProvider 
				return Q();
			}

			//basic caching of the custom Rules content
			if (that.oCustomRulesPath.sPath === sPath) {
				//The custom rules content was already discovered and cached   
				return that.oCustomRulesPath.content;
			} else {
				return that.context.service.filesystem.documentProvider.getDocument(sPath)
					.then(function(oRulesFolder) {
						if (oRulesFolder) {
							//the folder was found
							return oRulesFolder.getCurrentMetadata(true)
								.then(function(aRules) {
									//get all the rules from the folder
									jQuery.each(aRules, function(index, oRule) {
										if (!oRule.folder && (oRule.name.indexOf(".js") !== -1)) {
											aRulesIDs.push(oRule.name.replace(/\.js/, ""));
											aRulesPromisses.push(that.context.service.filesystem.documentProvider.getDocument(oRule.path).then(function(oDocument) {
												return oDocument.getContent();
											}));
										}
									});
									return Q.all(aRulesPromisses)
										.then(function(aRulesContents) {
											jQuery.each(aRulesContents, function(index, sRuleContent) {
												/*var fn = new Function(oCustomRules[ruleId]) at JSValidatorHelper
                                        creates a function that should return the custom rule function.*/
												sRuleContent = sRuleContent.replace(/(\s*(module\.exports)\s*=)/, '\n return ');
												that.oUserDefinedRulesContent[aRulesIDs[index]] = sRuleContent;
											});
											that.oCustomRulesPath.path = sPath;
											that.oCustomRulesPath.content = that.oUserDefinedRulesContent;
											return that.oCustomRulesPath.content;
										});
								});
						} else {
							//custom rules folder wasn't found
							that.context.service.log.info(that.context.service.jsValidator.getProxyMetadata().getName(), " user defined RulesDirectory: " +
								sPath + " ,defined in project settings was not found", ["user"]).done();
							return Q();
						}
					});
			}
		}
	};
});