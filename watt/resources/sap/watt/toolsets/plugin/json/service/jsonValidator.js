define(["sap/watt/lib/lodash/lodash", "sap.watt.toolsets.json/adopters/isMyJsonValidAdopter", "sap.watt.toolsets.json/utils/json_parse"], function (_, isMyJsonValidAdopter, json_parse) {

	"use strict";
	var _mConfig;

	return {
		//this configuration variable is defined here and not outside the returning object, for testing purposes
		_projectTypesConf: {},

		configure: function (mConfig) {
			_mConfig = mConfig;
			if (!mConfig.jsonValidatorSchema || mConfig.jsonValidatorSchema.length === 0) {
				return;
			}
			var aPromises = [];
			mConfig.jsonValidatorSchema.forEach(function (validator) {
				if (validator) {
					if (!validator.projectType) {
						this._writeToLog("project type was not supplied");
						return;
					}
					if (!validator.fileNames || validator.fileNames.length === 0) {
						this._writeToLog("file names were not supplied for " + validator.projectType + " project Type");
						return;
					}
					if (!validator.schema) {
						this._writeToLog("schema was not supplied for " + validator.projectType + " project Type");
						return;
					} else {
						this._projectTypesConf[validator.projectType] = this._projectTypesConf[validator.projectType] || {};
						for (var i = 0; i < validator.fileNames.length; i++) {
							this._projectTypesConf[validator.projectType][validator.fileNames[i]] = validator.schema;
						}
					}
				}
			}, this);
		},

		_writeToLog: function (message) {
			this.context.service.log.error(this.context.service.jsonValidator.getProxyMetadata().getName(), message, ["user"]).done();
		},

		init: function () {
		},

		getMetadata: function () {
			var aJsonValidatorSchemas = {
				"jsonValidatorSchema": []
			};
			_.forEach(_mConfig.jsonValidatorSchema, function (oJsonValidatorSchema) {
				var oProjectType = _.cloneDeep(oJsonValidatorSchema.projectType);
				var oFileNames = _.cloneDeep(oJsonValidatorSchema.fileNames);
				var oSchemaModule = oJsonValidatorSchema.schema;
				aJsonValidatorSchemas.jsonValidatorSchema.push({
					"projectType": oProjectType,
					"fileNames": oFileNames,
					"schema": oSchemaModule._mConfig.module
				});
			});
			return aJsonValidatorSchemas;
		},

		getCustomRulesContent: function (path) {
			return {};
		},

		getIssues: function (sSource, oConfig, sFullPath) {

		},

		getIssuesSynchronously: function (sSource, oConfig, sFullPath) {
			var oSchemaIssuesResult;
			var that = this;
			var callbackFunc = function (source, result, locatorObject) {
				//getting here means the JSON has no syntax errors
				oSchemaIssuesResult = that.context.service.document.getDocumentByPath(sFullPath)
					.then(function (document) {
						if (document) {
							return that._isServiceRequire(document)
								.then(function (service) {
									if (service) {
										//a schema was provided for the projectType & fileName and the JSON wihtout syntax errors
										return isMyJsonValidAdopter.getIssues(result, service, locatorObject, sFullPath);
									} else {
										//no schema supplied for valid JSON
										return oResult;
									}
								});
						}
					});
			};
			var oResult = {
				"root": {},
				"issues": []
			};
			try {
				//check that the sSource is a valid JSON content
				json_parse(sSource, callbackFunc);
				return oSchemaIssuesResult;
			} catch (err) {
				oResult = {
					"root": {severity: "error"},
					"issues": [{
						category: "Syntax Error",
						checker: "",
						helpUrl: "",
						line: err.line,
						column: err.column,
						message: err.message,
						path: sFullPath,
						severity: "error",
						source: "",
						ruleId: ""
					}]
				};
				return oResult;
			}
		},

		getConfiguration: function (aFilters, defConfig, customConfiguration) {
			return {};
		},

		getPathToImplementationModule: function () {
			return "sap/watt/toolsets/plugin/json/service/jsonValidator";
		},

		getDefaultConfiguration: function () {
			return {};
		},

		//The method assumes that the content to validate comes from the editor - hense the document
		_isServiceRequire: function (document) {
			var that = this;
			if (that._projectTypesConf === {} || jQuery.isEmptyObject(document) || document === null) {
				return null;
			}
			return this.context.service.projectType.getProjectTypes(document)
				.then(function (aProjectTypes) {
					if (aProjectTypes) {
						var documentFileName = document.getEntity().getName();
						return that._findServiceForFileNameInProject(documentFileName, aProjectTypes);
					}
				});
		},

		_findServiceForFileNameInProject: function (documentFileName, aProjectTypes) {
			var docProjectType;
			for (var i = 0; i < aProjectTypes.length; i++) {
				docProjectType = aProjectTypes[i].id;
				if (docProjectType) {
					var oConfig = this._projectTypesConf[docProjectType];
					if (oConfig) {
						//configuration found for project Type
						if (oConfig.hasOwnProperty(documentFileName)) {
							//found The file name for the projectType, in the configuration 
							return this._projectTypesConf[docProjectType][documentFileName];
						}
					}
				}
			}
			return null;
		}
	};
});