define(["../util/WorkerHelper", "../util/RulesManager", "../util/AnnotationsHelper", "sap/watt/lib/lodash/lodash",
	"../util/DelayedValidation"
], function (workerHelper, rulesManager, annotationsHelper, _, DelayedValidation) {
	"use strict";

	var _workerHelper;
	var _langConfiguredServices = {};
	var _annotationsHelper = annotationsHelper;
	var _ACE_EDITOR = "sap.watt.common.plugin.aceeditor.service.Editor";
	var VALIDATION_MODE_WORKER = "worker";
	var VALIDATION_MODE_SYNC = "sync";
	var _maxLineLength = null;
	var DelayedValidationManager = null;

	return {

		_sServices: "services",

		init: function () {
			DelayedValidationManager = new DelayedValidation(this.context);
		},

		configure: function (mConfig) {
			function intenralGetValidatorServiceProxy(oContext, oValidatorService) {
				if (!oValidatorService.service === undefined && (oValidatorService.fileExtension === "" || oValidatorService.fileExtension ===
					undefined)) {
					return null;
				}
				var validatorProxy = {
					hasDTService: function () {
						return oValidatorService.displayConfigurationService !== undefined;
					},
					//DT functionality
					getDefaultConfiguration: function (path) {
						if (oValidatorService.displayConfigurationService) {
							return oValidatorService.displayConfigurationService.getDefaultConfiguration(path);
						}
						return Q();
					},

					convertConfigurationToDisplayFormat: function (rules) {
						if (oValidatorService.displayConfigurationService) {
							return oValidatorService.displayConfigurationService.convertConfigurationToDisplayFormat(rules);
						}
						return Q();
					},

					convertConfigurationToConcreteFormat: function (rules) {
						if (oValidatorService.displayConfigurationService) {
							return oValidatorService.displayConfigurationService.convertConfigurationToConcreteFormat(rules);
						}
						return Q();
					},

					mergeConfigurations: function (defConfiguration, customConfiguration) {
						if (oValidatorService.displayConfigurationService) {
							return oValidatorService.displayConfigurationService.mergeConfigurations(defConfiguration, customConfiguration);
						}
						return Q();
					},

					getDiffConfigurationToStore: function (defConfiguration, prevProjectConfig, customConfiguration) {
						if (oValidatorService.displayConfigurationService) {
							return oValidatorService.displayConfigurationService.getDiffConfigurationToStore(defConfiguration, prevProjectConfig,
								customConfiguration);
						}
						return Q();
					},
					//RT functionality
					getCurentValidatorServiceIdentifier: function () {
						if (oValidatorService.service) {
							return Q(oValidatorService.service._sName);
						}
						return Q();
					},

					getConfiguration: function (aFilters, defaultConfigWithCustom, customConfiguration) {
						if (oValidatorService.service) {
							return oValidatorService.service.getConfiguration(aFilters, defaultConfigWithCustom, customConfiguration);
						}
						return Q();
					},
					postValidate: function (result) {
						if (oValidatorService.service) {
							return oValidatorService.service.postValidate(result);
						}
						return Q();
					},
					getRTDefaultConfiguration: function (path) {
						if (oValidatorService.service) {
							return oValidatorService.service.getDefaultConfiguration(path);
						}
						return Q();
					},
					getUpdatedConfiguration: function (customConfigurationFile, customRulesDir) {
						if (oValidatorService.displayConfigurationService) {
							return oValidatorService.displayConfigurationService.getUpdatedConfiguration(customConfigurationFile, customRulesDir);
						}
						return Q();
					}
				};
				return validatorProxy;
			}

			if (mConfig.maxLineLength) {
				this._maxLineLength = mConfig.maxLineLength;
			}
			if (!mConfig.validator) {
				return;
			}
			for (var i = 0; i < mConfig.validator.length; i++) {
				var fileExtensionServicesProperties;
				var configuredServiceProperties = {
					displayName: mConfig.validator[i].validatorName,
					syncExec: mConfig.validator[i].syncExec,
					service: mConfig.validator[i].service,
					displayConfigurationService: mConfig.validator[i].displayConfigurationService,
					serviceID: mConfig.validator[i].service._sName
				};
				var serviceProxy = intenralGetValidatorServiceProxy(this.context, configuredServiceProperties);
				configuredServiceProperties.serviceProxy = serviceProxy;
				for (var j = 0; j < mConfig.validator[i].fileExtension.length; j++) {
					fileExtensionServicesProperties = _langConfiguredServices[mConfig.validator[i].fileExtension[j]];
					if (!fileExtensionServicesProperties) {
						fileExtensionServicesProperties = [];
						_langConfiguredServices[mConfig.validator[i].fileExtension[j]] = fileExtensionServicesProperties;
					}
					fileExtensionServicesProperties.push(configuredServiceProperties);

				}
			}
		},

		_getValidatorServiceById: function (serviceID) {
			if (!serviceID) {
				return Q.reject(new Error("validator service undefined"));
			}
			for (var extension in _langConfiguredServices) {
				if (_langConfiguredServices.hasOwnProperty(extension)) {
					for (var i = 0; i < _langConfiguredServices[extension].length; i++) {
						if (_langConfiguredServices[extension][i].serviceID === serviceID) {
							return _langConfiguredServices[extension][i];
						}
					}
				}
			}
			return this._getEmptyValidator();
		},

		_getEmptyValidator: function () {
			return {
				service: undefined,
				displayConfigurationService: undefined,
				fileExtension: "",
				projectDocument: undefined,
				syncExec: false
			};
		},

		validate: function (aDocuments) {
			var that = this;
			return this._sortDocumentsByValidator(aDocuments).then(function (oSortedDocuments) {
				//oSortedDocuments is now a full map
				_.forEach(oSortedDocuments, function (aFileDocuments, sValidatorServiceId) {
					var oService = that._getValidatorServiceById(sValidatorServiceId);
					if (oService) {
						oService.validate(aFileDocuments).then(function (aResults) {
							/* aResults has objects with  { document : File that was scanned, results : scan results } */
							if (aResults && aResults.length) {
								var aRes = [];
								_.forEach(aResults, function (element) { // doing the _.forEach and NOT _.deepClone since deepClone will cost heavily on document object
									var fullPath = that._getFullPath(element.document);
									var obj = {
										document: fullPath,
										result: element.result
									};
									aRes.push(obj);
								});
								that._fireIssuesOnSingleFileUpdate(aRes); //no wrapping before firing the event since this method works on multi files, and this moves to the server
							}
						}).done();
					}
				});
			});
		},

		_sortDocumentsByValidator: function (aDocuments) {
			var oSortedDocuments = {};
			return this._handleArrayOfDocumentsToValidation(oSortedDocuments, aDocuments).then(function () {
				return oSortedDocuments;
			});
		},

		_handleArrayOfDocumentsToValidation: function (oSortedDocuments, aDocuments) {
			var aPromises = [];
			var that = this;
			_.each(aDocuments, function (oDocuemnt) {
				aPromises.push(that._handleMultipleValidation(oSortedDocuments, oDocuemnt));
			});
			return Q.all(aPromises);
		},

		_handleMultipleValidation: function (oSortedDocuments, oDocuemnt) {
			var type = oDocuemnt.getEntity().getType();
			var that = this;
			if (type === "file") {
				return this._handleSingleFileValidation(oSortedDocuments, oDocuemnt);
			} else {
				//folder
				return oDocuemnt.getFolderContent().then(function (aDocuments) {
					return that._handleArrayOfDocumentsToValidation(oSortedDocuments, aDocuments);
				});
			}
		},

		_handleSingleFileValidation: function (oSortedDocuments, oDocument) {
			var sFileExtension = oDocument.getEntity().getFileExtension();
			return this._getValidatorServiceForExtension(sFileExtension, oDocument).then(function (oValidator) {
				if (oValidator) {
					var sValidatorId = oValidator.serviceID;
					var aSpecificArray = oSortedDocuments[sValidatorId];
					if (!aSpecificArray) {
						oSortedDocuments[sValidatorId] = [];
					}
					oSortedDocuments[sValidatorId].push(oDocument);
				}
			});
		},

		_getDefaultValidator: function (oDoc) {
			var aAllValidators = this._getAllValidators(oDoc);
			if (_.isArray(aAllValidators) && aAllValidators.length > 0) {
				//TODO this approach chooses the first validator
				return aAllValidators[0];
			}
		},

		_getAllValidators: function (oDoc) {
			var aValidatorsList = this._getLangConfiguredServices();
			var fileExtension = oDoc.getEntity().getFileExtension();
			return aValidatorsList[fileExtension];
		},

		_getCurrentProjectValidatorSetting: function (oDoc) {
			return this.context.service.setting.project.get(this.context.self, oDoc);
		},

		getProjectValidationConfiguration: function (serviceId) {
			return this.context.service.setting.project.get(this.context.self)
				.then(function (projectValidators) {
					if (projectValidators) {
						for (var i = 0; i < projectValidators.length; i++) {
							if (projectValidators[i].validatorID === serviceId) {
								return projectValidators[i];
							}
						}
					}
					return {};
				});
		},

		getValidatorsList: function (fileExtension, oProjectDoc) {
			return this._getCurrentProjectValidatorSetting(oProjectDoc)
				.then(
				function (projectValidator) {
					var oServices = {};
					if (projectValidator && projectValidator.services) {
						oServices = projectValidator.services;
					}
					var sDeafaultServiceId = oServices[fileExtension];
					var validators = [];
					if (fileExtension && _langConfiguredServices[fileExtension]) {
						var fileExtensionServicesProperties = _langConfiguredServices[fileExtension];
						for (var i = 0; i < fileExtensionServicesProperties.length; i++) {
							var props = fileExtensionServicesProperties[i];
							var sServiceId = props.serviceID;
							var oValidatorData = {
								"displayName": props.displayName,
								"serviceID": sServiceId
							};
							if (sServiceId === sDeafaultServiceId) {
								validators.unshift(oValidatorData);
							} else {
								/* temp until legal issues resolved- if we are not in internal mode- do not expose fiori js or xml validator */
								if (oValidatorData.serviceID === "fioriJsValidator" || oValidatorData.serviceID === "fioriXmlAnalysis") {
									if (sap.watt.getEnv("internal")) {
										validators.push(oValidatorData);
									}
								} else {
									validators.push(oValidatorData);
								}
							}
						}
					}
					return validators;
				});
		},

		getRulesConfigurationTemplate: function () {
			return {
				eslintConfig: {
					rules: {}
				},
				rulesExt: {}
			};
		},

		getCurrentValidatorServiceProxyById: function (serviceID) {
			var that = this;
			if (!serviceID) {
				return null;
			}
			var oValidatorService = that._getValidatorServiceById(serviceID);
			if (!oValidatorService || !oValidatorService.service || !oValidatorService.serviceProxy) {
				return null;
			}
			var oServiceProxy = oValidatorService.serviceProxy;
			return oServiceProxy;
		},

		getCurrentValidatorServiceProxyByExtension: function (fileExtension, projectDoc) {
			var that = this;
			return that._getValidatorServiceForExtension(fileExtension, projectDoc).then(function (oValidatorService) {
				if (!oValidatorService || !oValidatorService.service || !oValidatorService.serviceProxy) {
					return null;
				}
				return oValidatorService.serviceProxy;
			});
		},

		_validateContext: function (serviceId, docFullPath, oDocContent, mergedProjectConfiguration, currentServicePath, oCustomRules) {
			var context = {
				serviceId: serviceId,
				docFullPath: docFullPath,
				oDocContent: oDocContent,
				mergedProjectConfiguration: mergedProjectConfiguration,
				currentServicePath: currentServicePath,
				oCustomRules: oCustomRules
			};
			return context;
		},

		_getValidatorServiceForDocument: function (oDoc) {
			var that = this;
			var entityFileExtension = oDoc.getEntity().getFileExtension();
			//read project json
			return that._getValidatorServiceForExtension(entityFileExtension, oDoc);
		},

		_getValidatorServiceForExtension: function (fileExtension, oDoc) {
			var that = this;
			//get the services list for the extension:
			var configServiceExtensionList = _langConfiguredServices[fileExtension];
			if (configServiceExtensionList) {
				//read project json
				return that._getCurrentProjectValidatorSetting(oDoc).then(
					function (projectValidatorServices) {
						if ((!projectValidatorServices || !projectValidatorServices[that._sServices] || !projectValidatorServices[that._sServices][fileExtension])) {
							return that._getValidatorServiceById(configServiceExtensionList[0].serviceID);
						} else {
							for (var i = 0; i < configServiceExtensionList.length; i++) {
								if (configServiceExtensionList[i].serviceID ===
									projectValidatorServices[that._sServices][fileExtension]) {
									return that._getValidatorServiceById(configServiceExtensionList[i].serviceID);
								}
							}
						}
					},// TODO: check why an error is thrown if no project settings exists,
					function onError(error) {
						return that._getValidatorServiceById(configServiceExtensionList[0].serviceID);
					});
			}
			return Q();
		},

		onSelectionChanged: function (oEvent) {
			var that = this;
			var oDoc = that._getSelectedDocument(oEvent.params.selection);
			if (!oDoc) {
				return Q();
			}
			var type = oDoc.getEntity().getType();
			if (type === "file") {
				var oOwner = oEvent.params.owner;
				if (!oOwner.instanceOf(_ACE_EDITOR)) {
					return Q();
				}
				that._EditorInstance = oOwner;
				return Q.all([this._getCurrentLintingSettings(),
					that._getValidatorServiceForDocument(oDoc)]).spread(function (userSettings, oValidatorService) {
					return that._validateAFile(oValidatorService, oDoc, userSettings);
				});
			} else { //folder
				//return that.validate([oDoc]);
			}
		},

		_validateAFile: function (oValidatorService, oDoc, userSettings) {
			var that = this;
			if (!oValidatorService || !oValidatorService.service || !oValidatorService.serviceProxy) {
				return Q();
			}
			return that._getProject(oDoc).then(function (project) {
				if (!project) {
					return Q();
				}
				var projectPath = that._getFullPath(project);
				var validatorProxy = oValidatorService.serviceProxy;
				return rulesManager.get(that.context, validatorProxy, projectPath)
					.then(function (rulesManagerInst) {
						return rulesManagerInst.getRulesForAnnotations(userSettings.filterLevel.value).then(function (mergedProjectConfiguration) {
							return that._validate(oValidatorService, rulesManagerInst, oDoc, mergedProjectConfiguration);
						}).fail(function (err) {
							that.context.service.log.warn("Code Chek failed for file " + that._getFullPath(oDoc), err.message, ["user"]).done();
							return Q();
						});
					});
			});
		},

		onDocumentSaved: function (oEvent) {
			var that = this;
			var oDoc = oEvent.params.document;
			return Q.all([this._getCurrentLintingSettings(),
				that._getValidatorServiceForDocument(oDoc)]).spread(function (userSettings, oValidatorService) {
				if (userSettings && userSettings.trigger === "onSave") {
					if (oEvent && oEvent.params && oEvent.params.document) {
						return that._documentHandler(oValidatorService, oDoc, userSettings);
					}
				}
			});
		},

		_getValidationMode: function (oDoc, oValidatorService) {
			var sFileExtension = oDoc.getEntity().getFileExtension().toLowerCase();
			if (sFileExtension === "js" || (oValidatorService && oValidatorService.syncExec === false)) {
				return VALIDATION_MODE_WORKER;
			}
			return VALIDATION_MODE_SYNC;
		},


		onDocumentChanged: function (oEvent) {
			var that = this;
			var oDoc = oEvent.params.document;
			if (!oDoc || oEvent.params.changeType !== "content") {
				return;
			} else {
				return that._getCurrentDocumentInContent().then(function (oDocumentInContent) {
					if (oDoc === oDocumentInContent) {
						return Q.spread([
								that._getCurrentLintingSettings(),
								that._getValidatorServiceForDocument(oDoc)
							],
							function (userSettings, oValidatorService) {
								if (oValidatorService && userSettings.trigger === "onChange") {
									if (that._getValidationMode(oDocumentInContent, oValidatorService) === VALIDATION_MODE_SYNC) {
										DelayedValidationManager.clearValidationCycleTimeout(oDocumentInContent);
										DelayedValidationManager.runDelayedValidation(oValidatorService, oDocumentInContent, userSettings, that._documentHandler, that);
									} else {
										that._documentHandler(oValidatorService, oDocumentInContent, userSettings).done();
									}
								}
							});
					}
				});
			}
		},

		validatorConfigurationsChangeHandler: function (sProjectPath) {
			var that = this;
			return that.context.service.document.getDocumentByPath(sProjectPath).then(function (oDoc) {
				return Q.all([that._getCurrentLintingSettings(),
					that._getValidatorServiceForDocument(oDoc)]).spread(function (userSettings, oValidatorService) {
					return that._documentHandler(oValidatorService, oDoc, userSettings);
				});
			});
		},

		getIssuesWrappedForProblems: function (ObjToExplore, path) {
			var wrappedIssues = [];
			if (path) {
				//This is the result object from client's single file validation
				wrappedIssues.push({document: path, result: ObjToExplore});
			} else {
				//this is a result object from server's workspace validations
				_.forEach(ObjToExplore, function (issuesObj, pathKey) {
					if (pathKey && issuesObj.issues) {
						wrappedIssues.push({document: pathKey, result: issuesObj});
					}
				});
			}
			return wrappedIssues;
		},

		getProjectsValidatorsConfiguration: function () {
			var aConfiguredExtensions = [], that = this;
			for (var property in _langConfiguredServices) {
				if (_langConfiguredServices.hasOwnProperty(property)) {
					aConfiguredExtensions.push(property);
				}
			}
			if (aConfiguredExtensions.length) {
				return this.context.service.filesystem.documentProvider.getRoot()
					.then(function (oRoot) {
						return oRoot.getFolderContent()
							.then(function (aFoldersDocuments) {
								var aPromises = [];
								//every project will have its own: extensions, validators per extensions, validator-configuration per project
								return that._buildPromisesArrForProjectValidatorsStruct(aFoldersDocuments, aConfiguredExtensions, aPromises).then(function () {
									return Q.all(aPromises)
										.then(function (allResultConfigs) {
											//creating the validators array per extension for the first and only time.
											var _projectsValidationConfig = {};
											return that._getProjectsInfo(aConfiguredExtensions).then(function (_oProjectInfo) {
												var oProjectsInfoAndConfig = {};
												_.forEach(allResultConfigs, function (resultConfig) {
													_projectsValidationConfig[resultConfig.projectPath] = _projectsValidationConfig[resultConfig.projectPath] || {};
													_projectsValidationConfig[resultConfig.projectPath][resultConfig.fileExtention] = _projectsValidationConfig[resultConfig.projectPath][resultConfig.fileExtention] || [];
													_projectsValidationConfig[resultConfig.projectPath][resultConfig.fileExtention].push(resultConfig);
												});
												oProjectsInfoAndConfig = _.merge(_oProjectInfo, _projectsValidationConfig);
												return oProjectsInfoAndConfig;
											});

										});
								});
							});
					});
			}
		},

		_getProjectsInfo: function (aConfiguredExtensions) {
			var that = this;
			var oProjectsInfo = {};
			return this.context.service.filesystem.documentProvider.getRoot()
				.then(function (oRoot) {
					return oRoot.getFolderContent()
						.then(function (aFoldersDocuments) {
							if (aFoldersDocuments) {
								return that._getProjectsSection(aFoldersDocuments).then(function (oProjectSection) {
									return that._getValidatorsSection(aFoldersDocuments, aConfiguredExtensions).then(function (oValidateSection) {
										var sMetadataKey = "/.";
										oProjectsInfo[sMetadataKey] = _.merge(oProjectSection, oValidateSection);
										return oProjectsInfo;
									});
								});
							}
						});
				});
		},

		_getProjectsSection: function (aFoldersDocuments) {
			var that = this;
			var oSection = {
				"projects": {}
			};
			var pPromises = [];
			_.forEach(aFoldersDocuments, function (oProject) {
				pPromises.push(that._getProjectTypes(oProject));
			});
			return Q.all(pPromises).then(function (aProjectTypes) {
				_.forEach(aProjectTypes, function (oProjectType) {
					_.mapKeys(oProjectType, function (value, key) {
						oSection.projects[key] = value;
					});
				});
				return oSection;
			});
		},

		_getProjectTypes: function (oProject) {
			var that = this;
			var oProjectSection = {};
			var sProjectTypeKey = "projectTypes";
			return that.context.service.projectType.getProjectTypes(oProject).then(function (aProjectTypes) {
				var sProjectName = oProject.getEntity().getName();
				oProjectSection[sProjectName] = {};
				oProjectSection[sProjectName][sProjectTypeKey] = [];
				_.forEach(aProjectTypes, function (oProjectType) {
					oProjectSection[sProjectName][sProjectTypeKey].push(oProjectType.id);
				});
				return oProjectSection;
			});
		},

		_getValidatorsSection: function (aFoldersDocuments, aConfiguredExtensions) {
			var that = this;
			var oValidateSection = {
				"validators": {}
			};
			var aPromises = [];
			_.forEach(aFoldersDocuments, function (oProject) {
				for (var i = 0; i < aConfiguredExtensions.length; i++) {
					aPromises.push(that._getValidatorServiceForExtension(aConfiguredExtensions[i], oProject));
				}
			});
			return Q.all(aPromises).then(function (oValidatorsInfo) {
				var pValidatorsPromises = [];
				_.forEach(oValidatorsInfo, function (oValidatorInfo) {
					//if (typeof(oValidatorInfo.service.getConfigurationProperties) === "function") {
					pValidatorsPromises.push(that._getValidatorServiceInfo(oValidatorInfo.service));
					//}
				});
				return Q.all(pValidatorsPromises).then(function (aConfigurationProperties) {
					_.forEach(aConfigurationProperties, function (oConfigurationProperties) {
						if (!_.isEmpty(oConfigurationProperties[1])) {
							var sValidatorName = oConfigurationProperties[0];
							var aValidatorSchema = oConfigurationProperties[1];
							oValidateSection.validators[sValidatorName] = {
								"metadata": aValidatorSchema
							};
						}
					});
					return oValidateSection;
				});
			});

		},

		_getValidatorServiceInfo: function (oService) {
			var sName = oService._sName;
			if (oService.instanceOf("sap.watt.common.service.editor.PortableValidator")) {
				return oService.getMetadata().then(function (oConfigurationProperties) {
					return [sName, oConfigurationProperties];
				});
			}
			return Q({});
		},

//builds the initial structure of the object representing all the workspace's projects. Every project will have its own file extensions configured, and its validator service
		_buildPromisesArrForProjectValidatorsStruct: function (aFoldersDocuments, aConfiguredExtentions, aPromises) {
			var that = this;
			return that._getCurrentLintingSettings().then(function (oUserSettings) {
				_.forEach(aFoldersDocuments, function (project) {
					var projectPath = project.getEntity().getFullPath();
					for (var i = 0; i < aConfiguredExtentions.length; i++) {
						aPromises.push(
							that._getValidatorServiceForExtension(aConfiguredExtentions[i], project)
								.then($.proxy(function (iterationExtention, iterationProject, validationService) {
									var projExtensionService = {
										validator: validationService,
										projectPath: iterationProject,
										fileExtention: iterationExtention
									};
									return rulesManager.get(that.context, projExtensionService.validator.serviceProxy, projExtensionService.projectPath)
										.then($.proxy(function (projExtensionServiceInfo, rulesManagerInst) {
											return rulesManagerInst.getCustomRulesPath()
												.then(function (customeRulesPath) {
													return rulesManagerInst.getRulesForAnnotations(oUserSettings.filterLevel.value)
														.then(function (validatorForProjectMergedconfiguration) {
															return {
																projectPath: projExtensionServiceInfo.projectPath,
																fileExtention: projExtensionServiceInfo.fileExtention,
																validator: projExtensionServiceInfo.validator.serviceID,
																validatorConfiguration: validatorForProjectMergedconfiguration,
																customRulesPath: customeRulesPath
															};
														});
												});
										}, that, projExtensionService));
								}, this, aConfiguredExtentions[i], projectPath)
							));
					}
				});
			});
		},

		_getCurrentLintingSettings: function () {
			return this.context.service.validatorusersettings.getCurrentLintingSettings();
		},

		_getCurrentDocumentInContent: function () {
			return this.context.service.content.getCurrentDocument();
		},

		_documentHandler: function (oValidatorService, oDocument, oUserSettings) {
			var that = this;
			if (!oValidatorService || !oValidatorService.service || !oValidatorService.serviceProxy) {
				return Q();
			}
			return that._getProject(oDocument).then(function (project) {
				if (!project) {
					return Q();
				}
				var projectPath = that._getFullPath(project);
				return that.context.service.selection.getOwner()
					.then(function (oCurrentEditorInstance) {
						if (oCurrentEditorInstance && oCurrentEditorInstance.instanceOf(_ACE_EDITOR)) {
							var oServiceProxy = oValidatorService.serviceProxy;
							that._EditorInstance = oCurrentEditorInstance;
							return rulesManager.get(that.context, oServiceProxy, projectPath).then(function (rulesManagerInst) {
								return rulesManagerInst.getRulesForAnnotations(oUserSettings.filterLevel.value).then(function (mergedProjectConfiguration) {
									if (oDocument && oDocument.getEntity()) {
										return that._validate(oValidatorService, rulesManagerInst, oDocument, mergedProjectConfiguration);
									}
								}).fail(function (err) {
									that.context.service.log.warn("Code Chek failed for file " + that._getFullPath(oDocument), err.message, ["user"]).done();
									return Q();
								});
							});
						}
					});
			});
		},

		_getSelectedDocument: function (aSelection) {
			var oDoc = null;
			if (!aSelection || aSelection.length === 0) {
				return oDoc;
			}
			aSelection.map(function (sel) {
				if (sel && sel.document) {
					oDoc = sel.document;
				}
			});
			return oDoc;
		},

		_getProject: function (oDoc) {
			if (oDoc) {
				return oDoc.getProject();
			}
		},

		_fireIssuesOnSingleFileUpdate: function (aDocsIssueObjs) {
			var arr = _.cloneDeep(aDocsIssueObjs);
			this.context.event.fireIssuesOnSingleFileUpdate({
				validationsResults: arr
			}).done();
		},

		_validate: function (oValidatorService, rulesManagerInst, oDocument, mergedProjectConfiguration) {
			if (!oValidatorService || !oValidatorService.service || !oValidatorService.serviceProxy) {
				return Q();
			}
			var that = this;
			return oDocument.getContent().then(function (oDocContent) {
				var sDocExtension = oDocument.getEntity().getFileExtension();
				return that._skipValidation(oDocContent, sDocExtension).then(function (bSkipValidation) {
					if (!bSkipValidation) {
						return rulesManagerInst.getCustomRulesPath()
							.then(function (sCustomRulesPath) {
								that._customRulesPath = sCustomRulesPath;
								var docFullPath = that._getFullPath(oDocument);
								if (that._getValidationMode(oDocument, oValidatorService) === VALIDATION_MODE_SYNC) {
									return oValidatorService.service.getCustomRulesContent(that._customRulesPath)
										.then(function (oCustomRules) {
											return oValidatorService.service.getIssuesSynchronously(oDocContent, mergedProjectConfiguration, docFullPath,
												oCustomRules)
												.then(function (issues) {
													var aProblemsWrapp = that.getIssuesWrappedForProblems(issues, docFullPath);
													that._fireIssuesOnSingleFileUpdate(aProblemsWrapp);
													return that._doUpdateAnnotations(oDocContent, issues, {
														document: oDocument,
														editor: that._EditorInstance
													});
												});
										});
								} else {
									return that._createWorker(oValidatorService, oDocument, oDocContent, mergedProjectConfiguration, that._customRulesPath);
								}
							});
					}
				});
			});
		},

		_skipValidation: function (oContent, sFileExtension) {
			var that = this;
			if (that._maxLineLength && sFileExtension === "js" || sFileExtension === "json") {
				var aLines = oContent.split("\n");
				if (aLines && aLines.length > 0) {
					// searches for too long line depends on configured length
					var longLineIndex = _.findIndex(aLines, function (sLine) {
						return sLine.length > that._maxLineLength;
					});
					// returns the first line number that is too long, else returns -1
					return Q(longLineIndex !== -1);
				}
			}
			// if max line length isn't configured or the file type is xml, don't skip validation
			return Q(false);
		},

		_doUpdateAnnotations: function (oDocContent, issues, editorRef) {
			var that = this;
			return _annotationsHelper.updateAnnotations(that.context.service.content, oDocContent, issues, editorRef).fail(function () {
				that.context.service.log.warn("failed to clear or set annoatations", e.message, ["user"]).done();
			});
		},

		_getFullPath: function (oDocument) {
			var fullPath = null;
			if (oDocument !== undefined && oDocument) {
				fullPath = oDocument.getEntity().getFullPath();
			}
			return fullPath;
		},

		_getDeltaConfiguration: function () {
			return {};
		},

		_createWorker: function (oValidatorService, oDocument, oDocContent, mergedProjectConfiguration, customRulesPath) {
			var that = this;
			var oContext = null;
			var _customRulesPath = customRulesPath;
			//initialize worker
			var docFullPath = this._getFullPath(oDocument);
			return oValidatorService.serviceProxy.getCurentValidatorServiceIdentifier().then(function (serviceId) {
				if (!_workerHelper) {
					var sWorkerPath = require.toUrl("sap.watt.ideplatform.basevalidator/util/ValidationWorker.js");
					return workerHelper(that.context, sWorkerPath,
						function (oEvent) {
							var aProblemsWrapp = that.getIssuesWrappedForProblems(oEvent.data.result, oEvent.data.docFullPath);
							that._fireIssuesOnSingleFileUpdate(aProblemsWrapp);
							return that._geEditorContentByDocPath(oEvent.data.docFullPath, "aceeditor").then(function (editorContent) {
								var oService = that._getValidatorServiceById(oEvent.data.serviceId);
								var oServiceProxy = oService.serviceProxy;
								return oServiceProxy.postValidate(oEvent.data.result).then(function (oResult) {
									if (oResult && oResult.isDefault === "true") {
										return that._doUpdateAnnotations(oEvent.data.validatedContent, oEvent.data.result,
											editorContent);
									} else {
										return that._doUpdateAnnotations(oEvent.data.validatedContent, oResult, editorContent);
									}
								});
							}).done();
						},
						function (e) {
							that.context.service.log.warn("Code Chek failed for file " + e.data.docFullPath, e.message, ["user"]).done();
							return that._geEditorContentByDocPath(e.data.docFullPath, "aceeditor").then(function (editorContent) {
								return that._doUpdateAnnotations(e.data.validatedContent, e.data.result || {}, editorContent);
							}).done();
						})
						.then(function (oWorkerHelper) {
							_workerHelper = oWorkerHelper;
							return Q.all([oValidatorService.service.getPathToImplementationModule(), oValidatorService.service.getCustomRulesContent(
								_customRulesPath)])
								.spread(function (path, oCustomRules) {
									oContext = that._validateContext(serviceId, docFullPath, oDocContent, mergedProjectConfiguration, path, oCustomRules);
									_workerHelper.doOperation("validate", oContext);
								});
						});
					//already initialized
				} else {
					return Q.all([oValidatorService.service.getPathToImplementationModule(), oValidatorService.service.getCustomRulesContent(
						_customRulesPath)])
						.spread(function (path, oCustomRules) {
							oContext = that._validateContext(serviceId, docFullPath, oDocContent, mergedProjectConfiguration, path, oCustomRules);
							_workerHelper.doOperation("validate", oContext);
						});
				}
			});
		},

		_geEditorContentByDocPath: function (docFullPath, editorType) {
			var that = this;
			return that.context.service.document.getDocumentByPath(docFullPath)
				.then(function (oDocument) {
					if (!oDocument) {
						return Q();
					}
					return {
						document: oDocument,
						editor: that._EditorInstance
					};
				});
		},

		_getLangConfiguredServices: function () {
			return _langConfiguredServices;
		},

		_setLangConfiguredServices: function (oConfigurations) {
			_langConfiguredServices = oConfigurations;
		}
	};
});
