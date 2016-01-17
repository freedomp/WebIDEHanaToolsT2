define(["sap/watt/platform/plugin/utils/xml/XmlUtil"], function(XmlUtil) {

	var BasicUtil = function(sTestId, dTestModuleTimeStamp, oService, oOptions) {
		this._sTestId = sTestId;
		this._sTestProjectName = "";
		this._dTestModuleTimeStamp = dTestModuleTimeStamp;
		this._oOptions = oOptions;
		this._oService = oService;
	};

	BasicUtil.prototype.getTestProjectName = function() {
		return this._sTestProjectName;
	};

	BasicUtil.prototype.initializeTestProject = function() {
		this._sTestProjectName = this._buildProjectName(this._sTestId);
		return this._createProject();
	};

	BasicUtil.prototype.findDocumentInArray = function(aDocuments, sName) {
		for (var i = 0; i < aDocuments.length; i++) {
			if (aDocuments[i].getEntity().getName() === sName) {
				return aDocuments[i];
			}
		}
	};

	BasicUtil.prototype.getProjectName = function() {
		return this._sTestProjectName;
	};

	BasicUtil.prototype.build = function(oProjectDocument) {
		return this._oService.builder.build(oProjectDocument);
	};

	BasicUtil.prototype.isBuildRequired = function(oProjectDocument) {
		return this._oService.builder.isBuildRequired(oProjectDocument);
	};

	BasicUtil.prototype.isBuildSupported = function(oProjectDocument) {
		return this._oService.builder.isBuildSupported(oProjectDocument);
	};

	BasicUtil.prototype.getTargetFolder = function(oProjectDocument) {
		return this._oService.builder.getTargetFolder(oProjectDocument);
	};

	BasicUtil.prototype.getFileFolder = function(sFileFolderName) {
		var sFilePath = "/" + this.getProjectName() + "/" + sFileFolderName;
		return this._oService.filesystemDocumentProvider.getDocument(sFilePath);
	};

	BasicUtil.prototype.deleteTestProject = function() {

		var that = this;
		var sTestProjectName = this._sTestProjectName;

		return this._oService.filesystemDocumentProvider.getRoot().then(function(oRootDocument) {
			return oRootDocument.getFolderContent();
		}).then(function(aResult) {
			if (aResult) {
				var oFileDocument = that.findDocumentInArray(aResult, sTestProjectName);
				if (oFileDocument) {
					return oFileDocument.delete();
				}
			}
		});
	};

	BasicUtil.prototype._buildProjectName = function() {
		return "TestProject_" + this._dTestModuleTimeStamp + "_" + this._sTestId;

	};

	BasicUtil.prototype._createProject = function() {
		var that = this;
		var oModel = this._oOptions.model;
		oModel.projectName = this._sTestProjectName;

		return that._oService.template.getTemplates().then(function(mTemplates) {
			var oSelectedTemplate = mTemplates[that._oOptions.templateId];
			var aProjectTypes = oSelectedTemplate.getSupportedProjectTypes();
			var mAttributes = {
				generation: {
					templateId: oSelectedTemplate.getId(),
					templateVersion: oSelectedTemplate.getVersion(),
					dataTimeStamp: new Date().toUTCString()
				}
			};
			var aFirstProjectTypes = (aProjectTypes && aProjectTypes.length > 0) ? aProjectTypes[0] : undefined;
			var oData = {};
			oData.name = that._sTestProjectName;
			oData.type = aFirstProjectTypes;
			oData.attributes = mAttributes;
			return that._oService.filesystemDocumentProvider.getRoot().then(function(oRootDocument) {
				return oRootDocument.createProject(oData).then(function(oProjectFolderDocument) {
					//return oRootDocument.create(that._sTestProjectName).then(function(oProjectFolderDocument) {
					return that._oService.generation.generate(that._sTestProjectName, mTemplates[that._oOptions.templateId], oModel,
						true, oProjectFolderDocument).then(function() {

						var aSettingsPromises = [];

						//Set build project type
						if (that._oOptions.projectTypeId) {
							aSettingsPromises.push(that._oService.projectType.setProjectTypes(oProjectFolderDocument, [that._oOptions.projectTypeId])
								.then(function() {
									return oProjectFolderDocument;
								}));
						}

						//Set build settings in .project.json
						if (that._oOptions.buildSettings) {
							aSettingsPromises.push(that._oService.settingProject.setProjectSettings("build", that._oOptions.buildSettings,
								oProjectFolderDocument));
						}
						return Q.all(aSettingsPromises).then(function() {
							return oProjectFolderDocument;
						});
					});
				});
			});
		});
	};

	return BasicUtil;
});