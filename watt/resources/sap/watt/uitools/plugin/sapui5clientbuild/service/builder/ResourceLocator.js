define([], function() {
	"use strict";

	function listResources(bFromTarget) {
		var that = this;
		var sFolderPath = bFromTarget ? this.sTargetFolderPath : this.sSourceFolderPath;
		return this.oContext.service.document.getDocumentByPath(sFolderPath).then(function(oFolderDocument) {
			if (oFolderDocument) {
				return oFolderDocument.getCurrentMetadata(true);
			} else {
				throw new Error(that.oContext.i18n.getText("i18n", "builder_no_source_folder", sFolderPath));
			}
		});
	}

	function writeResource(sPreloadObjectPath, sPreloadObjectContent) {
		var oResource = {
			preloadObjectPath: sPreloadObjectPath,
			preloadObjectContent: sPreloadObjectContent
		};
		this.aWrittenResources.push(oResource);

	}

	function getWrittenResources() {
		return this.aWrittenResources;
	}
	
	function getDocumentContentByPath(sFullPath){
		var oDeferred = Q.defer();
		var oContent = this.oContext.service.document.getDocumentByPath(sFullPath).then(function(oDocument){
			return oDocument.getContent();
		});
		oDeferred.resolve(oContent);
		return oDeferred.promise;
	}

	function getResourcePath(sFullPath) {
		return sFullPath.substring(this.sSourceFolderPath.length);
	}

	function ResourceLocator(oProjectDocument, oContext, sSourceFolderPath, sTargetFolderPath) {
		this.oProjectDocument = oProjectDocument;
		this.oContext = oContext;
		this.sSourceFolderPath = sSourceFolderPath;
		this.sTargetFolderPath = sTargetFolderPath;
		this.aWrittenResources = [];
	}

	ResourceLocator.prototype = {
		listResources: listResources,
		writeResource: writeResource,
		getWrittenResources: getWrittenResources,
		getResourcePath: getResourcePath,
		getDocumentContentByPath: getDocumentContentByPath
	};

	return {
		ResourceLocator: ResourceLocator
	};
});