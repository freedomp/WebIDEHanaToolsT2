define(function() {

	"use strict";

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
		return this._generateProject();
	};
	BasicUtil.prototype.initializeSpecialTestProject = function(oConfig) {
		var that = this;
		this._sTestProjectName = this._buildProjectName();
		return this._getTemplate().then(function(oTemplate){
			oTemplate._mConfig[oConfig.param] = oConfig.value;
			return that._generateProjectForTemplate(oTemplate);
		});
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

	BasicUtil.prototype.getFileFolder = function(sFileFolderName) {
		var sFilePath = "/" + this.getProjectName() + "/" + sFileFolderName;
		return this._oService('filesystem.documentProvider').getDocument(sFilePath);
	};

	BasicUtil.prototype.deleteTestProject = function() {

		var that = this;
		var sTestProjectName = this._sTestProjectName;

		return this._oService('filesystem.documentProvider').getRoot().then(function(oRootDocument) {
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
	BasicUtil.prototype._getTemplate = function() {
		var that = this;
		var oModel = this._oOptions.model;
		oModel.projectName = this._sTestProjectName;
		var oServiceTemplate = this._oService('template');

		return oServiceTemplate.getTemplate(that._oOptions.templateId,that._oOptions.templateVersion).then(function(oSelectedTemplate) {
					return oSelectedTemplate;
		});
	};
	BasicUtil.prototype._generateProjectForTemplate = function(oSelectedTemplate) {
		var that = this;
		var oModel = this._oOptions.model;
		oModel.projectName = this._sTestProjectName;
		var oServiceGeneration = this._oService('generation');

		return oServiceGeneration.generateProject("/" + that._sTestProjectName, oSelectedTemplate, oModel,true)
			.then(function(oProjectFolderDocument) {
					return oProjectFolderDocument;
			});
	};

	BasicUtil.prototype._generateProject = function() {
		var that = this;
		var oModel = this._oOptions.model;
		oModel.projectName = this._sTestProjectName;
		var oServiceTemplate = this._oService('template');
		var oServiceGeneration = this._oService('generation');

		return oServiceTemplate.getTemplate(that._oOptions.templateId,that._oOptions.templateVersion).then(function(oSelectedTemplate) {
			return oServiceGeneration.generateProject("/" + that._sTestProjectName, oSelectedTemplate, oModel,
				true).then(function(oProjectFolderDocument) {
					return oProjectFolderDocument;
				});
		});
	};

	return BasicUtil;
});