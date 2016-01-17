define(["sap/watt/lib/lodash/lodash"], function(_) {

	var _INVALID_INITIALIZATION = "Invalid initialization of RulesManager";
	var RulesManagerClass = function(oContext, oValidatorProxy, projectIdentifier) {
		var _BACKWORD_LINTING_NODE = "linter";
		//oldSettings.ESLintCustomBaseFile
		var _projectValidatorConfiguration;

		var _currentValidator = null;
		var _validatorDefaultConfiguration;
		var _tempValidatorDefaultConfigurationWithCustom;
		var _tempLastCustomPath;

		var _validatorDTDefaultConfiguration;
		var _tempValidatorDTDefaultConfigurationWithCustom;
		var _tempLastDTCustomPath;

		var _getOrCreaeValidatorInProjectJson = function(validatorId, fullProjectConfiguration) {
			var _aValidators = fullProjectConfiguration.validators;
			var currentValidator = _.find(_aValidators, function(oValidator) {
				return oValidator.validatorID === validatorId;
			});
			if (!currentValidator) {
				currentValidator = {
					validatorID: validatorId
				};
				_aValidators.push(currentValidator);
			}
			return currentValidator;
		};

		var _cloneAndInitProjectConfig = function(oProjectConfiguration) {
			var oClonedProjectConfiguration = _.cloneDeep(oProjectConfiguration || {}, true);
			oClonedProjectConfiguration.validators = oClonedProjectConfiguration.validators || [];
			oClonedProjectConfiguration.services = oClonedProjectConfiguration.services || {};
			return oClonedProjectConfiguration;
		};

		var _getBackwordSettings = function() {
			//that.context.service.document.getDocumentByPath(docFullPath)
			return Q.all([RulesManager._getProjectService(oContext), oContext.service.document.getDocumentByPath(projectIdentifier)])
				.spread(function(projectService, projectDoc){
					return projectService.getProjectSettings(_BACKWORD_LINTING_NODE, projectDoc);
				}).fail(function(e) { //TODO: try, catch added for testing purpose - fails in case no project is selectd
					oContext.service.log.warn(oContext.service.basevalidator.getProxyMetadata().getName(),
						"could not find project settings", ["user"]).done();
				});
		};

		var _getConfigurationFromProject = function() {
			return Q.all([_getBackwordSettings(),
				oContext.service.document.getDocumentByPath(projectIdentifier),
				RulesManager._getProjectService(oContext)])
				.spread(function(oldSettings, projectDoc, projectService){
					return projectService.get(oContext.service.basevalidator,projectDoc)
						.then(function(projectConfiguration){
							var clonedProjectConfiguration =  _cloneAndInitProjectConfig(projectConfiguration);
							//for backword compatibility - fiori scenario
							var selfManagedConfiguration = oldSettings && oldSettings.ESLintNewApproach;
							if (_currentValidator === "jsValidator" && selfManagedConfiguration && oValidatorProxy.getUpdatedConfiguration) {
								return oValidatorProxy.getUpdatedConfiguration(oldSettings.ESLintCustomBaseFile, oldSettings.ESLintRulesDirectory)
									.then(function(selfConfiguration) {
										var found = false;
										for (validator in clonedProjectConfiguration.validators) {
											if (validator.validatorID === "jsValidator") {
												found = true;
												validator.configuration = selfConfiguration;
												validator.customRulesPath = oldSettings.ESLintRulesDirectory;
												break;
											}
										}
										if (!found) {
											clonedProjectConfiguration.validators.push({
												"validatorID": _currentValidator,
												"configuration": selfConfiguration,
												"customRulesPath": oldSettings.ESLintRulesDirectory
											});
										}
										return clonedProjectConfiguration;
									});
							}
							return clonedProjectConfiguration;
						});
				});
		};

		var _getProjectValidatorMembers = function(oProjectConfiguration) {
			var projValidator = {};
			if (oProjectConfiguration) {
				projValidator = _getOrCreaeValidatorInProjectJson(_currentValidator, oProjectConfiguration);
			}
			return projValidator;
		};

		this._getDefaultConfiguration = function(sPath) {
			return oValidatorProxy.getRTDefaultConfiguration(sPath);
		};

		this._getAndCacheRTDefaultConfiguration = function(sPath) {
			if (sPath) {
				if (_tempLastCustomPath === sPath && _tempValidatorDefaultConfigurationWithCustom) {
					return Q(_.cloneDeep(_tempValidatorDefaultConfigurationWithCustom));
				} else {
					return this._getDefaultConfiguration(sPath)
						.then(function(config) {
							_tempLastCustomPath = sPath;
							_tempValidatorDefaultConfigurationWithCustom = config || {};
							return _.cloneDeep(_tempValidatorDefaultConfigurationWithCustom);
						});
				}
			} else {
				if (_validatorDefaultConfiguration) {
					return Q(_.cloneDeep(_validatorDefaultConfiguration));
				} else {
					return this._getDefaultConfiguration()
						.then(function(config) {
							_validatorDefaultConfiguration = config || {};
							return _.cloneDeep(_validatorDefaultConfiguration);
						});
				}
			}
		};

		this._getDTDefaultConfiguration = function(sPath) {
			return oValidatorProxy.getDefaultConfiguration(sPath);
		};

		this._getAndCacheDTDefaultConfiguration = function(sPath) {
			if (sPath) {
				if (_tempLastDTCustomPath === sPath && _tempValidatorDTDefaultConfigurationWithCustom) {
					return Q(_.cloneDeep(_tempValidatorDTDefaultConfigurationWithCustom));
				} else {
					return this._getDTDefaultConfiguration(sPath)
						.then(function(config) {
							_tempLastDTCustomPath = sPath;
							_tempValidatorDTDefaultConfigurationWithCustom = config || {};
							return _.cloneDeep(_tempValidatorDTDefaultConfigurationWithCustom);
						});
				}
			} else {
				if (_validatorDTDefaultConfiguration) {
					return Q(_.cloneDeep(_validatorDTDefaultConfiguration));
				} else {
					return this._getDTDefaultConfiguration()
						.then(function(config) {
							_validatorDTDefaultConfiguration = config || {};
							return _.cloneDeep(_validatorDTDefaultConfiguration);
						});
				}
			}
		};

		this._init = function() {
			if (!oValidatorProxy || !oContext || !projectIdentifier) {
				return Q.reject(new Error(_INVALID_INITIALIZATION));
			}

			return oValidatorProxy.getCurentValidatorServiceIdentifier()
				.then(function(validator) {
					if (!validator) {
						return Q.reject(new Error(_INVALID_INITIALIZATION));
					}

					_currentValidator = validator;
					return Q.all([_getConfigurationFromProject()])
						.spread(function(oProjectConfiguration) {
							_projectValidatorConfiguration = _getProjectValidatorMembers(oProjectConfiguration);
						});
				});
		};
		//Runtime functionality    
		this.getRulesForAnnotations = function(aFilters) {
			return this._getAndCacheRTDefaultConfiguration(_projectValidatorConfiguration.customRulesPath)
				.then(function(defConfig) {
					return oValidatorProxy.getConfiguration(aFilters, defConfig, _projectValidatorConfiguration.configuration);
				});
		};

		this.getCustomRulesPath = function() {
			return Q(_projectValidatorConfiguration.customRulesPath);
		};

		//Design time functionality
		this._reduceCustomRules = function(rules1, rules2) {
			return _.omit(rules1, function(value, key) {
				return !_.has(rules2, key);
			});
		};

		this.getUpdatedRules = function(sCustomRulesPath, oModifiedDisplayRules) {
			var that = this;
			return this._getAndCacheDTDefaultConfiguration()
				.then(function(defConfig) {
					return oValidatorProxy.convertConfigurationToDisplayFormat(defConfig)
						.then(function(displayconfig) {
							var _validatorDefaultDisplayConfiguration = displayconfig || {};
							var modifiedDisplayWithoutCustom = that._reduceCustomRules(oModifiedDisplayRules, _validatorDefaultDisplayConfiguration.rules);
							return Q.all([that._getAndCacheDTDefaultConfiguration(sCustomRulesPath),
                                  oValidatorProxy.convertConfigurationToConcreteFormat({
										rules: modifiedDisplayWithoutCustom
									})])
								.spread(function(defWithCustom, concreteConfiguration) {
									//remove not relevant custom rules 
									return oValidatorProxy.mergeConfigurations(defWithCustom, concreteConfiguration)
										.then(function(modifiedWithNewCustom) {
											return oValidatorProxy.convertConfigurationToDisplayFormat(modifiedWithNewCustom)
												.then(function(displayConfig) {
													return displayConfig.rules;
												});
										});
								});
						});
				});
		};

		this.getValidatorConfigurationForDisplay = function(defaultOnly) {
			var pConfig = _.cloneDeep(_projectValidatorConfiguration);
			var customRulesPath = defaultOnly ? undefined : pConfig.customRulesPath;
			return this._getAndCacheDTDefaultConfiguration(customRulesPath).then(function(defWithCustom) {
				return Q((!defaultOnly && pConfig.configuration) ? oValidatorProxy.mergeConfigurations(defWithCustom, pConfig.configuration) : defWithCustom)
					.then(function(config) {
						return Q.all([_getConfigurationFromProject(), oValidatorProxy.convertConfigurationToDisplayFormat(config)])
							.spread(function(fullProjectConfiguration, oRulesInDisplayFormat) {
								return {
									configuration: oRulesInDisplayFormat || {},
									customRulesPath: customRulesPath,
									services: fullProjectConfiguration.services || {}
								};
							});
					});
			});
		};

		this._getValidatorConfigurationToSave = function(oValidatorConfigurationFromDisplay, validatorProjectConfig) {
			if (!oValidatorProxy.hasDTService()) {
				return Q(_.cloneDeep(validatorProjectConfig.configuration));
			}

			return Q.all([oValidatorProxy.convertConfigurationToConcreteFormat(oValidatorConfigurationFromDisplay.configuration),
                          this._getAndCacheDTDefaultConfiguration(oValidatorConfigurationFromDisplay.customRulesPath)])
				.spread(function(modifiedConfiguration, defConfig) {
					return oValidatorProxy.getDiffConfigurationToStore(defConfig, validatorProjectConfig.configuration || {}, modifiedConfiguration)
						.then(function(resultConfiguration) {
							return resultConfiguration;
						});
				});
		};

		this.saveValidatorConfiguration = function(oValidatorConfigurationFromDisplay) {
			var that = this;
			return _getConfigurationFromProject().then(function(fullProjectConfiguration) {
				var projectValidatorConfiguration = _getOrCreaeValidatorInProjectJson(_currentValidator, fullProjectConfiguration);
				return that._getValidatorConfigurationToSave(oValidatorConfigurationFromDisplay, projectValidatorConfiguration).then(function(
					configToSave) {
					projectValidatorConfiguration.configuration = configToSave;
					projectValidatorConfiguration.customRulesPath = oValidatorConfigurationFromDisplay.customRulesPath;
					_projectValidatorConfiguration = projectValidatorConfiguration;
					fullProjectConfiguration.services = _.merge(_.cloneDeep(fullProjectConfiguration.services), oValidatorConfigurationFromDisplay.services);
					return RulesManager._getProjectService(oContext).set(oContext.service.basevalidator, fullProjectConfiguration)
						.then(function() {
							return fullProjectConfiguration;
						});
				});
			});
		};
	};

	var RulesManager = function RulesManager() {};
	RulesManager._rulesManagerCache = {};
	RulesManager._oServiceQueue = new Q.sap.Queue();

	RulesManager.get = function(oContext, oValidatorProxy, projectIdentifier) {
		return RulesManager._oServiceQueue.next(function() {
			if (!oValidatorProxy || !oContext) {
				return Q.reject(new Error(_INVALID_INITIALIZATION));
			}
			return Q.all([oValidatorProxy.getCurentValidatorServiceIdentifier()])
				.spread(function(validatorId) {
					if (!validatorId || !projectIdentifier) {
						return Q.reject(new Error(_INVALID_INITIALIZATION));
					}
					if (RulesManager._rulesManagerCache[validatorId] && RulesManager._rulesManagerCache[validatorId][projectIdentifier]) {
						return RulesManager._rulesManagerCache[validatorId][projectIdentifier];
					} else {
						return RulesManager._createInstance(oContext, oValidatorProxy, projectIdentifier)
							.then(function(rulesManagerInt) {
								RulesManager._rulesManagerCache[validatorId] = RulesManager._rulesManagerCache[validatorId] || {};
								RulesManager._rulesManagerCache[validatorId][projectIdentifier] = rulesManagerInt;
								return rulesManagerInt;
							});
					}
				});
		});
	};

	//done here for unit testing
	RulesManager._createInstance = function(oContext, oValidatorProxy, projectIdentifier) {
		var rulesManagerInt = new RulesManagerClass(oContext, oValidatorProxy, projectIdentifier);
		return rulesManagerInt._init().then(function() {
			return rulesManagerInt;
		});
	};

	RulesManager._getProjectService = function(oContext) {
		return oContext.service.setting.project;
	};
	return RulesManager;
});